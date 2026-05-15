import React, { useState, useEffect } from 'react';
import { DesignSystem } from '../types';

interface DesignSystemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  designSystem: DesignSystem;
  onSave: (updatedSystem: DesignSystem) => Promise<void>;
}

const RADIUS_OPTIONS = ['sharp', 'soft', 'pill'] as const;
const MOTION_OPTIONS = ['snappy', 'bouncy', 'fluid'] as const;
const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro', 'Slabo 27px', 'Raleway', 'PT Sans',
  'Poppins', 'Nunito', 'Ubuntu', 'Lora', 'Playfair Display', 'Merriweather', 'PT Serif', 'Noto Sans', 'Titillium Web',
  'Muli', 'Arimo', 'Dosis', 'Abel', 'Quicksand', 'Josefin Sans', 'Libre Baskerville', 'Inconsolata', 'Anton', 'Pacifico',
  'Indie Flower', 'Dancing Script', 'Shadows Into Light', 'Bebas Neue', 'Orbitron', 'Space Grotesk', 'Syne', 'Outfit',
  'Plus Jakarta Sans', 'DM Sans', 'Manrope', 'JetBrains Mono', 'Crimson Text', 'Spectral', 'EB Garamond', 'Cormorant Garamond'
].sort();

interface FontSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const FontSelect: React.FC<FontSelectProps> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredFonts = FONT_OPTIONS.filter(f => 
    f.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3 relative">
      <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input 
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch('');
          }}
          onBlur={() => {
            // Delay to allow clicking an option
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder="Search font..."
          className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-[13px] font-medium focus:outline-none focus:border-[var(--ink)]"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl shadow-[var(--modal-shadow)] z-[110] max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {filteredFonts.length > 0 ? (
            filteredFonts.map(font => (
              <button
                key={font}
                onClick={() => {
                  onChange(font);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[var(--canvas-soft)] transition-colors ${value === font ? 'text-[var(--ink)] font-bold' : 'text-[var(--body)]'}`}
              >
                {font}
              </button>
            ))
          ) : (
            <button
              onClick={() => {
                onChange(search);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[var(--canvas-soft)] transition-colors text-[var(--ink)] italic"
            >
              Use "{search}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const DesignSystemEditorModal: React.FC<DesignSystemEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  designSystem, 
  onSave 
}) => {
  const [formData, setFormData] = useState<DesignSystem | null>(designSystem || null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && designSystem) {
      setFormData(designSystem);
    }
  }, [isOpen, designSystem]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tokens: { ...prev.tokens, [field]: value }
      };
    });
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center md:p-6 animate-in fade-in duration-500 inter-ui">
      <div className="bg-[var(--surface-card)] rounded-t-[32px] md:rounded-[32px] w-full max-w-2xl shadow-[var(--modal-shadow)] border-t md:border border-[var(--hairline)] overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-500 flex flex-col h-[90vh] md:max-h-[90vh]">
        <header className="px-6 md:px-8 py-5 md:py-6 border-b border-[var(--hairline)] flex justify-between items-center bg-[var(--canvas)] shrink-0">
          <div>
            <h2 className="text-2xl font-light display-serif text-[var(--ink)]">Design System</h2>
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-[0.1em] mt-1 truncate max-w-[200px]">{formData.name}</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50 p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </header>

        <div className="p-6 md:p-8 overflow-y-auto space-y-10 custom-scrollbar">
          
          <section className="space-y-6">
            <h3 className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em]">Foundational Colors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {['primaryColor', 'surfaceColor', 'textColor'].map((field) => (
                <div key={field} className="space-y-3">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{field.replace('Color', '')}</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-[var(--hairline)] overflow-hidden" style={{ backgroundColor: formData.tokens[field as keyof DesignSystem['tokens']] }}>
                      <input 
                        type="color" 
                        value={formData.tokens[field as keyof DesignSystem['tokens']].startsWith('#') ? formData.tokens[field as keyof DesignSystem['tokens']] : '#000000'}
                        onChange={e => handleChange(field, e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <input 
                      type="text" 
                      value={formData.tokens[field as keyof DesignSystem['tokens']]}
                      onChange={e => handleChange(field, e.target.value)}
                      className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-xl pl-11 pr-4 py-2.5 text-[12px] font-mono focus:outline-none focus:border-[var(--ink)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em]">Typography</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FontSelect 
                label="Display" 
                value={formData.tokens.fontDisplay} 
                onChange={v => handleChange('fontDisplay', v)} 
              />
              <FontSelect 
                label="Body" 
                value={formData.tokens.fontBody} 
                onChange={v => handleChange('fontBody', v)} 
              />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em]">Atmospheric Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Corner Radius</label>
                <div className="flex bg-[var(--surface-strong)] p-1 rounded-full border border-[var(--hairline)]">
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleChange('radiusScale', opt)}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-full transition-all capitalize ${formData.tokens.radiusScale === opt ? 'bg-white shadow-sm text-[var(--ink)] border border-[var(--hairline)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Motion Quality</label>
                <div className="flex bg-[var(--surface-strong)] p-1 rounded-full border border-[var(--hairline)]">
                  {MOTION_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleChange('motionPreset', opt)}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-full transition-all capitalize ${formData.tokens.motionPreset === opt ? 'bg-white shadow-sm text-[var(--ink)] border border-[var(--hairline)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-[11px] font-bold text-[var(--ink)] uppercase tracking-[0.1em]">Directive Addendum</label>
            <textarea 
              value={formData.systemPromptAddendum}
              onChange={e => setFormData(prev => ({ ...prev, systemPromptAddendum: e.target.value }))}
              placeholder="Inject additional design logic..."
              className="w-full bg-[var(--canvas-soft)] border border-[var(--hairline)] rounded-2xl px-5 py-4 text-[13px] focus:outline-none focus:border-[var(--ink)] min-h-[100px] resize-none placeholder:text-[var(--muted)]"
            />
          </section>
          
        </div>

        <footer className="px-6 md:px-8 py-5 md:py-6 border-t border-[var(--hairline)] bg-[var(--canvas)] flex justify-end gap-3 md:gap-4 shrink-0">
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[12px] md:text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-full text-[12px] md:text-[13px] font-medium bg-[var(--ink)] text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Synchronizing...
              </>
            ) : 'Update System'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DesignSystemEditorModal;
