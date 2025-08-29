import type { RequestHandler } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// Middleware exporter to reuse in index.ts
export const signUpload = upload.single("image");

export const handleSignProxy: RequestHandler = async (req, res) => {
  try {
    const base = process.env.SIGN_SERVER_URL; // e.g., http://localhost:8000/predict
    if (!base) {
      res.status(500).json({ error: "Missing SIGN_SERVER_URL" });
      return;
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    let body: BodyInit;
    let headers: Record<string, string> = {};

    if (file?.buffer?.length) {
      // Forward as raw image bytes
      body = file.buffer as unknown as BodyInit;
      const ct =
        file.mimetype && typeof file.mimetype === "string"
          ? file.mimetype
          : "application/octet-stream";
      headers["Content-Type"] = ct;
    } else if (req.is("application/octet-stream")) {
      body = req.body as any;
      headers["Content-Type"] = "application/octet-stream";
    } else if (req.is("application/json")) {
      body = JSON.stringify(req.body ?? {});
      headers["Content-Type"] = "application/json";
    } else {
      res.status(400).json({ error: "No image provided" });
      return;
    }

    const url = base; // SIGN_SERVER_URL should include the path
    const upstream = await fetch(url, { method: "POST", headers, body });
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
  } catch (e) {
    res.status(500).json({ error: "Proxy error" });
  }
};
