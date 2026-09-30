// Netlify Function: POST /api/validate
// Validates an API key by making one outbound request, then discards it. Nothing stored.

const PROVIDERS = [
  {"id":"openai","name":"OpenAI","url":"https://api.openai.com/v1/models","auth":"bearer"},
  {"id":"anthropic","name":"Anthropic","url":"https://api.anthropic.com/v1/models","auth":"header:x-api-key","headers":{"anthropic-version":"2023-06-01"}},
  {"id":"gemini","name":"Google Gemini","url":"https://generativelanguage.googleapis.com/v1beta/models","auth":"header:x-goog-api-key"},
  {"id":"googlemaps","name":"Google Maps","url":"https://maps.googleapis.com/maps/api/geocode/json?address=london&key={key}","auth":"path","reject":{"field":"status","in":["REQUEST_DENIED","INVALID_REQUEST"]}},
  {"id":"github","name":"GitHub","url":"https://api.github.com/user","auth":"bearer","headers":{"User-Agent":"key-checker"}},
  {"id":"gitlab","name":"GitLab","url":"https://gitlab.com/api/v4/user","auth":"header:PRIVATE-TOKEN"},
  {"id":"groq","name":"Groq","url":"https://api.groq.com/openai/v1/models","auth":"bearer"},
  {"id":"mistral","name":"Mistral","url":"https://api.mistral.ai/v1/models","auth":"bearer"},
  {"id":"openrouter","name":"OpenRouter","url":"https://openrouter.ai/api/v1/auth/key","auth":"bearer"},
  {"id":"huggingface","name":"Hugging Face","url":"https://huggingface.co/api/whoami-v2","auth":"bearer"},
  {"id":"cohere","name":"Cohere","url":"https://api.cohere.com/v1/models","auth":"bearer"},
  {"id":"together","name":"Together AI","url":"https://api.together.xyz/v1/models","auth":"bearer"},
  {"id":"deepseek","name":"DeepSeek","url":"https://api.deepseek.com/models","auth":"bearer"},
  {"id":"xai","name":"xAI (Grok)","url":"https://api.x.ai/v1/models","auth":"bearer"},
  {"id":"fireworks","name":"Fireworks AI","url":"https://api.fireworks.ai/inference/v1/models","auth":"bearer"},
  {"id":"replicate","name":"Replicate","url":"https://api.replicate.com/v1/account","auth":"bearer"},
  {"id":"stability","name":"Stability AI","url":"https://api.stability.ai/v1/user/account","auth":"bearer"},
  {"id":"elevenlabs","name":"ElevenLabs","url":"https://api.elevenlabs.io/v1/user","auth":"header:xi-api-key"},
  {"id":"deepgram","name":"Deepgram","url":"https://api.deepgram.com/v1/projects","auth":"prefix:Token "},
  {"id":"assemblyai","name":"AssemblyAI","url":"https://api.assemblyai.com/v2/transcript?limit=1","auth":"header:authorization"},
  {"id":"pinecone","name":"Pinecone","url":"https://api.pinecone.io/indexes","auth":"header:Api-Key","headers":{"X-Pinecone-Api-Version":"2024-07"}},
  {"id":"stripe","name":"Stripe","url":"https://api.stripe.com/v1/balance","auth":"bearer"},
  {"id":"twilio","name":"Twilio (SID:AuthToken)","url":"https://api.twilio.com/2010-04-01/Accounts.json","auth":"basic"},
  {"id":"sendgrid","name":"SendGrid","url":"https://api.sendgrid.com/v3/scopes","auth":"bearer"},
  {"id":"mailgun","name":"Mailgun","url":"https://api.mailgun.net/v3/domains","auth":"basic-user:api"},
  {"id":"postmark","name":"Postmark (server token)","url":"https://api.postmarkapp.com/server","auth":"header:X-Postmark-Server-Token","headers":{"Accept":"application/json"}},
  {"id":"resend","name":"Resend","url":"https://api.resend.com/domains","auth":"bearer"},
  {"id":"slack","name":"Slack","url":"https://slack.com/api/auth.test","auth":"bearer","expect":{"field":"ok","equals":true}},
  {"id":"discord","name":"Discord bot","url":"https://discord.com/api/v10/users/@me","auth":"prefix:Bot "},
  {"id":"telegram","name":"Telegram bot","url":"https://api.telegram.org/bot{key}/getMe","auth":"path"},
  {"id":"notion","name":"Notion","url":"https://api.notion.com/v1/users/me","auth":"bearer","headers":{"Notion-Version":"2022-06-28"}},
  {"id":"airtable","name":"Airtable","url":"https://api.airtable.com/v0/meta/whoami","auth":"bearer"},
  {"id":"cloudflare","name":"Cloudflare API token","url":"https://api.cloudflare.com/client/v4/user/tokens/verify","auth":"bearer"},
  {"id":"vercel","name":"Vercel","url":"https://api.vercel.com/v2/user","auth":"bearer"},
  {"id":"netlify","name":"Netlify","url":"https://api.netlify.com/api/v1/user","auth":"bearer"},
  {"id":"digitalocean","name":"DigitalOcean","url":"https://api.digitalocean.com/v2/account","auth":"bearer"},
  {"id":"heroku","name":"Heroku","url":"https://api.heroku.com/account","auth":"bearer","headers":{"Accept":"application/vnd.heroku+json; version=3"}},
  {"id":"npm","name":"npm","url":"https://registry.npmjs.org/-/whoami","auth":"bearer"},
  {"id":"datadog","name":"Datadog API key","url":"https://api.datadoghq.com/api/v1/validate","auth":"header:DD-API-KEY"},
  {"id":"sentry","name":"Sentry","url":"https://sentry.io/api/0/organizations/","auth":"bearer"},
  {"id":"virustotal","name":"VirusTotal","url":"https://www.virustotal.com/api/v3/domains/google.com","auth":"header:x-apikey"},
  {"id":"shodan","name":"Shodan","url":"https://api.shodan.io/api-info","auth":"query:key"},
  {"id":"openweather","name":"OpenWeatherMap","url":"https://api.openweathermap.org/data/2.5/weather?q=London","auth":"query:appid"},
  {"id":"newsapi","name":"NewsAPI","url":"https://newsapi.org/v2/top-headlines?country=us&pageSize=1","auth":"header:X-Api-Key"},
  {"id":"mapbox","name":"Mapbox","url":"https://api.mapbox.com/tokens/v2","auth":"query:access_token"}
];

const byId = Object.fromEntries(PROVIDERS.map(p => [p.id, p]));

function build(p, key) {
  let url = p.url;
  const h = { ...(p.headers || {}) };
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
  try {
    ({ url, h } = build(p, key));
    if (new URL(url).protocol !== "https:") throw 0;
  } catch {
    return { status: "error", message: "Endpoint must be a valid https URL" };
  }
  try {
    const r = await fetch(url, { headers: h, redirect: "manual", signal: AbortSignal.timeout(10000) });
    const c = r.status;
    if (c === 429) return { status: "valid", code: c, message: "Key is valid but rate limited (429)" };
    if (c === 401 || c === 400) return { status: "invalid", code: c, message: "Key rejected (" + c + ")" };
    if (c === 403) return { status: "restricted", code: c, message: "Key recognised but lacks permission (403)" };
    if (c >= 200 && c < 300) {
      if (p.expect || p.reject) {
        let j = {}; try { j = await r.json(); } catch {}
        if (p.expect && j[p.expect.field] !== p.expect.equals) return { status: "invalid", code: c, message: "Key rejected by provider" };
        if (p.reject && p.reject.in.includes(j[p.reject.field])) return { status: "invalid", code: c, message: "Key rejected: " + j[p.reject.field] };
      }
      return { status: "valid", code: c, message: "Key is valid" };
    }
    return { status: "error", code: c, message: "Unexpected response (" + c + "). Check the endpoint and auth type." };
  } catch (e) {
    return { status: "error", message: "Could not reach provider: " + (e.name === "TimeoutError" ? "timed out" : "network error") };
  }
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const json = (obj, code = 200) => ({
    statusCode: code,
    headers,
    body: JSON.stringify(obj)
  });

  if (event.httpMethod !== "POST") {
    return json({ status: "error", message: "POST required" }, 405);
  }

  try {
    const { provider, key, custom } = JSON.parse(event.body);
    const p = provider === "custom" ? custom : byId[provider];
    if (!key || !p || !p.url || !p.auth) {
      return json({ status: "error", message: "Missing key or provider settings" });
    }
    if (provider === "custom") { delete p.expect; delete p.reject; }
    const result = await validate(p, String(key).trim());
    return json(result);
  } catch {
    return json({ status: "error", message: "Bad request" }, 400);
  }
};

