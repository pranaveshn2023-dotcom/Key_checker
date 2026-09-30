# API Key Checker

A zero-log API key validator. Keys are sent to a serverless function, used for a single request to the provider, then discarded. Nothing is stored or logged.

Supports 45+ providers including OpenAI, Anthropic, Google Gemini, GitHub, Stripe, Slack, and more.

## Deploy to Netlify

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Connect your GitHub repo
4. Click **Deploy site** — done ✅

## Project Structure

```
├── netlify.toml              ← Netlify config (redirects + build settings)
├── public/
│   └── index.html            ← Frontend UI (served by Netlify CDN)
├── netlify/functions/
│   ├── providers.js          ← GET /api/providers (serverless)
│   └── validate.js           ← POST /api/validate (serverless)
├── package.json
└── .gitignore
```

## Features

- ✨ Modern dark/light UI with glassmorphism and animations
- 🔍 Password visibility toggle
- 🔄 Auto-detect provider from key prefix
- 📋 History with masked key previews
- 🔒 Zero-log — keys are never stored
- ⚡ Serverless — runs on Netlify Functions (no server needed)

## License

MIT
