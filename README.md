# API Key Checker v2

A zero-log API key validator. Keys are sent only to this server, used for a single request to the provider, then discarded. Nothing is stored or logged.

## Requirements

- Node 18+

## Run locally

```bash
npm start
# open http://localhost:3000
```

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
