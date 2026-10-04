// Netlify Function: POST /api/validate
// Enhanced Validator: Supports POST, Custom Domains, and flexible Auth schemas.

const PROVIDERS = require('./providers_config.cjs');

const byId = Object.fromEntries(PROVIDERS.map(p => [p.id, p]));

function buildRequest(p, key, customDomain) {
  let url = p.url;

  // 1. Handle Custom Domain/Proxy
  if (customDomain) {
    try {
      const urlObj = new URL(url);
      url = url.replace(urlObj.origin, `https://${customDomain}`);
    } catch (e) {
      // If url is relative or invalid, we keep it as is
    }
  }

  const headers = { ...(p.customHeaders || {}) };

  // 2. Auth Builder
  switch (p.authType) {
    case 'bearer':
      headers['Authorization'] = `Bearer ${key}`;
      break;
    case 'header':
      headers[p.authKey || 'Authorization'] = key;
      break;
    case 'prefix':
      headers['Authorization'] = (p.authKey || '') + key;
      break;
    case 'query':
      url += (url.includes('?') ? '&' : '?') + (p.authKey || 'key') + '=' + encodeURIComponent(key);
      break;
    case 'path':
      url = url.replace('{key}', encodeURIComponent(key));
      break;
    case 'basic':
      headers['Authorization'] = `Basic ${Buffer.from(key).toString('base64')}`;
      break;
  }

  // 3. Body Builder (for POST)
  let body = null;
  if (p.method === 'POST' && p.bodyTemplate) {
    // Replace placeholders in bodyTemplate if any exist, though currently we use static templates
    body = JSON.stringify(p.bodyTemplate);
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  return { url, headers, body };
}

async function validate(p, key, customDomain) {
  try {
    const { url, headers, body } = buildRequest(p, key, customDomain);

    if (!url || !url.startsWith('https://')) {
      return { status: 'error', message: 'Invalid endpoint URL' };
    }

    const response = await fetch(url, {
      method: p.method,
      headers: headers,
      body: body,
      redirect: 'manual',
      signal: AbortSignal.timeout(10000)
    });

    const status = response.status;

    // 4. Response Analysis
    if (status === 429) {
      return { status: 'valid', code: status, message: 'Key is valid but rate limited (429)' };
    }
    if (status === 401 || status === 400) {
      return { status: 'invalid', code: status, message: `Authentication failed (${status})` };
    }
    if (status === 403) {
      return { status: 'restricted', code: status, message: 'Key is recognized but lacks required permissions (403)' };
    }
    if (status >= 200 && status < 300) {
      // Optional: check response body for specific success flags
      return { status: 'valid', code: status, message: 'Key is valid and active' };
    }

    return { status: 'error', code: status, message: `Unexpected response from provider (${status})` };

  } catch (e) {
    const msg = e.name === 'TimeoutError' ? 'Request timed out' : 'Network error';
    return { status: 'error', message: `Could not reach provider: ${msg}` };
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
    const { provider, key, domain, custom } = JSON.parse(event.body);

    // 'provider' is the ID, 'custom' is the custom config if provider === 'custom'
    const p = provider === "custom" ? custom : byId[provider];

    if (!key || !p || !p.url || !p.authType) {
      return json({ status: "error", message: "Missing key or provider settings" });
    }

    const result = await validate(p, String(key).trim(), domain);
    return json(result);
  } catch (e) {
    return json({ status: "error", message: "Bad request: " + e.message }, 400);
  }
};
