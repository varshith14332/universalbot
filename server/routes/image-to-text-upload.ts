import type { RequestHandler } from "express";

const DEFAULT_MODEL = process.env.HF_IMAGE_TO_TEXT_MODEL || "Salesforce/blip-image-captioning-large";
const HF_API_BASE = "https://api-inference.huggingface.co/models";

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

    const model = (req.body?.model || DEFAULT_MODEL) as string;
    const url = `${HF_API_BASE}/${encodeURIComponent(model)}`;

    const upstream = await fetch(`${url}?wait_for_model=true`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "x-wait-for-model": "true",
      },
      body: file.buffer,
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      res.status(502).json({ error: "Hugging Face request failed", status: upstream.status, detail });
      return;
    }

    let caption = "";
    try {
      const data = await upstream.json();
      if (Array.isArray(data) && data.length) {
        const first = data[0];
        caption = (first?.generated_text || first?.caption || first?.summary_text || "").toString();
      }
      if (!caption || typeof caption !== "string") caption = JSON.stringify(data);
    } catch {
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
