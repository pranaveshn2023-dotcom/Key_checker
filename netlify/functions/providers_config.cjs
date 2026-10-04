const PROVIDERS = [
  // --- AI PROVIDERS ---
  {
    id: "openai",
    name: "OpenAI",
    category: "AI",
    url: "https://api.openai.com/v1/models",
    method: "GET",
    authType: "bearer",
    prefix: "^sk-[a-zA-Z0-9]{20,}$"
  },
  {
    id: "anthropic",
    name: "Anthropic",
    category: "AI",
    url: "https://api.anthropic.com/v1/messages",
    method: "POST",
    authType: "header",
    authKey: "x-api-key",
    customHeaders: { "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    bodyTemplate: { model: "claude-3-haiku-20240307", max_tokens: 1, messages: [{ role: "user", content: "hi" }] },
    prefix: "^sk-ant-api03-"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "AI",
    url: "https://generativelanguage.googleapis.com/v1beta/models",
    method: "GET",
    authType: "query",
    authKey: "key",
    prefix: "^AIza"
  },
  {
    id: "mistral",
    name: "Mistral AI",
    category: "AI",
    url: "https://api.mistral.ai/v1/models",
    method: "GET",
    authType: "bearer",
    prefix: "^"
  },
  {
    id: "groq",
    name: "Groq",
    category: "AI",
    url: "https://api.groq.com/openai/v1/models",
    method: "GET",
    authType: "bearer",
    prefix: "^gsk_"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    category: "AI",
    url: "https://api.perplexity.ai/models",
    method: "GET",
    authType: "bearer",
    prefix: "^"
  },
  {
    id: "cohere",
    name: "Cohere",
    category: "AI",
    url: "https://api.cohere.com/v1/models",
    method: "GET",
    authType: "bearer",
    prefix: "^"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    category: "AI",
    url: "https://api.deepseek.com/models",
    method: "GET",
    authType: "bearer",
    prefix: "^"
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    category: "AI",
    url: "https://openrouter.ai/api/v1/auth/key",
    method: "GET",
    authType: "bearer",
    prefix: "^sk-or-"
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "AI",
    url: "https://huggingface.co/api/whoami-v2",
    method: "GET",
    authType: "bearer",
    prefix: "^hf_"
  },

  // --- CLOUD PROVIDERS ---
  {
    id: "aws",
    name: "AWS (STS)",
    category: "Cloud",
    url: "https://sts.amazonaws.com/",
    method: "POST",
    authType: "header",
    authKey: "X-Amz-Date", // AWS is complex; typically uses SigV4. For simple validation, we use the identity check.
    customHeaders: { "Content-Type": "application/x-amz-json-1.1" },
    bodyTemplate: { Action: "GetCallerIdentity", Version: "2011-06-23" },
    // Note: AWS typically requires SigV4. This is a placeholder for the structure.
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    category: "Cloud",
    url: "https://api.digitalocean.com/v2/account",
    method: "GET",
    authType: "bearer",
    prefix: "^dop_v1_"
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "Cloud",
    url: "https://api.cloudflare.com/client/v4/user",
    method: "GET",
    authType: "bearer",
    prefix: "^"
  },

  // --- SOCIAL & DEV TOOLS ---
  {
    id: "github",
    name: "GitHub",
    category: "Social",
    url: "https://api.github.com/user",
    method: "GET",
    authType: "bearer",
    customHeaders: { "User-Agent": "key-checker" },
    prefix: "^(ghp_|gho_|ghu_|ghs_|github_pat_)"
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Social",
    url: "https://gitlab.com/api/v4/user",
    method: "GET",
    authType: "header",
    authKey: "PRIVATE-TOKEN",
    prefix: "^glpat-"
  },
  {
    id: "discord",
    name: "Discord Bot",
    category: "Social",
    url: "https://discord.com/api/v10/users/@me",
    method: "GET",
    authType: "prefix",
    authKey: "Bot ",
    prefix: "^"
  },
  {
    id: "slack",
    name: "Slack",
    category: "Social",
    url: "https://slack.com/api/auth.test",
    method: "GET",
    authType: "bearer",
    prefix: "^xox[abpr]-"
  },

  // --- PAYMENT & OTHER ---
  {
    id: "stripe",
    name: "Stripe",
    category: "Payment",
    url: "https://api.stripe.com/v1/balance",
    method: "GET",
    authType: "bearer",
    prefix: "^(sk|rk)_(live|test)_"
  },
  {
    id: "resend",
    name: "Resend",
    category: "Other",
    url: "https://api.resend.com/domains",
    method: "GET",
    authType: "bearer",
    prefix: "^re_"
  },
  {
    id: "custom",
    name: "🌐 Custom Provider",
    category: "Other",
    url: "",
    method: "GET",
    authType: "header",
    authKey: "Authorization",
    prefix: ""
  }
];

module.exports = PROVIDERS;
