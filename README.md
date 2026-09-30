# API Key Checker v2

A zero-log API key validator. Keys are sent only to this server, used for a single request to the provider, then discarded. Nothing is stored or logged.

## Requirements

- Node 18+

## Run locally

```bash
npm start
# open http://localhost:3000
```

## 🚀 Deploy Online (NOT GitHub Pages)

**GitHub Pages cannot run Node.js** — it only hosts static files. The `server.js` makes live API requests to validate keys, so it **requires a Node.js host**.

### Recommended platforms (free tier):

| Platform | How |
|----------|-----|
| **Railway** | Import GitHub repo → auto-deploys on push |
| **Render** | New Web Service → connect repo → set `web: node server.js` |
| **Fly.io** | `fly launch` → deploy |
| **Heroku** | `heroku create` → `git push heroku main` |
| **VPS** | SSH → `git clone` → `npm install` → `node server.js` |

### Quick start with Railway (easiest):

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Set env var `PORT` (Railway does this automatically)
4. Done — you get a live URL like `https://your-app.up.railway.app`

### Environment variables

- `PORT` — the port to listen on (default: 3000). Set by the hosting platform automatically.

## What's new in v2

- ✨ Modern dark/light UI with animations and hover effects
- 🔍 Password visibility toggle
- 🔄 Auto-detect provider from key prefix
- 📋 History with masked key previews
- 🐳 Zero-dependency, single `server.js`
- 🔒 No keys stored — one request, then discarded

## Adding providers

Edit `providers.json` — no code changes needed. Each entry needs:
- `id` — unique identifier
- `name` — display name
- `url` — GET endpoint to test
- `auth` — `bearer`, `header:X-Key`, `query:param`, `basic`, `prefix:X-Key`, `path`, or `basic-user:username`
- `prefix` — (optional) regex to auto-detect key format
- `headers` — (optional) extra HTTP headers
- `expect` / `reject` — (optional) JSON response validation

## License

MIT
