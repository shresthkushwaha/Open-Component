import React from 'react';
import { DesignSystem } from '../types';

interface DesignSystemBadgeProps {
  designSystem: DesignSystem;
  className?: string;
}

const DesignSystemBadge: React.FC<DesignSystemBadgeProps> = ({ designSystem, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 p-1.5 pr-3 bg-[var(--surface-strong)] rounded-full border border-[var(--hairline)] shadow-sm ${className}`}>
      <div className="flex -space-x-1.5 ml-0.5">
        <div 
          className="w-4 h-4 rounded-full border border-[var(--canvas)] shadow-sm relative z-20" 
          style={{ backgroundColor: designSystem?.tokens?.primaryColor || 'var(--ink)' }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-[var(--canvas)] shadow-sm relative z-10" 
          style={{ backgroundColor: designSystem?.tokens?.surfaceColor || 'var(--canvas)' }}
        />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[9px] font-bold text-[var(--ink)] uppercase tracking-[0.05em] leading-none mb-0.5">{designSystem?.name}</span>
        <span className="text-[8px] font-medium text-[var(--muted)] uppercase tracking-widest leading-none">{designSystem?.tokens?.fontDisplay || 'Inter'}</span>
      </div>
    </div>
  );
};

export default DesignSystemBadge;
