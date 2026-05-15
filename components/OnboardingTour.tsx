import React, { useState, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface Step {
  id: string;
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    targetId: 'root',
    title: 'Welcome to Open Component',
    content: 'A high-fidelity workspace for building and refining AI-native components. Let\'s take a quick look around.',
    position: 'center'
  },
  {
    id: 'sidebar',
    targetId: 'sidebar-container',
    title: 'Your Library',
    content: 'Manage your projects (Suites) here. Each suite acts as a design container for your components.',
    position: 'right'
  },
  {
    id: 'ds',
    targetId: 'ds-badge-btn',
    title: 'Design System',
    content: 'Every suite has a dedicated design system. Click this badge to edit global tokens like colors and typography.',
    position: 'bottom'
  },
  {
    id: 'gallery',
    targetId: 'gallery-section',
    title: 'The Gallery',
    content: 'Your generated components appear here as versions. You can preview, delete, or refine them from this grid.',
    position: 'top'
  },
  {
    id: 'prompt',
    targetId: 'prompt-input-container',
    title: 'The Prompt Bar',
    content: 'Describe what you want to build or upload a reference image. Press Enter to start the generation engine.',
    position: 'top'
  },
  {
    id: 'settings',
    targetId: 'settings-trigger-btn',
    title: 'Configurations',
    content: 'Switch between providers (Google, Anthropic, etc.) and fine-tune your models here.',
    position: 'right'
  }
];

interface Props {
  onComplete: () => void;
}

const OnboardingTour: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const step = STEPS[currentStep];

  useLayoutEffect(() => {
    const updateCoords = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else if (step.position === 'center') {
        setCoords({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          width: 0,
          height: 0
        });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden inter-ui">
      {/* Dimmed Overlay with Hole */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-500 pointer-events-auto"
        style={{
          clipPath: step.position === 'center' 
            ? 'none' 
            : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
        }}
        onClick={onComplete}
      />

      {/* Tooltip Card */}
      <div 
        className="absolute bg-white dark:bg-[#111] border border-[var(--hairline-strong)] rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] p-6 w-[320px] transition-all duration-500 pointer-events-auto flex flex-col gap-4"
        style={{
          top: step.position === 'center' ? '50%' : (step.position === 'bottom' ? coords.top + coords.height + 20 : (step.position === 'top' ? coords.top - 20 : coords.top + coords.height/2)),
          left: step.position === 'center' ? '50%' : (step.position === 'right' ? coords.left + coords.width + 20 : (step.position === 'left' ? coords.left - 340 : coords.left + coords.width/2)),
          transform: step.position === 'center' ? 'translate(-50%, -50%)' : (step.position === 'top' ? 'translate(-50%, -100%)' : (step.position === 'bottom' ? 'translate(-50%, 0)' : 'translate(0, -50%)')),
          opacity: coords.width || step.position === 'center' ? 1 : 0
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">Step {currentStep + 1} of {STEPS.length}</span>
            <button onClick={onComplete} className="text-[var(--muted)] hover:text-[var(--ink)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <h3 className="text-[18px] font-medium display-serif text-[var(--ink)]">{step.title}</h3>
        </div>
        
        <p className="text-[13px] text-[var(--muted)] leading-relaxed">{step.content}</p>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-[var(--hairline)]">
          <button 
            onClick={onComplete}
            className="text-[11px] font-bold text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider transition-colors"
          >
            Skip Tour
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button 
                onClick={handleBack}
                className="px-4 py-2 text-[11px] font-bold text-[var(--ink)] bg-[var(--canvas-soft)] rounded-full hover:bg-[var(--surface-strong)] transition-colors"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              className="px-5 py-2 text-[11px] font-bold bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Pointer Arrow */}
        <div 
          className="absolute w-4 h-4 bg-white dark:bg-[#111] border-l border-t border-[var(--hairline-strong)] rotate-45"
          style={{
            display: step.position === 'center' ? 'none' : 'block',
            top: step.position === 'bottom' ? '-8px' : (step.position === 'top' ? 'auto' : '50%'),
            bottom: step.position === 'top' ? '-8px' : 'auto',
            left: step.position === 'right' ? '-8px' : (step.position === 'left' ? 'auto' : '50%'),
            right: step.position === 'left' ? '-8px' : 'auto',
            marginTop: (step.position === 'left' || step.position === 'right') ? '-8px' : 0,
            marginLeft: (step.position === 'top' || step.position === 'bottom') ? '-8px' : 0
          }}
        />
      </div>
    </div>,
    document.body
  );
};

export default OnboardingTour;
