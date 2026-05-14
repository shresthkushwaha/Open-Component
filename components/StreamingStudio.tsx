import React, { useEffect, useRef, useState } from 'react';

interface StreamingStudioProps {
  rawStream: string;
  prompt: string;
  onClose: () => void;
}

// Greedily extract a string value from a key in partial JSON
const extractPartialField = (raw: string, key: string): string => {
  // Support both double quotes and backticks (which repairJSON handles later but we want it live)
  const pattern = new RegExp(`"${key}"\\s*:\\s*(?:"|\`)?((?:[^"\`\\\\]|\\\\.)*)`, 's');
  const match = raw.match(pattern);
  return match ? match[1] : '';
};

interface Segment {
  text: string;
  section: 'meta' | 'html' | 'css' | 'js' | 'tweaks' | 'plain';
}

const SECTION_COLORS: Record<Segment['section'], string> = {
  meta:   'var(--body)',
  html:   '#16a34a',
  css:    '#2563eb',
  js:     '#d97706',
  tweaks: '#9333ea',
  plain:  'var(--muted)',
};

const SECTION_KEYS: Array<{ key: string; section: Segment['section'] }> = [
  { key: 'name',   section: 'meta' },
  { key: 'html',   section: 'html' },
  { key: 'css',    section: 'css' },
  { key: 'js',     section: 'js' },
  { key: 'tweaks', section: 'tweaks' },
  { key: 'tags',   section: 'meta' },
];

const tokenize = (raw: string): Segment[] => {
  if (!raw) return [];

  const boundaries: Array<{ index: number; section: Segment['section'] }> = [];
  SECTION_KEYS.forEach(({ key, section }) => {
    const idx = raw.indexOf(`"${key}"`);
    if (idx !== -1) boundaries.push({ index: idx, section });
  });
  boundaries.sort((a, b) => a.index - b.index);

  if (boundaries.length === 0) return [{ text: raw, section: 'plain' }];

  const result: Segment[] = [];
  let cursor = 0;

  boundaries.forEach(({ index, section }, i) => {
    if (index > cursor) {
      result.push({ text: raw.slice(cursor, index), section: 'plain' });
    }
    const end = boundaries[i + 1]?.index ?? raw.length;
    result.push({ text: raw.slice(index, end), section });
    cursor = end;
  });

  if (cursor < raw.length) {
    result.push({ text: raw.slice(cursor), section: 'plain' });
  }

  return result;
};

const StreamingStudio: React.FC<StreamingStudioProps> = ({ rawStream, prompt, onClose }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll code pane
  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [rawStream]);

  const partialHtml = extractPartialField(rawStream, 'html')
    .replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  const partialCss = extractPartialField(rawStream, 'css')
    .replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

  const hasPreview = partialHtml.length > 20 || partialCss.length > 20;
  const charCount = rawStream.length;
  const progress = Math.min((charCount / 3200) * 100, 95);
  const segments = tokenize(rawStream);

  const iframeSrc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body {
    margin: 0; padding: 48px; box-sizing: border-box;
    width: 100%; min-height: 100%; 
    display: flex; align-items: center; justify-content: center;
    background: #ffffff; font-family: Inter, sans-serif;
    overflow: auto;
  }
  ${partialCss}
</style>
</head>
<body>${partialHtml}</body>
</html>`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col inter-ui transition-all duration-500 bg-[var(--canvas)]`}
      style={{ opacity: isMounted ? 1 : 0, transform: isMounted ? 'scale(1)' : 'scale(0.98)' }}
    >
      {/* Atmospheric Orbs — same as app */}
      <div className="orb-container">
        <div className="orb orb-mint" />
        <div className="orb orb-peach" />
        <div className="orb orb-lavender" />
        <div className="orb orb-sky" />
      </div>

      {/* Top Bar */}
      <header className="h-16 border-b border-[var(--hairline)] flex items-center justify-between px-8 bg-[var(--canvas)] z-10 shrink-0">
        <div className="flex items-center gap-6">
          {/* Live pulse */}
          <div className="flex items-center gap-2.5">
            <div className="live-dot w-2 h-2 rounded-full bg-[var(--ink)] text-[var(--ink)]" />
            <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-[0.12em]">
              Composing
            </span>
          </div>

          {/* Prompt preview */}
          <span className="text-[13px] text-[var(--body)] truncate max-w-md font-light display-serif italic">
            "{prompt}"
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5" style={{ color: SECTION_COLORS.html }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: SECTION_COLORS.html }} />
              HTML
            </span>
            <span className="flex items-center gap-1.5" style={{ color: SECTION_COLORS.css }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: SECTION_COLORS.css }} />
              CSS
            </span>
            <span className="flex items-center gap-1.5" style={{ color: SECTION_COLORS.js }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: SECTION_COLORS.js }} />
              JS
            </span>
          </div>

          <span className="text-[11px] text-[var(--muted)] font-mono">{charCount.toLocaleString()} chars</span>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cancel
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-px bg-[var(--hairline)] shrink-0">
        <div
          className="h-full progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Split Pane */}
      <div className="flex-1 flex min-h-0">

        {/* Left: Code Stream */}
        <div className="w-1/2 border-r border-[var(--hairline)] flex flex-col min-h-0 bg-[var(--canvas-soft)]">
          <div className="px-6 py-3 border-b border-[var(--hairline)] flex items-center justify-between shrink-0 bg-[var(--canvas)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.12em]">Code Stream</span>
            <span className="text-[10px] font-mono text-[var(--muted)]">JSON</span>
          </div>

          <pre
            ref={codeRef}
            className="flex-1 overflow-auto p-6 text-[11.5px] leading-[1.7] whitespace-pre-wrap break-all"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              color: 'var(--muted)',
            }}
          >
            {segments.map((seg, i) => (
              <span key={i} style={{ color: SECTION_COLORS[seg.section] }}>
                {seg.text}
              </span>
            ))}
            {/* Blinking cursor */}
            <span
              className="cursor-blink inline-block w-[7px] h-[13px] ml-px align-text-bottom rounded-[1px]"
              style={{ background: 'var(--ink)', opacity: 0.7 }}
            />
          </pre>
        </div>

        {/* Right: Live Preview */}
        <div className="w-1/2 flex flex-col min-h-0">
          <div className="px-6 py-3 border-b border-[var(--hairline)] flex items-center justify-between shrink-0 bg-[var(--canvas)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.12em]">
              {hasPreview ? 'Live Preview' : 'Awaiting Structure...'}
            </span>
            {hasPreview && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Rendering
              </span>
            )}
          </div>

          {!hasPreview ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-[var(--canvas-soft)]">
              {/* Skeleton shimmer blocks */}
              <div className="w-64 space-y-3">
                {[80, 56, 72, 48].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 rounded-full animate-pulse bg-[var(--hairline)]"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[var(--muted)] font-medium uppercase tracking-[0.12em]">
                Collecting structure
              </p>
            </div>
          ) : (
            <iframe
              srcDoc={iframeSrc}
              className="flex-1 border-none w-full"
              sandbox="allow-scripts"
              title="Live Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingStudio;
