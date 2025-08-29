import type { RequestHandler } from "express";

// Image captioning using Hugging Face Inference API
// Expects JSON body: { imageBase64: dataUrl | base64 string, model?: string }
// Env: HF_TOKEN (required), HF_IMAGE_TO_TEXT_MODEL (optional)

const DEFAULT_MODEL = process.env.HF_IMAGE_TO_TEXT_MODEL || "flax-community/vit-gpt2-coco-en";
const HF_API_BASE = "https://api-inference.huggingface.co/models";

function parseDataUrl(dataUrl: string): Buffer | null {
  try {
    if (!dataUrl) return null;
    const m = dataUrl.match(/^data:.*;base64,(.*)$/);
    const base64 = m ? m[1] : dataUrl; // allow raw base64 too
    return Buffer.from(base64, "base64");
  } catch {
    return null;
  }
}

export const handleImageToText: RequestHandler = async (req, res) => {
  try {
    const token = process.env.HF_TOKEN || process.env.HUGGING_FACE_TOKEN;
    if (!token) {
      res.status(500).json({ error: "Missing Hugging Face token (HF_TOKEN)" });
      return;
    }

    const imageBase64 = (req.body?.imageBase64 || "") as string;
    const model = (req.body?.model || DEFAULT_MODEL) as string;
    if (!imageBase64) {
      res.status(400).json({ error: "Missing imageBase64" });
      return;
    }

    const buf = parseDataUrl(imageBase64);
    if (!buf?.length) {
      res.status(400).json({ error: "Invalid image data" });
      return;
    }

    const url = `${HF_API_BASE}/${encodeURIComponent(model)}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: buf,
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      res.status(502).json({ error: "Hugging Face request failed", status: upstream.status, detail });
      return;
    }

    // Response shape varies by model; handle common patterns
    let caption = "";
    try {
      const data = await upstream.json();
      if (Array.isArray(data) && data.length) {
        const first = data[0];
        caption = (first?.generated_text || first?.caption || first?.summary_text || "").toString();
      }
      if (!caption || typeof caption !== "string") caption = JSON.stringify(data);
    } catch {
      // Some endpoints can return plain text
      const txt = await upstream.text();
      caption = txt?.toString() || "";
    }

    caption = (caption || "").trim();
    if (!caption) {
      res.status(502).json({ error: "Empty caption result" });
      return;
    }

    res.json({ caption, model });
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error" });
  }
};
