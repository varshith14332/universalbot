import type { RequestHandler } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// Middleware exporter to reuse in index.ts
export const signUpload = upload.single("image");

async function classifyWithHF(
  buf: Buffer,
  contentType?: string,
): Promise<{ label: string | null; detail?: any }> {
  const token =
    process.env.HF_TOKEN ||
    process.env.HUGGING_FACE_TOKEN ||
    process.env.HF_API_TOKEN;
  if (!token) return { label: null, detail: "no_token" };
  const models = [
    process.env.HF_SIGN_MODEL,
    "prithivMLmods/Alphabet-Sign-Language-Detection",
    "aalof/clipvision-asl-fingerspelling",
    "ademaulana/CNN-ASL-Alphabet-Sign-Recognition",
  ].filter(Boolean) as string[];

  let lastDetail: any = null;
  for (const model of models) {
    const url = `https://api-inference.huggingface.co/models/${encodeURI(model)}?wait_for_model=true&use_cache=true`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": contentType || "application/octet-stream",
        "x-wait-for-model": "true",
      },
      body: buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      ) as ArrayBuffer,
    });
    let payload: any = null;
    if (!upstream.ok) {
      lastDetail = {
        status: upstream.status,
        text: await upstream.text().catch(() => ""),
      };
      continue;
    }
    try {
      payload = await upstream.json();
    } catch (e) {
      lastDetail = {
        error: "bad_json",
        text: await upstream.text().catch(() => ""),
      };
      continue;
    }

    // Normalize outputs
    let candidates: any[] = [];
    if (Array.isArray(payload)) candidates = payload;
    else if (Array.isArray(payload?.labels)) candidates = payload.labels;
    else if (Array.isArray(payload?.predictions))
      candidates = payload.predictions;

    if (candidates.length) {
      const best = candidates.reduce((a: any, b: any) =>
        Number(a.score || 0) > Number(b.score || 0) ? a : b,
      );
      let label = (
        best?.label ||
        best?.class ||
        best?.category ||
        ""
      ).toString();
      // Extract single A–Z letter from label
      const m = label.match(/[A-Z](?![a-z])/);
      if (m) label = m[0];
      label = label.trim();
      if (label) return { label };
    }
    lastDetail = { payload };
  }
  return { label: null, detail: lastDetail };
}

export const handleSignProxy: RequestHandler = async (req, res) => {
  try {
    const base = process.env.SIGN_SERVER_URL; // optional external server
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file?.buffer?.length) {
      if (req.is("application/octet-stream")) {
        // For raw streams, we cannot re-use easily here without buffering
        res.status(400).json({ error: "No image provided" });
        return;
      }
      res.status(400).json({ error: "No image provided" });
      return;
    }

    const ct =
      file.mimetype && typeof file.mimetype === "string"
        ? file.mimetype
        : "application/octet-stream";

    // 1) External sign server if configured
    if (base) {
      const upstream = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": ct },
        body: file.buffer as unknown as BodyInit,
      });
      const text = await upstream.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }
      if (!upstream.ok) {
        res
          .status(502)
          .json({
            error: "Sign server error",
            status: upstream.status,
            detail: json,
          });
        return;
      }
      res.json(json);
      return;
    }

    // 2) Hugging Face fallback (image-classification)
    const result = await classifyWithHF(file.buffer, ct);
    if (result.label) {
      res.json({ sign_text: result.label });
      return;
    }

    res
      .status(502)
      .json({
        error: "Recognition unavailable",
        detail: result.detail || null,
      });
  } catch (e) {
    res.status(500).json({ error: "Proxy error" });
  }
};
