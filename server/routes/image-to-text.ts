import type { RequestHandler } from "express";

// Image captioning using Hugging Face Inference API
// Expects JSON body: { imageBase64: dataUrl | base64 string, model?: string }
// Env: HF_TOKEN (required), HF_IMAGE_TO_TEXT_MODEL (optional)

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const MODEL_PREFERENCE = [
  process.env.HF_IMAGE_TO_TEXT_MODEL,
  "Salesforce/blip-image-captioning-large",
  "nlpconnect/vit-gpt2-image-captioning",
  "microsoft/git-large-coco",
].filter(Boolean) as string[];

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
    const token = process.env.HF_TOKEN || process.env.HUGGING_FACE_TOKEN || process.env.HF_API_TOKEN;
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

    const preferred = MODEL_PREFERENCE.length ? MODEL_PREFERENCE : ["nlpconnect/vit-gpt2-image-captioning"];

    async function requestCaption(token: string, model: string, body: Buffer): Promise<string> {
      const url = `${HF_API_BASE}/${encodeURIComponent(model)}?wait_for_model=true&use_cache=true`;
      const upstream = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
          Accept: "application/json",
          "x-wait-for-model": "true",
        },
        body,
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

    let lastErr: any = null;
    for (const m of preferred) {
      try {
        const caption = (await requestCaption(token, m, buf)).trim();
        if (caption) {
          res.json({ caption, model: m });
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
