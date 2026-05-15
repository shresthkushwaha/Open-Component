import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
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
  const [realPosition, setRealPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('center');
  const step = STEPS[currentStep];

  const updateLayout = useCallback(() => {
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const newCoords = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      };
      setCoords(newCoords);

      // Smart positioning / collision detection
      let pos = step.position;
      if (pos === 'top' && rect.top < 320) pos = 'bottom';
      if (pos === 'bottom' && (window.innerHeight - rect.bottom) < 320) pos = 'top';
      if (pos === 'left' && rect.left < 360) pos = 'right';
      if (pos === 'right' && (window.innerWidth - rect.right) < 360) pos = 'left';
      
      setRealPosition(pos);
    } else if (step.position === 'center') {
      setCoords({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 0,
        height: 0
      });
      setRealPosition('center');
    }
  }, [step]);

  useLayoutEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, true);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout, true);
    };
  }, [updateLayout]);

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

  const getStyle = () => {
    const isCenter = realPosition === 'center';
    const tooltipWidth = 320;
    const padding = 24;

    if (isCenter) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 1
      };
    }

    let top = 0;
    let left = 0;
    let transform = '';

    switch (realPosition) {
      case 'top':
        top = coords.top - padding;
        left = coords.left + coords.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = coords.top + coords.height + padding;
        left = coords.left + coords.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = coords.top + coords.height / 2;
        left = coords.left - padding;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = coords.top + coords.height / 2;
        left = coords.left + coords.width + padding;
        transform = 'translate(0, -50%)';
        break;
    }

    // Constraints & Containment
    const tooltipHeight = 280; // Estimated max height
    const minPadding = 20;

    // Horizontal containment
    const minLeft = realPosition === 'left' ? tooltipWidth + minPadding : (realPosition === 'right' ? minPadding : tooltipWidth / 2 + minPadding);
    const maxLeft = window.innerWidth - (realPosition === 'right' ? tooltipWidth + minPadding : (realPosition === 'left' ? minPadding : tooltipWidth / 2 + minPadding));
    
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    // Vertical containment
    const minTop = realPosition === 'top' ? tooltipHeight + minPadding : (realPosition === 'bottom' ? minPadding : tooltipHeight / 2 + minPadding);
    const maxTop = window.innerHeight - (realPosition === 'bottom' ? tooltipHeight + minPadding : (realPosition === 'top' ? minPadding : tooltipHeight / 2 + minPadding));

    if (top < minTop) top = minTop;
    if (top > maxTop) top = maxTop;

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform,
      opacity: coords.width > 0 ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
    };
  };

  const arrowStyle = () => {
    const size = 10;
    switch (realPosition) {
      case 'top': return { bottom: -size/2, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderRight: '1px solid var(--hairline-strong)', borderBottom: '1px solid var(--hairline-strong)' };
      case 'bottom': return { top: -size/2, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderLeft: '1px solid var(--hairline-strong)', borderTop: '1px solid var(--hairline-strong)' };
      case 'left': return { right: -size/2, top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderRight: '1px solid var(--hairline-strong)', borderTop: '1px solid var(--hairline-strong)' };
      case 'right': return { left: -size/2, top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderLeft: '1px solid var(--hairline-strong)', borderBottom: '1px solid var(--hairline-strong)' };
      default: return { display: 'none' };
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden inter-ui">
      {/* Dimmed Overlay with Hole */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-all duration-500 pointer-events-auto"
        style={{
          clipPath: step.position === 'center' 
            ? 'none' 
            : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
        }}
        onClick={onComplete}
      />

      {/* Tooltip Card */}
      <div 
        className="absolute bg-white dark:bg-[#111] border border-[var(--hairline-strong)] rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] p-6 w-[320px] max-w-[calc(100vw-40px)] pointer-events-auto flex flex-col gap-4"
        style={getStyle() as any}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">Step {currentStep + 1} of {STEPS.length}</span>
            <button onClick={onComplete} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
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
          className="absolute w-2.5 h-2.5 bg-white dark:bg-[#111]"
          style={arrowStyle() as any}
        />
      </div>
    </div>,
    document.body
  );
};

export default OnboardingTour;
