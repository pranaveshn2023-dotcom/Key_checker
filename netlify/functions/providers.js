// Netlify Function: GET /api/providers
// Returns the list of supported providers from the unified registry.
const PROVIDERS = require('./providers_config.cjs');

exports.handler = async () => {
  // We only return a subset of the config to the frontend (security/size)
  const publicProviders = PROVIDERS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    prefix: p.prefix
  }));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(publicProviders)
  };
};
