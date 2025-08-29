import type { RequestHandler } from "express";

const DEFAULT_BASE = process.env.LIBRETRANSLATE_URL || "https://libretranslate.de";

export const handleDetectLang: RequestHandler = async (req, res) => {
  try {
    const text: unknown = req.body?.text;
    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Invalid text" });
      return;
    }

    const base = DEFAULT_BASE;

    // LibreTranslate expects JSON for /detect
    const response = await fetch(`${base}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      res.status(502).json({ error: "Upstream error", detail: body });
      return;
    }

    const detections = await response.json();
    // detections can be [{language:"en", confidence: 0.6}, ...]
    const list = Array.isArray(detections) ? detections : Array.isArray(detections?.detections) ? detections.detections : [];
    const top = list.reduce((a: any, b: any) => (a && a.confidence > b.confidence ? a : b), list[0]);

    res.json({ language: top?.language ?? null, confidence: top?.confidence ?? null });
  } catch {
    res.status(500).json({ error: "Unexpected server error" });
  }
};
