# API key checker
Requires Node 18+.

    node server.js
    # open http://localhost:3000

Nothing is stored or logged; each key is used for one request to the provider.
To add a provider, append an entry to providers.json (no code changes). For anything not listed, use "Custom API" in the UI.
