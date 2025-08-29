import type { RequestHandler } from "express";

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const MODEL_PREFERENCE = [
  process.env.HF_IMAGE_TO_TEXT_MODEL,
  "Salesforce/blip-image-captioning-large",
  "nlpconnect/vit-gpt2-image-captioning",
  "microsoft/git-large-coco",
].filter(Boolean) as string[];

async function requestCaption(token: string, model: string, buf: Buffer): Promise<string> {
  const url = `${HF_API_BASE}/${encodeURIComponent(model)}?wait_for_model=true&use_cache=true`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      Accept: "application/json",
      "x-wait-for-model": "true",
    },
    body: buf,
  });
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    throw Object.assign(new Error(`HF ${upstream.status}`), { status: upstream.status, detail });
  }
  try {
    const data = await upstream.json();
    if (Array.isArray(data) && data.length) {
      const first = data[0];
      const cap = (first?.generated_text || first?.caption || first?.summary_text || "").toString();
      if (cap) return cap;
    } else if (data && typeof data === "object") {
      const cap = (data.generated_text || data.caption || data.summary_text || "").toString();
      if (cap) return cap;
    }
    return JSON.stringify(data);
  } catch {
    const txt = await upstream.text();
    return txt?.toString() || "";
  }
}

export const handleImageToTextUpload: RequestHandler = async (req, res) => {
  try {
    const token = process.env.HF_TOKEN || process.env.HUGGING_FACE_TOKEN || process.env.HF_API_TOKEN;
    if (!token) {
      res.status(500).json({ error: "Missing Hugging Face token (HF_TOKEN)" });
      return;
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file?.buffer?.length) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    const preferred = MODEL_PREFERENCE.length ? MODEL_PREFERENCE : ["nlpconnect/vit-gpt2-image-captioning"];
    let lastErr: any = null;
    for (const model of preferred) {
      try {
        const cap = (await requestCaption(token, model, file.buffer)).trim();
        if (cap) {
          res.json({ caption: cap, model });
          return;
        }
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    const status = (lastErr?.status as number) || 502;
    res.status(502).json({ error: "Hugging Face request failed", status, detail: lastErr?.detail || String(lastErr || "") });
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error" });
  }
};
