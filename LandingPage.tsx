import React, { useEffect, useRef } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import gsap from 'gsap';

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple Entrance Animations (No ScrollTrigger to avoid lag)
    const ctx = gsap.context(() => {
      gsap.from('.reveal', {
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.4,
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
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
          <span className="text-xl font-light display-serif tracking-tight">Open Component</span>
        </a>
        <div className="flex items-center gap-8 text-sm font-medium text-white/50">
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-white transition-colors">Features</a>
          <a href="#privacy" onClick={(e) => scrollToSection(e, 'privacy')} className="hover:text-white transition-colors">Privacy</a>
          <button 
            onClick={onLaunch}
            className="px-6 py-2.5 bg-white text-black rounded-full hover:bg-[#a7e5d3] transition-all font-semibold"
          >
            Launch Studio
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-8">
        {/* Fixed Background Gradient */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ShaderGradientCanvas
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <ShaderGradient
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
              range="disabled"
              rangeEnd={40}
              rangeStart={0}
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
              uTime={8}
              wireframe={false}
            />
          </ShaderGradientCanvas>
          <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black via-black/20 to-transparent z-1" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center hero-content">
          <div className="reveal inline-block px-4 py-1.5 mb-8 rounded-full border border-white/10 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
            The AI-Native Component Studio
          </div>
          <h1 className="reveal text-6xl md:text-8xl font-light display-serif leading-[1.1] tracking-tight mb-8">
            Design at the speed of <span className="italic text-[#a7e5d3]">thought.</span>
          </h1>
          <p className="reveal text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
            The private BYOK workspace for generating, refining, and scaling UI components using state-of-the-art AI. Your keys, your data, editorial by nature.
          </p>
          <div className="reveal relative rounded-2xl overflow-hidden max-w-5xl mx-auto">
            <img
              src="/open_component_landing_hero_1778683852514.png"
              alt="Open Component Studio Preview"
              className="w-full h-auto opacity-90 shadow-2xl"
            />
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
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">GitHub</a>
            <a href="#" className="hover:text-white">Docs</a>
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
