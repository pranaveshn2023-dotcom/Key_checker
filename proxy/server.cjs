const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PRESETS = {
  openai: {
    url: 'https://api.openai.com/v1/models',
    method: 'GET',
    headers: (key, domain) => {
      if (domain && (domain.includes('azure') || domain.includes('openai.azure'))) {
        return { 'api-key': key };
      }
      return { 'Authorization': `Bearer ${key}` };
    },
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    method: 'POST',
    headers: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    body: {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    },
  },
  gemini: {
    url: (key) => `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
    method: 'GET',
    headers: () => ({}),
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/models',
    method: 'GET',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/models',
    method: 'GET',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  perplexity: {
    url: 'https://api.perplexity.ai/models',
    method: 'GET',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  cohere: {
    url: 'https://api.cohere.ai/v1/models',
    method: 'GET',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  deepseek: {
    url: 'https://api.deepseek.com/models',
    method: 'GET',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/models',
    method: 'GET',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` }),
  },
  azure: {
    url: 'https://api.openai.azure.com/openai/models',
    method: 'GET',
    headers: (key) => ({ 'api-key': key }),
  },
};

app.post('/api/validate', async (req, res) => {
  const { providerId, key, domain, customConfig } = req.body;

  if (!providerId || !key) {
    return res.status(400).json({ valid: false, reason: 'Provider and Key are required' });
  }

  let config;
  let finalUrl;

  if (providerId === 'custom') {
    if (!customConfig || !customConfig.url) {
      return res.status(400).json({ valid: false, reason: 'Custom URL is required' });
    }
    config = {
      url: customConfig.url,
      method: 'GET',
      headers: (k) => ({
        [customConfig.headerKey || 'Authorization']: `${customConfig.headerPrefix || ''}${k}`
      }),
    };
  } else {
    config = PRESETS[providerId];
    if (!config) {
      return res.status(400).json({ valid: false, reason: 'Unsupported preset provider' });
    }
  }

  try {
    // Handle Custom Domain Overrides for presets
    let baseUrl = typeof config.url === 'function' ? config.url(key) : config.url;

    if (domain && providerId !== 'custom') {
      try {
        const urlObj = new URL(baseUrl);
        const domainUrl = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
        baseUrl = baseUrl.replace(urlObj.origin, domainUrl.origin);
      } catch (e) {
        // Fallback to using the custom domain as the full URL if it's provided
        baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
      }
    }

    const response = await axios({
      method: config.method,
      url: baseUrl,
      headers: config.headers(key, domain),
      data: config.body || undefined,
      timeout: 10000,
    });

    res.json({ valid: true });
  } catch (error) {
    let reason = 'Invalid API Key';
    if (error.response) {
      const data = error.response.data;
      reason = data.error?.message || data.message || JSON.stringify(data);
    } else if (error.request) {
      reason = 'No response from provider';
    } else {
      reason = error.message;
    }
    res.json({ valid: false, reason });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Universal Market Proxy server running on port ${PORT}`);
});
