import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleChat } from "./routes/chat";
import { handleDetectLang } from "./routes/detect-lang";
import { handleTranslate } from "./routes/translate";
import { handleTTS } from "./routes/tts";
import { handleImageToText } from "./routes/image-to-text";
import multer from "multer";
import { handleImageToTextUpload } from "./routes/image-to-text-upload";
import { handleCaption } from "./routes/caption";
import { handleSignProxy, signUpload } from "./routes/sign";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/chat", handleChat);
  app.post("/api/detect-lang", handleDetectLang);
  app.post("/api/translate", handleTranslate);

  // Image Captioning (Image to Text)
  // POST { imageBase64: dataUrl | base64, model?: string }
  app.post("/api/image-to-text", handleImageToText);

  // Multipart upload variant for best quality
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/image-to-text-upload", upload.single("image"), handleImageToTextUpload);
  app.post("/api/caption", upload.single("image"), handleCaption);

  // TTS proxy (GET or POST)
  app.get("/api/tts", handleTTS);
  app.post("/api/tts", handleTTS);

  return app;
}
