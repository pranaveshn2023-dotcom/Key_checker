import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, ShieldCheck, Key, Globe, Settings2, Search } from 'lucide-react';
import { Provider } from './providers';

const App = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [key, setKey] = useState('');
  const [providerId, setProviderId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [errorReason, setErrorReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Domain and Custom states
  const [customDomain, setCustomDomain] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customHeaderKey, setCustomHeaderKey] = useState('Authorization');
  const [customHeaderValuePrefix, setCustomHeaderValuePrefix] = useState('Bearer ');

  // Fetch providers from backend on mount
  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch('/api/providers');
        const data = await response.json();
        setProviders(data);
        if (data.length > 0) setProviderId(data[0].id);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
      }
    }
    fetchProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    return providers.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, providers]);

  const validateKey = async () => {
    if (!key) return;
    setStatus('loading');
    setErrorReason('');

    try {
      const payload: any = {
        provider: providerId,
        key,
        domain: customDomain
      };

      if (providerId === 'custom') {
        if (!customUrl) {
          setStatus('invalid');
          setErrorReason('Please provide a validation URL');
          return;
        }
        payload.custom = {
          url: customUrl,
          authType: 'header',
          authKey: customHeaderKey,
          authKeyPrefix: customHeaderValuePrefix
        };
      }

      // Note: In local dev, this might be http://localhost:3001/api/validate
      // In Netlify, it will be /api/validate
      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
      const response = await fetch(`${apiBase}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status === 'valid') {
        setStatus('valid');
      } else if (result.status === 'invalid' || result.status === 'restricted') {
        setStatus('invalid');
        setErrorReason(result.message || 'Invalid API Key');
      } else {
        setStatus('invalid');
        setErrorReason(result.message || 'Verification error');
      }
    } catch (err) {
      setStatus('invalid');
      setErrorReason('Network error or backend unreachable');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Key Validator</h1>
          <p className="text-slate-500 mt-2">Developer-grade API key verification.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search & Select Provider</label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search providers or categories..."
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {filteredProviders.map(p => (
                  <option key={p.id} value={p.id}>{`[${p.category}] ${p.name}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Base Domain (Optional)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. my-proxy.openai.com"
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {providerId === 'custom' && (
            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Settings2 className="w-4 h-4" />
                Universal Config
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Endpoint URL</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://api.provider.com/validate"
                    className="w-full p-2 text-sm bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Header Key</label>
                    <input
                      type="text"
                      value={customHeaderKey}
                      onChange={(e) => setCustomHeaderKey(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Prefix</label>
                    <input
                      type="text"
                      value={customHeaderValuePrefix}
                      onChange={(e) => setCustomHeaderValuePrefix(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste secret key here..."
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={validateKey}
            disabled={status === 'loading' || !key || (providerId === 'custom' && !customUrl)}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
            ) : (
              'Verify Key'
            )}
          </button>

          {status === 'valid' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Key is Valid!</p>
                <p className="text-sm opacity-90">This key is authentic and active.</p>
              </div>
            </div>
          )}

          {status === 'invalid' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 animate-in fade-in slide-in-from-top-2">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Verification Failed</p>
                <p className="text-sm opacity-90">{errorReason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 italic">
            <Globe className="w-3 h-3" />
            <span>Secure pass-through. 0% storage. 100% privacy.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
