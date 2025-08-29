import type { RequestHandler } from "express";

const DETECT_URL = "https://translation.googleapis.com/language/translate/v2/detect";

export const handleDetectLang: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Server is missing GOOGLE_API_KEY" });
      return;
    }
    const text: unknown = req.body?.text;
    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Invalid text" });
      return;
    }

    const params = new URLSearchParams();
    params.set("q", text);

    const response = await fetch(`${DETECT_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      res.status(502).json({ error: "Upstream error", detail: body });
      return;
    }

    const data = await response.json();
    const det = data?.data?.detections?.[0]?.[0] ?? null;
    if (!det) {
      res.status(200).json({ language: null, confidence: null });
      return;
    }

    res.json({ language: det.language ?? null, confidence: det.confidence ?? null });
  } catch {
    res.status(500).json({ error: "Unexpected server error" });
  }
};
