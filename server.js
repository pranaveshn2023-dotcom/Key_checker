// Zero-dependency Node 18+ server. Keys are used for one outbound request, then discarded. Nothing is stored or logged.
const http = require("http"), fs = require("fs"), path = require("path");
const PROVIDERS = JSON.parse(fs.readFileSync(path.join(__dirname, "providers.json"), "utf8"));
const byId = Object.fromEntries(PROVIDERS.map(p => [p.id, p]));

function build(p, key) {
  let url = p.url; const h = { ...(p.headers || {}) };
  const [type, arg] = p.auth.split(/:(.*)/s);
  if (type === "bearer") h.Authorization = "Bearer " + key;
  else if (type === "header") h[arg] = key;
  else if (type === "prefix") h.Authorization = arg + key;
  else if (type === "basic") h.Authorization = "Basic " + Buffer.from(key).toString("base64");
  else if (type === "basic-user") h.Authorization = "Basic " + Buffer.from(arg + ":" + key).toString("base64");
  else if (type === "query") url += (url.includes("?") ? "&" : "?") + arg + "=" + encodeURIComponent(key);
  else if (type === "path") url = url.replace("{key}", encodeURIComponent(key));
  return { url, h };
}

async function validate(p, key) {
  let url, h;
  try { ({ url, h } = build(p, key)); if (new URL(url).protocol !== "https:") throw 0; }
  catch { return { status: "error", message: "Endpoint must be a valid https URL" }; }
  try {
    const r = await fetch(url, { headers: h, redirect: "manual", signal: AbortSignal.timeout(10000) });
    const c = r.status;
    if (c === 429) return { status: "valid", code: c, message: "Key is valid but rate limited (429)" };
    if (c === 401 || c === 400) return { status: "invalid", code: c, message: `Key rejected (${c})` };
    if (c === 403) return { status: "restricted", code: c, message: "Key recognised but lacks permission (403)" };
    if (c >= 200 && c < 300) {
      if (p.expect || p.reject) {
        let j = {}; try { j = await r.json(); } catch {}
        if (p.expect && j[p.expect.field] !== p.expect.equals) return { status: "invalid", code: c, message: "Key rejected by provider" };
        if (p.reject && p.reject.in.includes(j[p.reject.field])) return { status: "invalid", code: c, message: "Key rejected: " + j[p.reject.field] };
      }
      return { status: "valid", code: c, message: "Key is valid" };
    }
    return { status: "error", code: c, message: `Unexpected response (${c}). Check the endpoint and auth type.` };
  } catch (e) {
    return { status: "error", message: "Could not reach provider: " + (e.name === "TimeoutError" ? "timed out" : "network error") };
  }
}

http.createServer((req, res) => {
  const json = o => { res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(o)); };
  if (req.method === "POST" && req.url === "/api/validate") {
    let b = ""; req.on("data", c => { b += c; if (b.length > 10000) req.destroy(); });
    req.on("end", async () => {
      try {
        const { provider, key, custom } = JSON.parse(b);
        const p = provider === "custom" ? custom : byId[provider];
        if (!key || !p || !p.url || !p.auth) return json({ status: "error", message: "Missing key or provider settings" });
        if (provider === "custom") delete p.expect, delete p.reject;
        json(await validate(p, String(key).trim()));
      } catch { json({ status: "error", message: "Bad request" }); }
    });
    return;
  }
  if (req.url === "/api/providers") return json(PROVIDERS.map(({ id, name, prefix }) => ({ id, name, prefix })));
  const pub = path.join(__dirname, "public", "index.html");
  const root = path.join(__dirname, "index.html");
  const file = fs.existsSync(pub) ? pub : root;
  fs.readFile(file, (e, d) => { res.writeHead(e ? 500 : 200, { "Content-Type": "text/html; charset=utf-8" }); res.end(e ? "Error" : d); });
}).listen(process.env.PORT || 3000, () => console.log("Key checker at http://localhost:" + (process.env.PORT || 3000)));
