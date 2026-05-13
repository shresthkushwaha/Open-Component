import React, { useState } from 'react';

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string, description: string, type: 'atomic' | 'suite') => Promise<void>;
  isGenerating: boolean;
}

const PRESETS = [
  "Neo-brutalist, sharp corners, acid yellow accent, monospace fonts.",
  "Soft glassmorphism, pastel gradients, rounded pill shapes, bouncy motion.",
  "Minimalist monochrome, deep obsidian, sharp borders, editorial typography.",
  "Cyberpunk, neon glows, dark surface, glitchy fluid motion."
];

const NewFileModal: React.FC<NewFileModalProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'atomic' | 'suite' | null>(null);

  if (!isOpen) return null;

  const handleSelectType = (selectedType: 'atomic' | 'suite') => {
    if (selectedType === 'atomic') {
      onGenerate('', '', 'atomic');
    } else {
      setType('suite');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500 inter-ui">
      <div className="bg-[var(--surface-card)] rounded-[32px] w-full max-w-xl shadow-[var(--modal-shadow)] border border-[var(--hairline)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col">
        <header className="px-8 py-6 border-b border-[var(--hairline)] flex justify-between items-center bg-[var(--canvas)] shrink-0">
          <h2 className="text-2xl font-light display-serif text-[var(--ink)]">
            {type === 'suite' ? 'Configure Component Set' : 'New Creation'}
          </h2>
          <button onClick={onClose} disabled={isGenerating} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </header>

        <div className="p-8 space-y-10 overflow-y-auto">
          {!type ? (
            <div className="space-y-6">
              <p className="text-[13px] text-[var(--muted)] text-center">Select the scope of your new project</p>
              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => handleSelectType('atomic')}
                  disabled={isGenerating}
                  className="p-8 rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas-soft)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface-card)] hover:shadow-xl transition-all group text-left flex flex-col items-start"
                >
                  <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center bg-[var(--surface-strong)] group-hover:bg-[var(--ink)] group-hover:text-[var(--canvas)] transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v1m0 14v1m8-8h1M3 12h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div className="text-[16px] font-bold mb-2">Single Component</div>
                  <div className="text-[11px] leading-relaxed text-[var(--muted)]">Generate a standalone piece instantly.</div>
                </button>

                <button 
                  onClick={() => handleSelectType('suite')}
                  disabled={isGenerating}
                  className="p-8 rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas-soft)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface-card)] hover:shadow-xl transition-all group text-left flex flex-col items-start"
                >
                  <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center bg-[var(--surface-strong)] group-hover:bg-[var(--ink)] group-hover:text-[var(--canvas)] transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeWidth="2"/></svg>
                  </div>
                  <div className="text-[16px] font-bold mb-2">Component Set</div>
                  <div className="text-[11px] leading-relaxed text-[var(--muted)]">Build a cohesive family of elements.</div>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em]">Set Identifier</label>
                <input 
                  type="text" 
                  placeholder="e.g. Navigation Ecosystem" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-2xl px-5 py-4 text-[14px] focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--muted)]"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em] flex items-center justify-between">
                  Core Aesthetic
                  <span className="text-[10px] font-medium normal-case text-[var(--muted)]">Tokens are derived from this intent</span>
                </label>
                <textarea 
                  placeholder="Describe the aesthetic, colors, mood, and typography..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-2xl px-5 py-4 text-[14px] focus:outline-none focus:border-[var(--ink)] transition-colors min-h-[140px] resize-none placeholder:text-[var(--muted)]"
                />
                
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => setDescription(p)}
                        disabled={isGenerating}
                        className="text-[10px] bg-[var(--surface-strong)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hairline)] px-4 py-2 rounded-full transition-all border border-transparent font-semibold uppercase tracking-[0.05em] disabled:opacity-50"
                      >
                        {p.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {type && (
          <footer className="px-8 py-6 border-t border-[var(--hairline)] bg-[var(--canvas)] flex justify-end gap-4 shrink-0">
            <button 
              onClick={() => setType(null)} 
              disabled={isGenerating}
              className="px-6 py-3 rounded-full text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50 mr-auto"
            >
              Back
            </button>
            <button 
              onClick={onClose} 
              disabled={isGenerating}
              className="px-6 py-3 rounded-full text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => onGenerate(name, description, 'suite')}
              disabled={!name.trim() || !description.trim() || isGenerating}
              className="px-8 py-3 rounded-full text-[13px] font-medium bg-[var(--ink)] text-[var(--canvas)] shadow-sm hover:opacity-90 transition-all disabled:opacity-20 flex items-center gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--canvas)]/20 border-t-[var(--canvas)] rounded-full animate-spin" />
                  Composing...
                </>
              ) : 'Establish Set'}
            </button>
          </footer>
        )}

        {isGenerating && type === 'suite' && (
          <div className="absolute inset-0 bg-[var(--surface-card)]/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-[var(--hairline)] border-t-[var(--ink)] rounded-full animate-spin" />
             <p className="text-[14px] font-medium text-[var(--ink)] animate-pulse">Establishing Design System...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewFileModal;
