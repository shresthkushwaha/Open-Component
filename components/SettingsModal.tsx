import React, { useEffect, useState } from 'react';
import { UserConfig, APIKey } from '../types';
import { fetchModels, ModelsRegistry, formatModelsForProvider } from '../utils/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UserConfig;
  setConfig: (config: UserConfig) => void;
}

const POPULAR_PROVIDERS = [
  { id: 'google', name: 'Google Gemini' },
  { id: 'anthropic', name: 'Anthropic Claude' },
  { id: 'openai', name: 'OpenAI GPT' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'mistral', name: 'Mistral AI' },
  { id: 'nvidia', name: 'NVIDIA NIM' },
  { id: 'groq', name: 'Groq' },
  { id: 'perplexity', name: 'Perplexity' },
  { id: 'cerebras', name: 'Cerebras' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, setConfig }) => {
  const [registry, setRegistry] = useState<ModelsRegistry>({});
  const [loading, setLoading] = useState(true);
  const [selectedRegProvider, setSelectedRegProvider] = useState<string>('google');

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    setLoading(true);
    const data = await fetchModels();
    setRegistry(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  const updateKeyModel = (keyId: string, model: string) => {
    setConfig({
      ...config,
      keys: config.keys.map(k => k.id === keyId ? { ...k, preferredModel: model } : k)
    });
  };

  const getProviderName = (id: string) => {
    return registry[id]?.name || POPULAR_PROVIDERS.find(p => p.id === id)?.name || id.toUpperCase();
  };

  const availableProviders = Object.keys(registry).length > 0 
    ? Object.keys(registry).sort((a, b) => getProviderName(a).localeCompare(getProviderName(b)))
    : POPULAR_PROVIDERS.map(p => p.id);

  const modelsForNewKey = formatModelsForProvider(registry, selectedRegProvider);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500 inter-ui">
      <div className="bg-[var(--surface-card)] rounded-[32px] w-full max-w-2xl shadow-[var(--modal-shadow)] border border-[var(--hairline)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        <header className="px-8 py-6 border-b border-[var(--hairline)] flex justify-between items-center bg-[var(--canvas)] shrink-0">
          <div>
            <h2 className="text-2xl font-light display-serif text-[var(--ink)]">API Configuration</h2>
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-[0.1em] mt-1">
              {loading ? 'Fetching latest models...' : 'Provider Keys & Models'}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </header>

        <div className="p-8 overflow-y-auto space-y-10">
          
          <section className="space-y-6">
            <h3 className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em]">Active Credentials</h3>
            <div className="space-y-4">
              {config.keys.map(key => (
                <div key={key.id} className="p-6 border border-[var(--hairline)] rounded-2xl bg-[var(--canvas-soft)] group transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-wide">{getProviderName(key.provider)}</span>
                      {config.activeKeyId === key.id && (
                        <span className="bg-[var(--ink)] text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Active</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setConfig({ ...config, activeKeyId: key.id })}
                        disabled={config.activeKeyId === key.id}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${config.activeKeyId === key.id ? 'bg-[var(--ink)] text-[var(--canvas)]' : 'bg-[var(--surface-card)] border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--canvas)] shadow-sm'}`}
                      >
                        {config.activeKeyId === key.id ? 'In Use' : 'Use This'}
                      </button>
                      <button 
                        onClick={() => setConfig({ ...config, keys: config.keys.filter(k => k.id !== key.id), activeKeyId: config.activeKeyId === key.id ? null : config.activeKeyId })}
                        className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-[var(--surface-card)] border border-[var(--hairline)] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--hairline)]">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">API Key</label>
                      <div className="text-[11px] font-mono text-[var(--muted)] opacity-60">••••••••{key.value.slice(-4)}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">Active Model</label>
                      <select 
                        value={key.preferredModel}
                        onChange={(e) => updateKeyModel(key.id, e.target.value)}
                        className="w-full bg-[var(--canvas)] border border-[var(--hairline)] rounded-lg px-2 py-1.5 text-[11px] font-medium focus:outline-none focus:border-[var(--ink)] appearance-none cursor-pointer"
                      >
                        {formatModelsForProvider(registry, key.provider).map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {config.keys.length === 0 && (
                <div className="text-center py-8 bg-[var(--canvas-soft)] rounded-2xl border border-dashed border-[var(--hairline-strong)]">
                  <p className="text-[12px] text-[var(--muted)]">No keys configured yet.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em]">Register New Provider</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Provider</label>
                  <div className="relative">
                    <select 
                      id="newKeyProvider"
                      value={selectedRegProvider}
                      onChange={(e) => setSelectedRegProvider(e.target.value)}
                      className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-[13px] font-medium focus:outline-none focus:border-[var(--ink)] appearance-none cursor-pointer pr-10"
                    >
                      {availableProviders.map(pId => (
                        <option key={pId} value={pId}>{getProviderName(pId)}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Preferred Model</label>
                  <div className="relative">
                    <select 
                      id="newKeyModel"
                      className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-[13px] font-medium focus:outline-none focus:border-[var(--ink)] appearance-none cursor-pointer pr-10"
                    >
                      {modelsForNewKey.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">API Key</label>
                <input 
                  id="newKeyValue" 
                  type="password" 
                  placeholder="Paste your key here..." 
                  className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-[12px] font-mono focus:outline-none focus:border-[var(--ink)]" 
                />
              </div>
            </div>
            <button 
              onClick={() => {
                const p = (document.getElementById('newKeyProvider') as HTMLSelectElement).value;
                const m = (document.getElementById('newKeyModel') as HTMLSelectElement).value;
                const v = (document.getElementById('newKeyValue') as HTMLInputElement).value;
                if (!v) return;
                
                const providerInfo = registry[p];
                const newKey: APIKey = {
                  id: Math.random().toString(),
                  name: getProviderName(p),
                  provider: p,
                  value: v,
                  preferredModel: m,
                  baseURL: providerInfo?.api
                };
                setConfig({ ...config, keys: [...config.keys, newKey], activeKeyId: newKey.id });
                (document.getElementById('newKeyValue') as HTMLInputElement).value = '';
              }}
              className="w-full py-3.5 bg-[var(--ink)] text-[var(--canvas)] rounded-full text-[13px] font-medium shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Add Credential
            </button>
          </section>
          
        </div>

        <footer className="px-8 py-6 border-t border-[var(--hairline)] bg-[var(--canvas)] flex justify-end shrink-0">
          <button 
            onClick={onClose} 
            className="px-8 py-3 rounded-full text-[13px] font-medium bg-[var(--ink)] text-[var(--canvas)] shadow-sm hover:opacity-90 transition-all"
          >
            Dismiss Settings
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
