import type { RequestHandler } from "express";
import Tesseract from "tesseract.js";

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const MODEL_PREFERENCE = [
  process.env.HF_IMAGE_TO_TEXT_MODEL,
  "Salesforce/blip-image-captioning-large",
  "nlpconnect/vit-gpt2-image-captioning",
  "microsoft/git-large-coco",
].filter(Boolean) as string[];

async function requestCaption(
  token: string,
  model: string,
  buf: Buffer,
  contentType?: string,
): Promise<string> {
  const url = `${HF_API_BASE}/${encodeURI(model)}?wait_for_model=true&use_cache=true`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType || "application/octet-stream",
      Accept: "application/json",
      "x-wait-for-model": "true",
    },
    body: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
  });
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    throw Object.assign(new Error(`HF ${upstream.status}`), {
      status: upstream.status,
      detail,
    });
  }
  try {
    const data = await upstream.json();
    if (Array.isArray(data) && data.length) {
      const first = data[0];
      const cap = (
        first?.generated_text ||
        first?.caption ||
        first?.summary_text ||
        ""
      ).toString();
      if (cap) return cap;
    } else if (data && typeof data === "object") {
      const cap = (
        data.generated_text ||
        data.caption ||
        data.summary_text ||
        ""
      ).toString();
      if (cap) return cap;
    }
    return JSON.stringify(data);
  } catch {
    const txt = await upstream.text();
    return txt?.toString() || "";
  }
}

export const handleCaption: RequestHandler = async (req, res) => {
  try {
    const token =
      process.env.HF_TOKEN ||
      process.env.HUGGING_FACE_TOKEN ||
      process.env.HF_API_TOKEN;
    if (!token) {
      res.status(500).json({ error: "Missing Hugging Face token (HF_TOKEN)" });
      return;
    }
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file?.buffer?.length) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    // 1) OCR (english default here; can be parameterized)
    let detectedText = "";
    try {
      const ocr = await Tesseract.recognize(file.buffer, "eng");
      const text = (ocr?.data?.text || "").trim();
      const conf =
        typeof ocr?.data?.confidence === "number" ? ocr.data.confidence : 0;
      if (text && conf >= 60) detectedText = text;
    } catch {}

    // 2) Caption (try preferred models)
    const preferred = MODEL_PREFERENCE.length
      ? MODEL_PREFERENCE
      : ["nlpconnect/vit-gpt2-image-captioning"];
    const ct =
      file.mimetype && typeof file.mimetype === "string"
        ? file.mimetype
        : undefined;
    let hfCaption = "";
    for (const model of preferred) {
      try {
        const cap = (
          await requestCaption(token, model, file.buffer, ct)
        ).trim();
        if (cap) {
          hfCaption = cap;
          break;
        }
      } catch {
        continue;
      }
    }

    // 3) Combine
    let finalCaption = "";
    if (detectedText && hfCaption)
      finalCaption = `${hfCaption}\n\n${detectedText}`;
    else if (hfCaption) finalCaption = hfCaption;
    else if (detectedText) finalCaption = detectedText;
    else finalCaption = "No description or text found.";

    res.json({ caption: finalCaption });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate caption" });
  }
};
