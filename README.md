# AI Summarizer Pro

A professional, secure AI-powered text and image summarizer built with Node.js + Express on the backend and vanilla HTML/CSS/JS on the frontend.

---

## Why the server matters for security

The original single-file version stored the API key directly in the browser (`const OPENROUTER_API_KEY = "..."`).  
**Anyone who opens DevTools can read that key, copy it, and use your credits.**

This version fixes that: the key lives only in a `.env` file on your server. The browser never sees it.

```
Browser  ──POST /api/summarize──►  Your Express Server  ──(key added here)──►  OpenRouter API
                                         ▲
                               .env key loaded here
                               (never sent to browser)
```

---

## Project Structure

```
ai-summarizer-pro/
├── index.html          # Front-end markup (no API key)
├── css/
│   └── style.css       # All styles, separated from HTML
├── js/
│   └── app.js          # Front-end logic, calls /api/summarize
├── server/
│   └── index.js        # Express server — holds the API key securely
├── .env.example        # Template — copy to .env and add your key
├── .env                # ← YOUR REAL KEY GOES HERE (never commit this)
├── .gitignore          # Ignores .env so it's never accidentally pushed
├── package.json
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
cd ai-summarizer-pro
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
PORT=3000
```

Get a free key at [openrouter.ai](https://openrouter.ai).

### 3. Start the server

```bash
npm start
```

Or for auto-restart during development:

```bash
npm run dev
```

### 4. Open the app

Visit **http://localhost:3000** in your browser.

---

## API Endpoint Reference

### `POST /api/summarize`

Accepts JSON. Returns a summary from the AI model.

**Request body:**

| Field         | Type   | Required | Description                                  |
|---------------|--------|----------|----------------------------------------------|
| `text`        | string | Optional | The text to summarize                        |
| `imageBase64` | string | Optional | Base64 data URL of an image (e.g. `data:image/png;base64,...`) |

At least one of `text` or `imageBase64` must be provided.

**Success response (200):**

```json
{
  "summary": "Your AI-generated summary text here."
}
```

**Error response (4xx / 5xx):**

```json
{
  "error": "Human-readable error message."
}
```

### `GET /api/health`

Returns server status.

```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

---

## Deployment

### Deploying to Railway / Render / Fly.io

1. Push your code to GitHub (**double-check `.gitignore` excludes `.env`**).
2. In your hosting dashboard, add the environment variable:
   - `OPENROUTER_API_KEY` = your key
   - `PORT` = (usually set automatically by the platform)
3. Set the start command to `npm start`.

### Deploying to a VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and install
git clone <your-repo-url>
cd ai-summarizer-pro
npm install

# Create .env
echo "OPENROUTER_API_KEY=your_key_here" > .env

# Run with PM2 (keeps it alive)
npm install -g pm2
pm2 start server/index.js --name ai-summarizer
pm2 save
pm2 startup
```

---

## Changing the AI Model

In `server/index.js`, find this line and replace the model string:

```js
model: "google/gemini-1.5-flash",
```

Other vision-capable models on OpenRouter:

| Model | Notes |
|-------|-------|
| `google/gemini-1.5-flash` | Fast & cheap (default) |
| `google/gemini-1.5-pro`   | More capable |
| `openai/gpt-4o`           | OpenAI's flagship vision model |
| `anthropic/claude-3-haiku`| Fast Anthropic model |

See all models at [openrouter.ai/models](https://openrouter.ai/models).

---

## Security Checklist

- [x] API key stored in `.env`, never in frontend code
- [x] `.env` listed in `.gitignore`
- [x] No API key in `index.html` or `js/app.js`
- [x] Server validates input before forwarding to OpenRouter
- [x] Error messages never expose raw stack traces to the client

---

## License

MIT — free to use and modify.
