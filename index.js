/**
 * server/index.js
 * Secure proxy server — API key never leaves the server.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" })); // support base64 images
app.use(express.static(path.join(__dirname, "../"))); // serve front-end files

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Summarize Endpoint ────────────────────────────────────────────────────────
app.post("/api/summarize", async (req, res) => {
  const { text, imageBase64 } = req.body;

  if (!text && !imageBase64) {
    return res.status(400).json({ error: "Provide at least text or an image." });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    return res
      .status(500)
      .json({ error: "Server is missing a valid OPENROUTER_API_KEY. Check your .env file." });
  }

  // Build message content
  const contentArray = [];

  if (text) {
    contentArray.push({
      type: "text",
      text: `Please provide a professional and concise summary of the following content:\n\n${text}`,
    });
  } else {
    contentArray.push({
      type: "text",
      text: "Please provide a detailed summary of what is in this image.",
    });
  }

  if (imageBase64) {
    contentArray.push({
      type: "image_url",
      image_url: { url: imageBase64 },
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://ai-summarizer-pro.app",
        "X-Title": "AI Summarizer Pro",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash",
        messages: [{ role: "user", content: contentArray }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "OpenRouter API error.";
      return res.status(response.status).json({ error: message });
    }

    const summary = data.choices?.[0]?.message?.content;
    if (!summary) {
      return res.status(500).json({ error: "Empty response from AI model." });
    }

    return res.json({ summary });
  } catch (err) {
    console.error("[summarize] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  AI Summarizer Pro running at http://localhost:${PORT}`);
});
