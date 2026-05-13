import React from 'react';
import { Component } from '../types';

interface ComponentCardProps {
  component: Component;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, onClick, onDelete }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative border border-[var(--hairline)] rounded-[20px] cursor-pointer hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col bg-transparent"
    >
      <div className="h-64 bg-[var(--canvas-soft)] relative overflow-hidden border-b border-[var(--hairline-soft)] rounded-t-[19px] isolate">
        {/* Thumbnail Preview */}
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                html, body { 
                  margin: 0; padding: 0; 
                  width: 100%; height: 100%;
                  display: flex; align-items: center; justify-content: center; 
                  background: transparent; 
                  overflow: hidden; 
                }
                #content {
                  display: flex; align-items: center; justify-content: center;
                  width: 100%;
                  transform: scale(0.85);
                  transform-origin: center;
                }
                ${component.css}
              </style>
            </head>
            <body>
              <div id="content">
                ${component.html}
              </div>
            </body>
            </html>
          `}
          className="absolute top-0 left-0 border-none pointer-events-none"
          style={{
            width: '250%',
            height: '250%',
            transform: 'scale(0.4)',
            transformOrigin: 'top left'
          }}
          tabIndex={-1}
        />
        <div className="absolute inset-0 z-10 bg-transparent cursor-pointer" />
        
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 z-20 p-2.5 bg-[var(--surface-card)] backdrop-blur-md rounded-full text-[var(--muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-[var(--hairline)]"
          title="Delete Component"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between bg-[var(--surface-card)] rounded-b-[19px]">
        <div>
          <h3 className="text-[17px] font-medium display-serif text-[var(--ink)] leading-tight mb-2">{component.name}</h3>
          <p className="text-[12px] text-[var(--muted)] line-clamp-2 leading-relaxed font-normal inter-ui">{component.prompt}</p>
        </div>
        
        {component.tags && component.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {component.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-[var(--surface-strong)] text-[var(--muted)] text-[10px] font-semibold uppercase tracking-[0.08em]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentCard;
