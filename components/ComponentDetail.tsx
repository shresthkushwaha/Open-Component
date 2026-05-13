import React, { useState } from 'react';
import { Component, DesignSystem } from '../types';
import InteractionPreview from './InteractionPreview';
import CodeBlock from './CodeBlock';

interface ComponentDetailProps {
  component: Component;
  designSystem: DesignSystem;
  onClose: () => void;
  activeTweaks: Record<string, string | number>;
  onTweakChange: (property: string, value: string | number) => void;
  onRegenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

const ComponentDetail: React.FC<ComponentDetailProps> = ({ 
  component, 
  designSystem, 
  onClose, 
  activeTweaks, 
  onTweakChange,
  onRegenerate,
  isGenerating
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'css' | 'js'>('preview');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    const cssTweaks = component.tweaks?.filter(t => ['slider', 'color', 'select', 'boolean'].includes(t.type)) || [];
    const contentTweaksRaw = component.tweaks?.filter(t => ['text', 'image'].includes(t.type)) || [];

    // Convert blob URLs to Base64 for export
    const contentTweaks: Record<string, { type: string, value: string }> = {};
    for (const t of contentTweaksRaw) {
      let val = String(activeTweaks[t.property] ?? t.value);
      if (t.type === 'image' && val.startsWith('blob:')) {
        try {
          const res = await fetch(val);
          const blob = await res.blob();
          val = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error('Failed to convert blob to base64', e);
        }
      }
      contentTweaks[t.property] = { type: t.type, value: val };
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${designSystem.tokens.fontDisplay.replace(/ /g, '+')}:wght@400;700&family=${designSystem.tokens.fontBody.replace(/ /g, '+')}:wght@400;500;600&display=swap" rel="stylesheet">
  <script type="importmap">{"imports": {"gsap": "https://esm.sh/gsap@3.12.5"}}</script>
  <style>
    :root {
      /* Base Tokens */
      --color-primary: ${designSystem.tokens.primaryColor};
      --color-surface: ${designSystem.tokens.surfaceColor};
      --color-text: ${designSystem.tokens.textColor};
      --font-display: "${designSystem.tokens.fontDisplay}", sans-serif;
      --font-body: "${designSystem.tokens.fontBody}", sans-serif;
      
      /* CSS Tweaks */
${cssTweaks.map(t => `      ${t.property}: ${activeTweaks[t.property] ?? t.value}${t.unit || ''};`).join('\n')}
    }
    body { 
      margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh;
      background: var(--color-surface); font-family: var(--font-body); color: var(--color-text);
    }
${component.css}
  </style>
</head>
<body>
${component.html}
<script type="module">
${component.js}
</script>
${Object.keys(contentTweaks).length > 0 ? `
<script>
  // Apply content tweaks
  const contentTweaks = ${JSON.stringify(contentTweaks)};
  Object.entries(contentTweaks).forEach(([selector, config]) => {
    const el = document.querySelector(selector);
    if (el) {
      if (config.type === 'text') {
        el.innerText = config.value;
      } else if (config.type === 'image') {
        if (el.tagName.toLowerCase() === 'img') {
          el.src = config.value;
        } else {
          el.style.backgroundImage = 'url("' + config.value + '")';
        }
      }
    }
  });
</script>` : ''}
</body>
</html>`;
    navigator.clipboard.writeText(fullHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[var(--canvas)] z-50 flex flex-col animate-in fade-in zoom-in-95 duration-500 inter-ui">
      
      {/* Atmospheric Background (Subtle in Detail View) */}
      <div className="orb-container opacity-20">
        <div className="orb orb-mint" />
        <div className="orb orb-peach" />
      </div>

      <header className="h-16 border-b border-[var(--hairline)] flex items-center justify-between px-8 bg-[var(--canvas)] shrink-0 z-10">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-light display-serif text-[var(--ink)] leading-tight">{component.name}</h2>
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-[0.1em]">{designSystem.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--surface-strong)] p-1 rounded-full border border-[var(--hairline)]">
          {['preview', 'html', 'css', 'js'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-5 py-1.5 text-[11px] font-semibold rounded-full transition-all ${viewMode === mode ? 'bg-[var(--surface-card)] shadow-sm text-[var(--ink)] border border-[var(--hairline)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>

        <button 
          onClick={handleCopyCode}
          className={`px-6 py-2 rounded-full text-[13px] font-medium shadow-sm transition-all flex items-center gap-2 ${
            copied ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Export
            </>
          )}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative p-8 lg:p-12">
          {viewMode === 'preview' ? (
            <div className="h-full w-full rounded-[40px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.06)] border border-[var(--hairline)] bg-[var(--canvas-soft)] relative">
              <InteractionPreview interaction={component} designSystem={designSystem} activeTweaks={activeTweaks} />
              {isGenerating && (
                <div className="absolute inset-0 bg-[var(--canvas)]/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in">
                  <div className="flex items-center gap-3 bg-[var(--canvas-soft)] px-6 py-4 rounded-full shadow-2xl border border-[var(--hairline-strong)]">
                    <div className="w-4 h-4 border-2 border-[var(--hairline)] border-t-[var(--ink)] rounded-full animate-spin" />
                    <span className="text-[13px] font-semibold text-[var(--ink)]">Updating...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4">
              <CodeBlock 
                language={viewMode} 
                code={component[viewMode] || `// No ${viewMode.toUpperCase()} provided`} 
              />
            </div>
          )}
        </div>

        {/* Inspector Sidebar */}
        <aside className="w-80 bg-[var(--canvas)] border-l border-[var(--hairline)] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-8 space-y-12">
            
            {/* Context/Prompt */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-[0.1em]">Original Intent</h4>
              <p className="text-[13px] text-[var(--body)] leading-relaxed italic border-l-2 border-[var(--hairline-strong)] pl-4">
                "{component.prompt}"
              </p>
            </section>

            {/* Tweaks */}
            {component.tweaks && component.tweaks.length > 0 && (
              <section className="space-y-6">
                <h4 className="text-[10px] font-semibold text-[var(--ink)] uppercase tracking-[0.1em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]" />
                  Magic Tweaks
                </h4>
                <div className="space-y-8">
                  {component.tweaks.map(tweak => (
                    <div key={tweak.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-wide">{tweak.label}</label>
                        <span className="text-[10px] font-mono text-[var(--muted)]">
                          {activeTweaks[tweak.property] ?? tweak.value}{tweak.unit || ''}
                        </span>
                      </div>
                      {tweak.type === 'slider' ? (
                        <input 
                          type="range"
                          min={tweak.min ?? 0}
                          max={tweak.max ?? 100}
                          step={tweak.step ?? 1}
                          value={activeTweaks[tweak.property] ?? tweak.value}
                          onChange={(e) => onTweakChange(tweak.property, e.target.value)}
                          className="w-full accent-[var(--ink)] h-1 bg-[var(--hairline)] rounded-full appearance-none cursor-pointer"
                        />
                      ) : tweak.type === 'color' ? (
                        <input 
                          type="color"
                          value={String(activeTweaks[tweak.property] ?? tweak.value)}
                          onChange={(e) => onTweakChange(tweak.property, e.target.value)}
                          className="w-full h-8 rounded-lg border border-[var(--hairline)] bg-transparent cursor-pointer p-0.5"
                        />
                      ) : tweak.type === 'select' ? (
                        <select
                          value={String(activeTweaks[tweak.property] ?? tweak.value)}
                          onChange={(e) => onTweakChange(tweak.property, e.target.value)}
                          className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-[12px] font-medium focus:outline-none focus:border-[var(--ink)] transition-colors cursor-pointer"
                        >
                          {tweak.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : tweak.type === 'boolean' ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={Boolean(activeTweaks[tweak.property] ?? tweak.value)}
                            onChange={(e) => onTweakChange(tweak.property, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-[var(--hairline)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--ink)]"></div>
                        </label>
                      ) : tweak.type === 'image' ? (
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              onTweakChange(tweak.property, url);
                            }
                          }}
                          className="w-full text-[10px] text-[var(--muted)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[var(--surface-strong)] file:text-[var(--ink)] file:uppercase file:tracking-wider hover:file:opacity-80 transition-all cursor-pointer"
                        />
                      ) : (
                        <textarea 
                          value={String(activeTweaks[tweak.property] ?? tweak.value)}
                          onChange={(e) => onTweakChange(tweak.property, e.target.value)}
                          rows={2}
                          className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl px-4 py-3 text-[12px] focus:outline-none focus:border-[var(--ink)] transition-colors resize-none inter-ui"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI Refinement */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-[0.1em]">AI Refinement</h4>
              <div className="space-y-3">
                <textarea
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  placeholder="Ask for changes..."
                  className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl px-4 py-4 text-[13px] focus:outline-none focus:border-[var(--ink)] transition-colors min-h-[120px] resize-none placeholder:text-[var(--muted)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (refinementPrompt.trim()) {
                        onRegenerate(refinementPrompt);
                        setRefinementPrompt('');
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (refinementPrompt.trim()) {
                      onRegenerate(refinementPrompt);
                      setRefinementPrompt('');
                    }
                  }}
                  disabled={!refinementPrompt.trim() || isGenerating}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-[13px] font-medium shadow-sm hover:opacity-90 transition-all disabled:opacity-20"
                >
                  Apply Refinement
                </button>
              </div>
            </section>
            
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ComponentDetail;
