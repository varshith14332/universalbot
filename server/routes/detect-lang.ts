import type { RequestHandler } from "express";

const DEFAULT_BASE = "https://libretranslate.com";

export const handleDetectLang: RequestHandler = async (req, res) => {
  try {
    const text: unknown = req.body?.text;
    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Invalid text" });
      return;
    }

    const base = process.env.LIBRETRANSLATE_URL || DEFAULT_BASE;
    const params = new URLSearchParams();
    params.set("q", text);

    const response = await fetch(`${base}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      res.status(502).json({ error: "Upstream error", detail: body });
      return;
    }

    const detections = await response.json();
    const top =
      Array.isArray(detections) && detections.length > 0
        ? detections.reduce((a: any, b: any) =>
            a.confidence > b.confidence ? a : b,
          )
        : null;

    res.json({
      language: top?.language ?? null,
      confidence: top?.confidence ?? null,
    });
  } catch (e) {
    res.status(500).json({ error: "Unexpected server error" });
  }
};
