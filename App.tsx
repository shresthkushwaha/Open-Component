import React, { useState, useEffect, useMemo, useRef } from 'react';
import { aiService, AIProviderConfig } from './services/aiService';
import { dbService } from './services/dbService';
import { Component, ComponentFile, UserConfig, APIKey } from './types';

// UI Components
import ComponentCard from './components/ComponentCard';
import ComponentDetail from './components/ComponentDetail';
import DesignSystemBadge from './components/DesignSystemBadge';
import NewFileModal from './components/NewFileModal';
import DesignSystemEditorModal from './components/DesignSystemEditorModal';
import SettingsModal from './components/SettingsModal';
import StreamingStudio from './components/StreamingStudio';
import logo from './assets/logo.png';
import { getStarterFile, getStarterComponents } from './utils/starterTemplate';
import OnboardingTour from './components/OnboardingTour';
import LandingPage from './LandingPage';

interface ImageAttachment {
  data: string;
  mimeType: string;
}

const App: React.FC = () => {
  // State: View
  const [view, setView] = useState<'landing' | 'studio'>(() => {
    // Check if launched as PWA or via direct link
    const urlParams = new URLSearchParams(window.location.search);
    const isPwa = urlParams.get('pwa') === 'true' || 
                  window.matchMedia('(display-mode: standalone)').matches;
    
    return isPwa ? 'studio' : 'landing';
  });

  // State: Data
  const [files, setFiles] = useState<ComponentFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  
  // State: UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isDesignSystemEditorOpen, setIsDesignSystemEditorOpen] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [activeTweaks, setActiveTweaks] = useState<Record<string, string | number>>({});

  // Renaming state
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  
  // State: Generation
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingRaw, setStreamingRaw] = useState('');
  const [streamingPrompt, setStreamingPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);

  // State: Config
  const [config, setConfig] = useState<UserConfig>(() => {
    const saved = localStorage.getItem('ALTR_USER_CONFIG');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration for keys property name
      if (parsed.apiKeys && !parsed.keys) {
        parsed.keys = parsed.apiKeys;
      }
      if (!parsed.keys) parsed.keys = [];
      return parsed;
    }
    return {
      id: 'main',
      activeKeyId: null,
      keys: [],
      appTheme: 'light',
      agentPersonality: 'terse',
      streamingEnabled: true,
      autoCritique: true,
      activeFileId: null
    };
  });

  const activeKey = (config.keys || []).find(k => k.id === config.activeKeyId);
  const activeFile = (files || []).find(f => f.id === activeFileId);
  const activeComponent = (components || []).find(c => c.id === activeComponentId);

  // Sync theme
  useEffect(() => {
    if (config.appTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [config.appTheme]);

  // Sync config to localStorage
  useEffect(() => {
    localStorage.setItem('ALTR_USER_CONFIG', JSON.stringify(config));
  }, [config]);

  // Inject Google Fonts
  useEffect(() => {
    if (!activeFile?.designSystem) return;
    const { fontDisplay, fontBody } = activeFile.designSystem.tokens;
    const fonts = [fontDisplay, fontBody].filter(Boolean);
    if (fonts.length === 0) return;

    const linkId = 'ds-fonts-link';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const fontQuery = fonts.map(f => f.replace(/\s+/g, '+')).join('|');
    link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700;800&display=swap`;
  }, [activeFileId, files]);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      let allFiles = await dbService.getAllFiles();
      
      if (allFiles.length === 0) {
        // Seed database if empty
        const starterFile = getStarterFile();
        const starterComponents = getStarterComponents();
        
        await dbService.saveFile(starterFile);
        for (const comp of starterComponents) {
          await dbService.saveComponent(comp);
        }
        
        allFiles = [starterFile];
      }

      setFiles(allFiles);
      if (allFiles.length > 0) {
        const currentId = localStorage.getItem('activeFileId');
        const fileExists = allFiles.some(f => f.id === currentId);
        if (!currentId || !fileExists) {
          setActiveFileId(allFiles[0].id);
        } else {
          setActiveFileId(currentId);
        }
      }
    };
    loadData();
  }, []);

  // Trigger onboarding tour
  useEffect(() => {
    if (view === 'studio' && !localStorage.getItem('onboarding_completed')) {
      // Delay slightly to ensure layout is ready
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // Load components when active file changes
  useEffect(() => {
    if (!activeFileId) {
      setComponents([]);
      return;
    }
    const loadComponents = async () => {
      const comps = await dbService.getComponentsForFile(activeFileId);
      setComponents(comps);
    };
    loadComponents();
    setConfig(prev => ({ ...prev, activeFileId }));
  }, [activeFileId]);

  // Init active tweaks when opening a component
  useEffect(() => {
    if (activeComponent?.tweaks) {
      const initial: Record<string, string | number> = {};
      activeComponent.tweaks.forEach(t => { initial[t.property] = t.value; });
      setActiveTweaks(initial);
    } else {
      setActiveTweaks({});
    }
  }, [activeComponentId, activeComponent]);


  // ---------------------------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------------------------

  const handleCreateFile = async (name: string, description: string, type: 'atomic' | 'suite') => {
    if (!activeKey || !activeKey.value) {
      alert("Please configure an API key first.");
      return;
    }

    setIsGenerating(true);
    try {
      const aiConfig: AIProviderConfig = {
        provider: activeKey.provider,
        apiKey: activeKey.value,
        model: activeKey.preferredModel,
        baseURL: activeKey.baseURL
      };

      let ds: any;

      if (type === 'atomic') {
        ds = {
          id: Math.random().toString(36).substring(7),
          name: 'Independent',
          description: 'Prompt-driven standalone component.',
          tokens: {
            primaryColor: '#000000',
            surfaceColor: '#ffffff',
            textColor: '#000000',
            fontDisplay: 'Inter',
            fontBody: 'Inter',
            radiusScale: 'soft',
            motionPreset: 'fluid'
          },
          systemPromptAddendum: 'No pre-established design system. Rely entirely on the user prompt for visual style.'
        };
      } else {
        const contextualDescription = `${description}\n\nIMPORTANT: This is a COMPONENT SUITE. The design system must be robust enough to support a wide variety of related elements (buttons, inputs, cards, etc.) with total visual cohesion.`;
        const dsResponse = await aiService.generateDesignSystem(contextualDescription, aiConfig);
        ds = {
          id: Math.random().toString(36).substring(7),
          name: dsResponse.name,
          description: description || dsResponse.description || contextualDescription,
          tokens: dsResponse.tokens,
          systemPromptAddendum: `${dsResponse.systemPromptAddendum} (Optimized for systemic suite consistency)`
        };
      }
      
      const newFile: ComponentFile = {
        id: Math.random().toString(36).substring(7),
        name: type === 'atomic' ? 'New Component' : (name || ds.name),
        createdAt: Date.now(),
        designSystem: ds,
        type
      };

      await dbService.saveFile(newFile);
      setFiles(prev => [newFile, ...prev]);
      setActiveFileId(newFile.id);
      setIsNewFileModalOpen(false);
    } catch (e: any) {
      console.error(e);
      alert("Failed to create file: " + (e.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this component file and all its components?')) return;
    
    await dbService.deleteFile(id);
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files.length > 1 ? files.find(f => f.id !== id)?.id || null : null);
    }
  };

  const handleRenameFile = async (id: string, newName: string) => {
    const file = files.find(f => f.id === id);
    if (!file || !newName.trim()) {
      setEditingFileId(null);
      return;
    }
    const updatedFile = { ...file, name: newName.trim() };
    await dbService.saveFile(updatedFile);
    setFiles(prev => prev.map(f => f.id === id ? updatedFile : f));
    setEditingFileId(null);
  };

  const handleUpdateDesignSystem = async (updatedDesignSystem: any) => {
    if (!activeFile) return;
    const updatedFile = {
      ...activeFile,
      designSystem: updatedDesignSystem
    };
    await dbService.saveFile(updatedFile);
    setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const data = base64.split(',')[1];
      setSelectedImage({
        data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateComponent = async (targetPrompt: string, context?: string) => {
    if (!activeKey || !activeKey.value) {
      setIsSettingsOpen(true);
      return;
    }
    if (!activeFile) return;

    const finalPrompt = targetPrompt.trim() || (selectedImage ? "Generate a component based on this image reference." : "");
    if (!finalPrompt) return;

    setIsGenerating(true);
    setStreamingRaw('');
    setStreamingPrompt(finalPrompt);
    setPrompt('');

    try {
      const aiConfig: AIProviderConfig = {
        provider: activeKey.provider,
        apiKey: activeKey.value,
        model: activeKey.preferredModel,
        baseURL: activeKey.baseURL
      };

      const newCompData = await aiService.streamGenerateComponent(
        finalPrompt,
        activeFile.designSystem,
        aiConfig,
        (delta, full) => setStreamingRaw(full),
        context,
        selectedImage || undefined
      );

      const newComp: Component = {
        ...newCompData,
        id: Math.random().toString(36).substring(7),
        fileId: activeFile.id,
        timestamp: Date.now(),
        prompt: finalPrompt
      };

      await dbService.saveComponent(newComp);
      setComponents(prev => [newComp, ...prev]);
      setActiveComponentId(newComp.id);
      setSelectedImage(null);
    } catch (e: any) {
      console.group('🔴 Generation Parse Error');
      console.error('Error:', e?.message || e);
      console.error('Stack:', e?.stack);
      console.groupEnd();
      alert(`Generation Error: ${e?.message || 'Unknown error'}. Check the browser console (F12) for the raw output.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateComponent = async (compId: string, updates: Partial<Component>) => {
    const comp = components.find(c => c.id === compId);
    if (!comp) return;
    const updatedComp = { ...comp, ...updates };
    await dbService.saveComponent(updatedComp);
    setComponents(prev => prev.map(c => c.id === compId ? updatedComp : c));
  };

  const handleDeleteComponent = async (compId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this component version?')) return;
    await dbService.deleteComponent(compId);
    setComponents(prev => prev.filter(c => c.id !== compId));
    if (activeComponentId === compId) setActiveComponentId(null);
  };

  const handleTweakChange = (property: string, value: string | number) => {
    setActiveTweaks(prev => ({ ...prev, [property]: value }));
  };

  const handleRegenerate = async (refinement: string) => {
    if (!activeComponent) return;
    const context = `Previous version prompt: ${activeComponent.prompt}\n\nRequested refinement: ${refinement}`;
    await handleGenerateComponent(refinement, context);
  };

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('studio')} />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 font-sans selection:bg-black/10 dark:selection:bg-white/20">
      
      {/* Sidebar */}
      <aside 
        id="sidebar-container"
        className={`${isSidebarOpen ? 'w-80' : 'w-0'} border-r border-[var(--hairline)] transition-all duration-300 overflow-hidden flex flex-col bg-[var(--canvas-soft)] z-20`}
      >
        <div className="p-8 flex items-center justify-between">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Logo" className="w-8 h-8 theme-logo" />
            <h1 className="text-[20px] font-medium display-serif tracking-tight text-[var(--ink)]">Open Component</h1>
          </button>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
          </button>
        </div>

        <div className="px-6 pb-8">
          <button 
            onClick={() => setIsNewFileModalOpen(true)}
            className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[13px] font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>New Component</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="mb-6 px-2">
            <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.15em] opacity-80">Your Library</h4>
          </div>
          <div className="space-y-1">
            {files.map(file => (
              <div 
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`group flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeFileId === file.id 
                    ? 'bg-black/[0.04] dark:bg-white/10' 
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                }`}
              >
                <span className={`text-[13.5px] ${activeFileId === file.id ? 'font-medium text-[var(--ink)]' : 'text-[var(--body)]'}`}>
                  {file.name}
                </span>
                {activeFileId === file.id && (
                   <button 
                   onClick={(e) => handleDeleteFile(file.id, e)}
                   className="p-1 text-[var(--muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <DeleteIcon />
                 </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--hairline)]">
          <button 
            id="settings-trigger-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 w-full p-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-xl transition-colors mb-4 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--surface-strong)] flex items-center justify-center text-[11px] font-bold text-[var(--muted)]">
              UK
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[12px] font-bold text-[var(--ink)]">Settings</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-dot-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider truncate">
                  {activeKey?.provider || 'Connected'}
                </span>
              </div>
            </div>
          </button>
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group w-full text-left"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">BYOK — Privacy & About</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--canvas)]">
        {/* Atmospheric Background */}
        <div className="orb-container">
          <div className="orb orb-mint" />
          <div className="orb orb-peach" />
        </div>

        {/* Top Header (Subtle) */}
        <header className="h-16 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 hover:bg-black/5 rounded-lg transition-all active:scale-95"
              >
                <img src={logo} alt="Logo" className="w-8 h-8 theme-logo" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-medium display-serif text-[var(--ink)]">
                {activeFile?.name || 'Open Component'}
              </h2>
              {activeFile && activeFile.type === 'suite' && activeFile.designSystem && (
                <button 
                  id="ds-badge-btn"
                  onClick={() => setIsDesignSystemEditorOpen(true)}
                  className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <DesignSystemBadge designSystem={activeFile.designSystem} />
                </button>
              )}
            </div>
          </div>

          <button 
            onClick={() => setConfig(prev => ({ ...prev, appTheme: config.appTheme === 'dark' ? 'light' : 'dark' }))}
            className="p-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            {config.appTheme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </header>

        {/* Studio Canvas */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeFile ? (
            <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar">
              <div className="max-w-7xl mx-auto space-y-16 pb-48">
                {components.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--muted)] opacity-80">Ready to Compose</h3>
                    <p className="text-[15px] text-[var(--muted)] max-w-md leading-relaxed inter-ui px-4">
                      Use the editorial prompt bar below to generate your first component in <span className="text-[var(--ink)] font-bold">{activeFile.name}</span>.
                    </p>
                  </div>
                ) : (
                  <section id="gallery-section" className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Studio History</h2>
                      <span className="text-[10px] font-bold opacity-20">{components.length} Versions</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2">
                      {components.map((comp, index) => (
                        <div key={comp.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                          <ComponentCard 
                            component={comp}
                            activeComponentId={activeComponentId}
                            onClick={() => setActiveComponentId(comp.id)}
                            onDelete={(e) => handleDeleteComponent(comp.id, e)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="w-24 h-24 rounded-[40px] bg-[var(--surface-strong)] flex items-center justify-center animate-pulse">
                 <img src={logo} alt="Logo" className="w-8 h-8 opacity-20" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-light display-serif">Select a project to begin</h3>
                <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">Create a new suite from the sidebar</p>
              </div>
            </div>
          )}

          {activeFile && (
            <div id="prompt-input-container" className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
              <div className="bg-white dark:bg-[#0c0c0c] border border-[var(--hairline-strong)] rounded-full p-1.5 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] group transition-all duration-300 focus-within:shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
                <label className="p-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-full cursor-pointer transition-colors text-[var(--muted)] hover:text-[var(--ink)]">
                  <ImageIcon />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                
                <input 
                  className="flex-1 bg-transparent border-none outline-none px-4 text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  placeholder="Describe your component (e.g. 'number masking', 'editorial newsletter')..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateComponent(prompt);
                    }
                  }}
                />

                {selectedImage && (
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[var(--hairline)] mr-2 group/img">
                    <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} className="w-full h-full object-cover" />
                    <button onClick={() => setSelectedImage(null)} className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                )}

                <button 
                  disabled={isGenerating || (!prompt.trim() && !selectedImage)}
                  onClick={() => handleGenerateComponent(prompt)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isGenerating || (!prompt.trim() && !selectedImage)
                      ? 'bg-[var(--surface-strong)] text-[var(--muted)] opacity-50 cursor-not-allowed' 
                      : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 shadow-lg'
                  }`}
                >
                  {isGenerating ? <LoadingSpinner /> : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Component Detail Drawer */}
        {activeComponent && activeFile?.designSystem && (
          <ComponentDetail 
            component={activeComponent}
            designSystem={activeFile.designSystem}
            activeTweaks={activeTweaks}
            onClose={() => setActiveComponentId(null)}
            onTweakChange={handleTweakChange}
            onRegenerate={handleRegenerate}
            isGenerating={isGenerating}
          />
        )}

        {/* Streaming Overlay */}
        {isGenerating && (
          <StreamingStudio 
            prompt={streamingPrompt}
            rawStream={streamingRaw}
            onClose={() => setIsGenerating(false)}
          />
        )}
      </main>

      {/* Modals */}
      <NewFileModal 
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onGenerate={handleCreateFile}
        isGenerating={isGenerating}
      />

      <DesignSystemEditorModal 
        isOpen={isDesignSystemEditorOpen}
        onClose={() => setIsDesignSystemEditorOpen(false)}
        designSystem={activeFile?.designSystem}
        onSave={handleUpdateDesignSystem}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        setConfig={setConfig}
      />
      {showTour && (
        <OnboardingTour 
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem('onboarding_completed', 'true');
          }} 
        />
      )}
    </div>
  );
};

// Icons & Small Components
const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SidebarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default App;
