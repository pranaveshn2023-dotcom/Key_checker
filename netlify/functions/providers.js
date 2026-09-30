// Netlify Function: GET /api/providers
// Returns the list of supported providers (id, name, prefix only — no secrets)
const PROVIDERS = [
{"id":"openai","name":"OpenAI"},
{"id":"anthropic","name":"Anthropic","prefix":"^sk-ant-"},
{"id":"gemini","name":"Google Gemini","prefix":"^AIza"},
{"id":"googlemaps","name":"Google Maps"},
{"id":"github","name":"GitHub","prefix":"^(ghp_|gho_|ghu_|ghs_|github_pat_)"},
{"id":"gitlab","name":"GitLab","prefix":"^glpat-"},
{"id":"groq","name":"Groq","prefix":"^gsk_"},
{"id":"mistral","name":"Mistral"},
{"id":"openrouter","name":"OpenRouter","prefix":"^sk-or-"},
{"id":"huggingface","name":"Hugging Face","prefix":"^hf_"},
{"id":"cohere","name":"Cohere"},
{"id":"together","name":"Together AI"},
{"id":"deepseek","name":"DeepSeek"},
{"id":"xai","name":"xAI (Grok)","prefix":"^xai-"},
{"id":"fireworks","name":"Fireworks AI","prefix":"^fw_"},
{"id":"replicate","name":"Replicate","prefix":"^r8_"},
{"id":"stability","name":"Stability AI"},
{"id":"elevenlabs","name":"ElevenLabs"},
{"id":"deepgram","name":"Deepgram"},
{"id":"assemblyai","name":"AssemblyAI"},
{"id":"pinecone","name":"Pinecone","prefix":"^pcsk_"},
{"id":"stripe","name":"Stripe","prefix":"^(sk|rk)_(live|test)_"},
{"id":"twilio","name":"Twilio (SID:AuthToken)","prefix":"^AC[0-9a-f]{32}:"},
{"id":"sendgrid","name":"SendGrid","prefix":"^SG\\\\."},
{"id":"mailgun","name":"Mailgun"},
{"id":"postmark","name":"Postmark (server token)"},
{"id":"resend","name":"Resend","prefix":"^re_"},
{"id":"slack","name":"Slack","prefix":"^xox[abpr]-"},
{"id":"discord","name":"Discord bot"},
{"id":"telegram","name":"Telegram bot","prefix":"^\\\\d{6,}:[\\\\w-]{30,}$"},
{"id":"notion","name":"Notion","prefix":"^(secret_|ntn_)"},
{"id":"airtable","name":"Airtable","prefix":"^pat"},
{"id":"cloudflare","name":"Cloudflare API token"},
{"id":"vercel","name":"Vercel"},
{"id":"netlify","name":"Netlify"},
{"id":"digitalocean","name":"DigitalOcean","prefix":"^dop_v1_"},
{"id":"heroku","name":"Heroku"},
{"id":"npm","name":"npm","prefix":"^npm_"},
{"id":"datadog","name":"Datadog API key"},
{"id":"sentry","name":"Sentry","prefix":"^sntry[su]_"},
{"id":"virustotal","name":"VirusTotal"},
{"id":"shodan","name":"Shodan"},
{"id":"openweather","name":"OpenWeatherMap"},
{"id":"newsapi","name":"NewsAPI"},
{"id":"mapbox","name":"Mapbox","prefix":"^[ps]k\\\\.ey"}
];

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(PROVIDERS)
  };
};
