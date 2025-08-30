import type { RequestHandler } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// Middleware exporter to reuse in index.ts
export const signUpload = upload.single("image");

async function classifyWithHF(
  buf: Buffer,
  contentType?: string,
): Promise<string | null> {
  const token =
    process.env.HF_TOKEN ||
    process.env.HUGGING_FACE_TOKEN ||
    process.env.HF_API_TOKEN;
  const model =
    process.env.HF_SIGN_MODEL ||
    "prithivMLmods/Alphabet-Sign-Language-Detection";
  if (!token) return null;
  const url = `https://api-inference.huggingface.co/models/${encodeURI(model)}?wait_for_model=true&use_cache=true`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": contentType || "application/octet-stream",
      "x-wait-for-model": "true",
    },
    body: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
  });
  if (!upstream.ok) return null;
  try {
    const data = await upstream.json();
    // Expected: [{label: "A", score: 0.99}, ...]
    if (Array.isArray(data) && data.length) {
      const best = data.reduce((a: any, b: any) => (a.score > b.score ? a : b));
      const label = (best?.label || "").toString().trim();
      return label || null;
    }
    return null;
  } catch {
    return null;
  }
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
        res.status(502).json({ error: "Sign server error", status: upstream.status, detail: json });
        return;
      }
      res.json(json);
      return;
    }

    // 2) Hugging Face fallback (image-classification)
    const label = await classifyWithHF(file.buffer, ct);
    if (label) {
      res.json({ sign_text: label });
      return;
    }

    res.status(502).json({ error: "Recognition unavailable" });
  } catch (e) {
    res.status(500).json({ error: "Proxy error" });
  }
};
