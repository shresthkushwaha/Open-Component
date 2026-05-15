import React, { useEffect, useRef } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = React.useState('home');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance Animations (Only for hero section)
      gsap.from('#home .reveal', {
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.4,
        clearProps: 'opacity,y' // Ensure visibility even if animation is interrupted
      });

      // Floating Shapes Parallax
      gsap.to('.floating-shape-1', {
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: 200,
        rotation: 45,
        ease: 'none'
      });

      gsap.to('.floating-shape-2', {
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        },
        y: -150,
        x: 50,
        rotation: -25,
        ease: 'none'
      });

      // Section-by-Section Reveal
      const sections = gsap.utils.toArray<HTMLElement>('section:not(#home)');
      sections.forEach(section => {
        const reveals = section.querySelectorAll('.reveal');
        if (reveals.length > 0) {
          gsap.from(reveals, {
            scrollTrigger: {
              trigger: section,
              start: 'top 85%', // Start earlier to ensure visibility
              toggleActions: 'play none none none', // Only play once to avoid flickering
              // markers: true, // Uncomment for debugging
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'opacity,y'
          });
        }
      });

      // Scroll Progress indicator
      gsap.to('.scroll-line', {
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3
        },
        scaleY: 1,
        ease: 'none'
      });

      // Active Section Highlighting
      const sectionIds = ['home', 'features', 'workflow-section', 'guide', 'pricing', 'privacy'];
      const mapping: Record<string, string> = {
        'home': 'home',
        'features': 'features',
        'workflow-section': 'features',
        'guide': 'guide',
        'pricing': 'pricing',
        'privacy': 'privacy'
      };

      sectionIds.forEach((id, index) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: index === 0 ? 'top top' : 'top 30%',
          end: index === sectionIds.length - 1 ? 'bottom bottom' : 'bottom 30%',
          onToggle: (self) => {
            if (self.isActive) setActiveSection(mapping[id]);
          }
        });
      });

      // Background Text Parallax
      gsap.to('.bg-text-parallax', {
        scrollTrigger: {
          trigger: '#workflow-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        x: -100,
        ease: 'none'
      });
      
      ScrollTrigger.refresh();
    }, containerRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useEffect(() => {
    // Forcefully block all wheel/scroll events from reaching the background canvas
    const preventCanvasScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#hero-gradient-container') || target.tagName === 'CANVAS') {
        // We don't preventDefault here because we want the page to scroll, 
        // but we want to make sure the canvas doesn't see it.
        // Actually, if the canvas has a global listener, we can't easily stop it without stopPropagation
        // but scroll events don't bubble. 
        // However, if the library uses 'wheel', we can try to stop it.
        e.stopPropagation();
      }
    };

    window.addEventListener('wheel', preventCanvasScroll, { capture: true });
    return () => window.removeEventListener('wheel', preventCanvasScroll, { capture: true });
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white font-sans selection:bg-[#a7e5d3]/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-transparent border-b border-white/5">
        <a
          href="#home"
          onClick={(e) => scrollToSection(e, 'home')}
          className="flex items-center gap-3 group"
        >
          <img src="pwa-192x192.png" alt="Logo" className="h-8 w-8 invert transition-transform group-hover:scale-110" />
          <span className="text-xl font-light display-serif tracking-tight transition-colors group-hover:text-[#a7e5d3]">Open Component</span>
        </a>
        <div className="flex items-center gap-8 text-sm font-medium">
          <a 
            href="#features" 
            onClick={(e) => scrollToSection(e, 'features')} 
            className={`transition-all duration-300 ${activeSection === 'features' ? 'text-[#a7e5d3]' : 'text-white/40 hover:text-white'}`}
          >
            Features
          </a>
          <a 
            href="#guide" 
            onClick={(e) => scrollToSection(e, 'guide')} 
            className={`transition-all duration-300 ${activeSection === 'guide' ? 'text-[#a7e5d3]' : 'text-white/40 hover:text-white'}`}
          >
            Guide
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => scrollToSection(e, 'pricing')} 
            className={`transition-all duration-300 ${activeSection === 'pricing' ? 'text-[#a7e5d3]' : 'text-white/40 hover:text-white'}`}
          >
            Pricing
          </a>
          <a 
            href="#privacy" 
            onClick={(e) => scrollToSection(e, 'privacy')} 
            className={`transition-all duration-300 ${activeSection === 'privacy' ? 'text-[#a7e5d3]' : 'text-white/40 hover:text-white'}`}
          >
            Privacy
          </a>
          <button 
            onClick={onLaunch}
            className="px-6 py-2.5 bg-white text-black rounded-full hover:bg-[#a7e5d3] transition-all font-semibold"
          >
            Launch Studio
          </button>
        </div>
      </nav>

      {/* Progress Line */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 h-64 w-[1px] bg-white/5 z-50 overflow-hidden hidden lg:block">
        <div className="scroll-line w-full h-full bg-[#a7e5d3] origin-top scale-y-0" />
      </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-8">
        <style>{`
          #hero-gradient-container canvas {
            pointer-events: none !important;
            touch-action: none !important;
          }
          .reveal {
            opacity: 1;
            visibility: visible;
          }
        `}</style>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 border border-white/5 rounded-full floating-shape-1 z-1" />
        <div className="absolute top-2/3 right-20 w-48 h-48 border border-white/5 rounded-[40px] floating-shape-2 z-1" />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-[#a7e5d3]/5 rounded-full blur-2xl animate-pulse z-1" />
        
        {/* Fixed Background Gradient */}
        <div id="hero-gradient-container" className="fixed inset-0 z-0 pointer-events-none">
          <ShaderGradientCanvas
            fov={45}
            pixelDensity={1}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <ShaderGradient
              control="props"
              animate="on"
              axesHelper="off"
              bgColor1="#000000"
              bgColor2="#000000"
              brightness={1}
              cAzimuthAngle={180}
              cDistance={2.8}
              cPolarAngle={80}
              cameraZoom={9.1}
              color1="#606080"
              color2="#8d7dca"
              color3="#212121"
              destination="onCanvas"
              embedMode="off"
              envPreset="city"
              format="gif"
              fov={45}
              frameRate={10}
              gizmoHelper="hide"
              grain="on"
              lightType="3d"
              pixelDensity={1}
              positionX={0}
              positionY={0}
              positionZ={0}
              reflection={0.1}
              rotationX={50}
              rotationY={0}
              rotationZ={-60}
              shader="defaults"
              type="waterPlane"
              uAmplitude={0}
              uDensity={1.5}
              uFrequency={0}
              uSpeed={0.3}
              uStrength={1.5}
              uTime={0}
              zoomOut={false}
              wireframe={false}
            />
          </ShaderGradientCanvas>
          <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black via-black/20 to-transparent z-1" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center hero-content">
          <div className="reveal inline-block px-4 py-1.5 mb-8 rounded-full border border-white/10 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#a7e5d3]/80">
            Truly Open • Forever Free • Local First
          </div>
          <h1 className="reveal text-6xl md:text-8xl font-light display-serif leading-[1.1] tracking-tight mb-8">
            The premier AI studio that belongs to <span className="italic text-[#a7e5d3]">you.</span>
          </h1>
          <p className="reveal text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
            Stop paying for cloud-locked design tools. Open Component is a professional-grade, open-source workspace for high-fidelity UI generation—completely private and powered by your own keys.
          </p>
          <div className="reveal flex justify-center gap-6 mt-4">
            <button 
              onClick={onLaunch}
              className="px-10 py-4 bg-[#a7e5d3] text-black rounded-full hover:bg-white transition-all font-bold text-lg shadow-[0_0_40px_rgba(167,229,211,0.2)]"
            >
              Start Designing for Free
            </button>
            <a 
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="px-10 py-4 border border-white/10 rounded-full hover:bg-white/5 transition-all font-medium text-lg"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-40 px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="reveal text-4xl md:text-5xl font-light display-serif mb-24 text-center">Engineered for Craft.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "BYOK Architecture",
                description: "Bring your own API keys. We support Gemini, Anthropic, and OpenAI, giving you total control over costs and models."
              },
              {
                title: "Editorial Design System",
                description: "Built on 'Quietly Editorial' principles. Every component generated adheres to a professional, minimalist aesthetic."
              },
              {
                title: "Magic Tweaks",
                description: "Refine CSS and logic in real-time. Patch generated code without full reloads for a seamless creative flow."
              }
            ].map((feature, i) => (
              <div key={i} className="reveal p-10 border border-white/5 hover:border-white/20 transition-all bg-[#050505]">
                <h3 className="text-2xl font-medium mb-5 text-white">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed text-lg font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow-section" className="relative z-10 py-40 px-8 bg-black border-t border-white/5 overflow-hidden">
        {/* Animated Background Text */}
        <div className="bg-text-parallax absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-bold text-white/[0.02] whitespace-nowrap pointer-events-none display-serif italic">
          Magic Workflow
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <h2 className="reveal text-4xl md:text-5xl font-light display-serif leading-tight">A workflow that feels like <span className="italic text-[#a7e5d3]">magic.</span></h2>
              <div className="space-y-10">
                {[
                  {
                    step: "01",
                    title: "Define the System",
                    desc: "Start with a project prompt. We generate a unique, cohesive design system that governs every component you build."
                  },
                  {
                    step: "02",
                    title: "Iterative Generation",
                    desc: "Describe what you need. From complex multi-state buttons to full dashboard widgets, the AI builds it using your tokens."
                  },
                  {
                    step: "03",
                    title: "Live Refinement",
                    desc: "Use Magic Tweaks to adjust spacing, colors, and logic without leaving the preview. Pure, real-time creative flow."
                  }
                ].map((item, i) => (
                  <div key={i} className="reveal flex gap-8 group">
                    <span className="text-2xl font-bold text-white/20 group-hover:text-[#a7e5d3] transition-colors">{item.step}</span>
                    <div className="space-y-2">
                      <h4 className="text-xl font-medium text-white">{item.title}</h4>
                      <p className="text-white/50 leading-relaxed font-light text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal relative aspect-[4/5] lg:aspect-square flex items-center justify-center">
               <div className="relative w-full max-w-md">
                 <div className="absolute top-0 right-0 p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl rotate-3 floating-shape-1">
                    <div className="flex gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-red-500/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                      <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-32 bg-white/10 rounded-full" />
                      <div className="h-1.5 w-24 bg-[#a7e5d3]/30 rounded-full" />
                      <div className="h-1.5 w-40 bg-white/5 rounded-full" />
                    </div>
                 </div>
                 
                 <div className="absolute bottom-10 -left-10 p-8 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl -rotate-3 floating-shape-2">
                    <div className="h-32 w-48 border border-[#a7e5d3]/20 rounded-xl flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-[#a7e5d3] blur-xl opacity-20 animate-pulse" />
                       <div className="w-1 h-20 bg-gradient-to-b from-[#a7e5d3] to-transparent opacity-40" />
                    </div>
                 </div>

                 <div className="w-full aspect-square border border-white/5 rounded-full flex items-center justify-center opacity-20">
                    <div className="w-3/4 aspect-square border border-white/5 rounded-full" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Support Section */}
      <section className="relative z-10 py-40 px-8 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="reveal text-4xl md:text-5xl font-light display-serif mb-16 leading-tight">Your keys. Your choice.</h2>
          <p className="reveal text-white/50 text-xl font-light mb-24 max-w-2xl mx-auto">
            Switch between providers on the fly. Compare outputs, optimize costs, and use the best model for the task at hand.
          </p>
          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
            {['Google Gemini', 'Anthropic Claude', 'OpenAI GPT-4', 'Llama 3'].map((model, i) => (
              <div key={i} className="py-8 border border-white/10 hover:border-white/30 transition-all hover:bg-white/5 grayscale hover:grayscale-0">
                <span className="text-sm font-bold uppercase tracking-widest text-white/80">{model}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Key Guide Section */}
      <section id="guide" className="relative z-10 py-40 px-8 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <div className="reveal inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                Setup Guide
              </div>
              <h2 className="reveal text-4xl md:text-5xl font-light display-serif leading-tight">How to get started <br /><span className="italic text-[#a7e5d3]">for free.</span></h2>
              <p className="reveal text-white/50 text-lg font-light mt-6">
                Most top-tier AI providers offer generous free tiers for developers. You can get started today without spending a dime.
              </p>
            </div>
            <div className="reveal hidden md:block">
               {/* Badge removed as requested */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                provider: "Google Gemini",
                tier: "Free Tier Available",
                desc: "Get free access to Gemini 1.5 Pro and Flash with high rate limits via Google AI Studio.",
                link: "https://aistudio.google.com/",
                cta: "Get Gemini Key"
              },
              {
                provider: "NVIDIA NIM",
                tier: "1,000 Free Credits",
                desc: "Access Llama 3, Mixtral, and specialized models via NVIDIA's global API catalog.",
                link: "https://build.nvidia.com/",
                cta: "Get NVIDIA Key"
              },
              {
                provider: "Groq Cloud",
                tier: "Free Beta Tier",
                desc: "The world's fastest inference for Llama 3 and Mixtral. Perfect for rapid prototyping.",
                link: "https://console.groq.com/",
                cta: "Get Groq Key"
              },
              {
                provider: "OpenRouter",
                tier: "Universal API",
                desc: "A single API for every model. Access dozens of free and low-cost models in one place.",
                link: "https://openrouter.ai/",
                cta: "Explore Models"
              }
            ].map((item, i) => (
              <div key={i} className="reveal group p-8 border border-white/5 bg-[#050505] hover:bg-white/[0.02] transition-all rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6 gap-4">
                    <h4 className="text-xl font-medium text-white display-serif">{item.provider}</h4>
                    <span className="text-[10px] font-bold text-[#a7e5d3] uppercase tracking-widest shrink-0">{item.tier}</span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed mb-8">{item.desc}</p>
                </div>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#a7e5d3] transition-colors"
                >
                  {item.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </a>
              </div>
            ))}
          </div>

          <div className="reveal mt-16 p-8 border border-white/5 bg-gradient-to-r from-[#050505] to-transparent rounded-2xl flex flex-col md:flex-row items-center gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-12 h-12 rounded-full border-2 border-black bg-white/5 flex items-center justify-center overflow-hidden">
                   <div className="w-6 h-6 bg-[#a7e5d3]/20 rounded-full" />
                </div>
              ))}
            </div>
            <div className="text-center md:text-left flex-1">
               <h5 className="text-white font-medium mb-1">Ready to build?</h5>
               <p className="text-white/40 text-sm">Once you have your key, paste it in the <span className="text-white font-medium">Settings</span> menu inside the Studio. It's stored locally and never leaves your browser.</p>
            </div>
            <button 
              onClick={onLaunch}
              className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#a7e5d3] transition-all"
            >
              Open Studio Settings
            </button>
          </div>
        </div>
      </section>

      {/* Pricing & Comparison Section */}
      <section id="pricing" className="relative z-10 py-40 px-8 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="reveal inline-block px-4 py-1.5 mb-6 rounded-full border border-[#a7e5d3]/20 text-[11px] font-bold uppercase tracking-[0.2em] text-[#a7e5d3]">
              Transparency
            </div>
            <h2 className="reveal text-4xl md:text-6xl font-light display-serif mb-8 leading-tight">Professional tools<br />shouldn't have a <span className="italic text-[#a7e5d3]">paywall.</span></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Pricing Card */}
            <div className="reveal p-12 border border-[#a7e5d3]/20 bg-gradient-to-br from-[#a7e5d3]/5 to-transparent rounded-3xl space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-medium text-white mb-2">Community Edition</h3>
                  <p className="text-white/40">Free, Open Source, Forever.</p>
                </div>
                <span className="text-5xl font-light display-serif text-[#a7e5d3]">$0</span>
              </div>
              
              <ul className="space-y-4 pt-8 border-t border-white/5">
                {[
                  "Unlimited Component Generations",
                  "Full Design System Control",
                  "Magic Tweak Live Refinement",
                  "Direct Code Export (React/Vite)",
                  "All AI Providers (Gemini, Claude, GPT)",
                  "Local-First Data Storage"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/60">
                    <svg className="w-5 h-5 text-[#a7e5d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button 
                onClick={onLaunch}
                className="w-full py-4 bg-[#a7e5d3] text-black rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
              >
                Launch Studio
              </button>
              <p className="text-center text-sm text-white/20 italic">No credit card. No subscription. Just build.</p>
            </div>

            {/* Comparison Logic */}
            <div className="space-y-12 py-6">
              <div className="reveal space-y-4">
                <h4 className="text-2xl font-medium text-white">Why we built this.</h4>
                <p className="text-white/50 leading-relaxed text-lg font-light">
                  Most AI tools like <span className="text-white font-medium">V0</span>, <span className="text-white font-medium">Bolt.new</span>, and <span className="text-white font-medium">Lovable</span> focus on building entire apps, often behind expensive monthly subscriptions and cloud-locked code.
                </p>
                <p className="text-white/50 leading-relaxed text-lg font-light">
                  Open Component is different. We are 100% focused on the <span className="text-white font-medium italic underline decoration-[#a7e5d3]/40 underline-offset-4">Art of the Component</span>. We believe your UI building blocks should be private, local, and free to craft.
                </p>
              </div>

              <div className="reveal space-y-6">
                <h4 className="text-xl font-medium text-white/80">The Open Difference</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 border border-white/5 bg-[#050505] rounded-xl">
                    <div className="text-[#a7e5d3] font-bold mb-2 uppercase text-[10px] tracking-widest">Competition</div>
                    <div className="text-white/40 text-sm leading-relaxed">
                      $20/mo subscriptions<br />
                      Cloud-locked storage<br />
                      Proprietary black boxes<br />
                      General app focus
                    </div>
                  </div>
                  <div className="p-6 border border-[#a7e5d3]/20 bg-[#050505] rounded-xl">
                    <div className="text-[#a7e5d3] font-bold mb-2 uppercase text-[10px] tracking-widest">Open Component</div>
                    <div className="text-white/80 text-sm leading-relaxed">
                      $0 Free Forever<br />
                      Local-first Privacy<br />
                      Open Source (MIT)<br />
                      Component-First Craft
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="relative z-10 py-40 px-8 bg-black border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="reveal text-4xl md:text-5xl font-light display-serif mb-12 text-white leading-tight">Privacy is not a feature.<br />It's the foundation.</h2>
          <div className="reveal text-left space-y-10 text-white/60 text-xl font-light leading-relaxed">
            <p>
              Open Component is a <strong>BYOK (Bring Your Own Key)</strong> application. We never see your API keys; they are stored locally in your browser's encrypted storage.
            </p>
            <p>
              All component data, prompts, and design systems are stored in <strong>IndexedDB</strong> on your device. We have no backend servers and no tracking. Your creative process remains entirely yours.
            </p>
            <p>
              We believe the future of AI tools is local-first. Open Component is built to be a permanent, private part of your developer toolkit.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <img src="/pwa-192x192.png" alt="Logo" className="h-6 w-6 invert grayscale" />
            <span className="text-sm font-light display-serif">Open Component Studio</span>
          </a>
          <div className="flex gap-8 text-sm text-white/20">
            <a href="https://github.com/shresthkushwaha/Open-Component" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/shresth-kushwaha-b67660277" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
          <div className="text-[12px] text-white/20 text-right">
            <div>© {new Date().getFullYear()} Open Component.</div>
            <div className="mt-1 font-medium text-white/40 tracking-wide uppercase">BYOK Architecture</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
