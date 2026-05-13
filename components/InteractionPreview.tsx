
import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Component } from '../types';

interface InteractionPreviewProps {
  interaction: Component;
  designSystem?: DesignSystem;
  activeTweaks?: Record<string, string | number>;
}

const InteractionPreview: React.FC<InteractionPreviewProps> = ({ 
  interaction, 
  designSystem,
  activeTweaks = {} 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Track whether the iframe has confirmed its listener is ready
  const iframeReadyRef = useRef(false);
  const pendingTweaksRef = useRef<Record<string, string | number>>({});

  // Build initial :root vars from generation-time defaults (with units)
  const initialTweakStyles = useMemo(() => {
    if (!interaction.tweaks) return '';
    return interaction.tweaks
      .map(t => {
        const unit = (t as any).unit ?? '';
        return `${t.property}: ${t.value}${unit};`;
      })
      .join('\n');
  }, [interaction.id]);

  // Helper that formats a tweak value with its unit
  const formatTweakValue = useCallback((property: string, value: string | number): string => {
    const tweak = interaction.tweaks?.find(t => t.property === property);
    const unit = (tweak as any)?.unit ?? '';
    // Don't double-append unit if value already contains it (e.g. color strings)
    const strVal = String(value);
    if (unit && !strVal.endsWith(unit) && !strVal.startsWith('#') && !strVal.startsWith('oklch') && !strVal.startsWith('rgb')) {
      return `${strVal}${unit}`;
    }
    return strVal;
  }, [interaction.tweaks]);

  const sendTweaks = useCallback((tweaks: Record<string, string | number>) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const formatted: Record<string, { type: string, value: string }> = {};
    Object.entries(tweaks).forEach(([prop, val]) => {
      const tweakDef = interaction.tweaks?.find(t => t.property === prop);
      formatted[prop] = {
        type: tweakDef?.type || 'slider',
        value: formatTweakValue(prop, val)
      };
    });
    iframe.contentWindow.postMessage({ type: 'APPLY_TWEAKS', tweaks: formatted }, '*');
  }, [formatTweakValue, interaction.tweaks]);

  // The srcDoc only rebuilds when the interaction itself changes (new generation).
  const srcDoc = useMemo(() => {
    const fontDisplay = designSystem?.tokens?.fontDisplay || 'Inter';
    const fontBody = designSystem?.tokens?.fontBody || 'Inter';
    const primaryColor = designSystem?.tokens?.primaryColor || '#000000';
    const surfaceColor = designSystem?.tokens?.surfaceColor || '#ffffff';
    const textColor = designSystem?.tokens?.textColor || '#000000';

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=${fontDisplay.replace(/ /g, '+')}:wght@400;500;600;700;800&family=${fontBody.replace(/ /g, '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
        <script type="importmap">
        {
          "imports": { "gsap": "https://esm.sh/gsap@3.12.5" }
        }
        </script>
        <style>
          :root { 
            ${initialTweakStyles} 
            --color-primary: ${primaryColor};
            --color-surface: ${surfaceColor};
            --color-text: ${textColor};
            --font-display: "${fontDisplay}", sans-serif;
            --font-body: "${fontBody}", sans-serif;
          }
          * { box-sizing: border-box; }
          html, body {
            margin: 0; padding: 0;
            width: 100%; height: 100%;
            background: var(--color-surface);
            font-family: var(--font-body);
            color: var(--color-text);
            -webkit-font-smoothing: antialiased;
            overflow: auto;
          }
          #interaction-root {
            perspective: 1200px;
            min-width: 100%; 
            min-height: 100%;
            display: flex; 
            align-items: center; 
            justify-content: center;
            padding: 40px; /* Give some breathing room */
            box-sizing: border-box;
          }
          ${interaction.css}
        </style>
      </head>
      <body>
        <div id="interaction-root">
          ${interaction.html}
        </div>
        <script>
          // Notify parent that listener is ready, then handle live tweak patches
          window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
          window.addEventListener('message', (event) => {
            if (event.data?.type === 'APPLY_TWEAKS') {
              Object.entries(event.data.tweaks).forEach(([prop, config]) => {
                if (prop.startsWith('--')) {
                  document.documentElement.style.setProperty(prop, String(config.value));
                } else {
                  try {
                    const el = document.querySelector(prop);
                    if (el) {
                      if (config.type === 'text') {
                        el.innerText = String(config.value);
                      } else if (config.type === 'image') {
                        if (el.tagName.toLowerCase() === 'img') {
                          el.src = String(config.value);
                        } else {
                          el.style.backgroundImage = 'url("' + String(config.value) + '")';
                        }
                      }
                    }
                  } catch (e) {
                    console.error('Failed to apply tweak for selector:', prop, e);
                  }
                }
              });
            }
          });
          window.addEventListener('error', (e) => console.error('JS Error:', e.error));
        </script>
        <script type="module">
          ${interaction.js}
        </script>
      </body>
    </html>
    `;
  }, [interaction.id, interaction.html, interaction.css, interaction.js, initialTweakStyles, designSystem]);

  // Reset ready flag when interaction changes
  useEffect(() => {
    iframeReadyRef.current = false;
  }, [interaction.id]);

  // Listen for IFRAME_READY handshake, then flush pending tweaks
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'IFRAME_READY') {
        iframeReadyRef.current = true;
        // Send any tweaks that were waiting
        if (Object.keys(pendingTweaksRef.current).length > 0) {
          sendTweaks(pendingTweaksRef.current);
          pendingTweaksRef.current = {};
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendTweaks]);

  // Send tweaks whenever they change — queue them if iframe not ready yet
  useEffect(() => {
    if (Object.keys(activeTweaks).length === 0) return;
    if (iframeReadyRef.current) {
      sendTweaks(activeTweaks);
    } else {
      // Store as pending; they'll be flushed on IFRAME_READY
      pendingTweaksRef.current = activeTweaks;
    }
  }, [activeTweaks, sendTweaks]);

  return (
    <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
      <iframe
        ref={iframeRef}
        key={interaction.id}
        srcDoc={srcDoc}
        title="Interaction Preview"
        className="w-full h-full border-none pointer-events-auto"
        sandbox="allow-scripts allow-modals allow-popups allow-same-origin"
      />
    </div>
  );
};

export default InteractionPreview;
