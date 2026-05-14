import { generateText, streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { 
  ImageAttachment, 
  GenerationResponse,
  DesignSystemGenerationResponse,
  DesignSystem
} from "../types";

// ---------------------------------------------------------------------------
// PROMPTS
// ---------------------------------------------------------------------------

const DS_GENERATION_PROMPT = `
You are a Principal Design Systems Architect.
Your job is to translate a user's creative intent into a structured set of design tokens.
Output ONLY valid JSON matching this exact schema:
{
  "name": "Short catchy name for the system (e.g. Acid Glass, Neo Brutal)",
  "tokens": {
    "primaryColor": "#b4f420", // MUST BE hex format
    "surfaceColor": "#050505",
    "textColor": "#fafafa",
    "fontDisplay": "Syne", // A Google Font name suitable for headings
    "fontBody": "Inter",   // A Google Font name suitable for UI/body text
    "radiusScale": "sharp", // "sharp" | "soft" | "pill"
    "motionPreset": "snappy" // "snappy" | "bouncy" | "fluid"
  },
  "systemPromptAddendum": "A 1-2 sentence instruction to the component generation AI on how to apply these tokens. (e.g. 'Use heavy borders and sharp corners. Apply the primary color for interactive states.')"
}
`;

const ANTI_SLOP_GUARD = `
DESIGN QUALITY GUARD — THESE RULES OVERRIDE EVERYTHING ELSE
Palettes must feel intentional. Use Hex (#RRGGBB) for all color tokens.
Typography: No Arial or generic fonts. Use the provided display/body fonts.
Layout: No generic grids. Break symmetry where appropriate.
Motion: Use spring physics (cubic-bezier) matching the requested motion preset.
`;

const COMPONENT_EXPERT_PROMPT = `
You are a Principal Interaction Designer specializing in micro-interactions and standalone UI components.
CRAFT PILLARS: Isolation, Depth, Motion Choreography, Feedback Richness.
Output must be a self-contained single interaction or component set.
`;

const INDEPENDENT_COMPONENT_PROMPT = `
## 1. System Role & Identity
You are a Principal Interaction Designer and Creative Technologist specializing in premium, high-fidelity micro-interactions. Your goal is to create isolated components that feel "alive" through motion choreography, depth, and tactile feedback.

## 2. Anti-Slop Guardrails (Strict Enforcement)
- **NO GENERIC COLORS**: Avoid standard CSS colors (e.g., plain blue, red, green). Use curated Hex palettes (#RRGGBB).
- **INTENTIONAL TYPOGRAPHY**: Use Outfit or Syne for headings; Inter or Geist for body text. No default fonts.
- **CHOREOGRAPHED MOTION**: Mandate GSAP for timelines and spring physics. Prefer cubic-bezier(0.34, 1.56, 0.64, 1).
- **FEEDBACK RICHNESS**: Every interaction (hover, click, drag) must have a visual response.

## 3. Technical Implementation
- **Layout**: Use **Tailwind CSS** for core layout and responsive positioning.
- **Motion**: Use **GSAP** (import gsap from 'gsap') for logic.
- **Isolation**: Center the component perfectly.
- **Tweakable Variables**: Define "Magic Tweaks" using CSS variables for real-time refinement.

## 4. Output Contract (MANDATORY)
Respond with ONE valid JSON object and NOTHING ELSE. No preamble, no markdown fences.
SCHEMA:
{
  "name": "Creative name",
  "html": "Pure semantic HTML with Tailwind classes.",
  "css": "Full CSS for variables and complex animations.",
  "js": "ES Modules logic using GSAP.",
  "tags": ["interaction", "premium", "motion"],
  "tweaks": [
    { "id": "t1", "label": "Button Text", "type": "text", "property": "#btn-label", "value": "Get Started" },
    { "id": "t2", "label": "Accent Color", "type": "color", "property": "--accent", "value": "#000000" }
  ]
}

MAGIC TWEAKS — CRITICAL RULES:
1. AT LEAST ONE COLOR AND ONE TEXT TWEAK: Every component MUST have at least one text tweak (e.g. label) and one color tweak.
2. CSS Tweaks: If type is slider, color, select, or boolean, property MUST be a CSS variable declared in :root.
3. Text/Image Tweaks: If type is text or image, property MUST be a unique ID selector.
`;

const SYSTEM_TEMPLATE = `
You are the Component Studio Agent — an autonomous design intelligence.
{{EXPERT_PROMPT}}

DESIGN SYSTEM CONTEXT (MANDATORY TO FOLLOW):
Primary Color: {{DS_PRIMARY}}
Surface Color: {{DS_SURFACE}}
Text Color: {{DS_TEXT}}
Display Font: {{DS_FONT_DISPLAY}}
Body Font: {{DS_FONT_BODY}}
Radius Scale: {{DS_RADIUS}}
Motion Preset: {{DS_MOTION}}
System Instruction: {{DS_INSTRUCTION}}

OUTPUT CONTRACT (MANDATORY):
Respond with ONE valid JSON object and NOTHING ELSE. No preamble, no markdown fences.
SCHEMA:
{
  "name": "Short descriptive name",
  "html": "HTML structure (no inline styles). Use unique IDs for elements you want to tweak (e.g. <span id='btn-label'>Click Me</span>).",
  "css": "Full CSS. Use the design system tokens above where applicable. For tweakable colors/sizes, use CSS variables in :root (e.g. --btn-bg: var(--color-primary);) and consume them.",
  "js": "Vanilla JS if interactivity is needed.",
  "tags": ["button", "interaction", "glow"],
  "tweaks": [
    { "id": "t1", "label": "Button Text", "type": "text", "property": "#btn-label", "value": "Get Started" },
    { "id": "t2", "label": "Background Color", "type": "color", "property": "--btn-bg", "value": "#b4f420" },
    { "id": "t3", "label": "Border Radius", "type": "slider", "property": "--radius", "min": 0, "max": 40, "value": 12, "unit": "px" },
    { "id": "t4", "label": "Layout Direction", "type": "select", "property": "--layout-dir", "value": "row", "options": [{ "label": "Row", "value": "row" }, { "label": "Column", "value": "column" }] },
    { "id": "t5", "label": "Hero Image", "type": "image", "property": "#hero-img", "value": "https://images.unsplash.com/photo-1" }
  ]
}

MAGIC TWEAKS — CRITICAL RULES:
1. AT LEAST ONE COLOR AND ONE TEXT TWEAK: Every component MUST have at least one text tweak (e.g. label) and one color tweak (e.g. background or accent).
2. CSS Tweaks: If "type" is "slider", "color", "select", or "boolean", "property" MUST be a CSS variable (e.g. "--btn-bg") declared in :root {} and used in your CSS.
3. Text/Image Tweaks: If "type" is "text" or "image", "property" MUST be a unique ID selector (e.g. "#btn-label") that exists in your HTML.
4. Every tweakable value MUST be accessible via the "property" selector/variable.
5. Slider tweaks MUST include a "unit" field (e.g. "px", "rem", "%").
6. Select tweaks MUST include an "options" array.
7. Limit tweaks to 3–6 meaningful controls.

{{ANTI_SLOP_GUARD}}
`;

const REFINEMENT_INSTRUCTIONS = `
REFINEMENT MODE:
1. You are modifying an EXISTING component.
2. Carefully analyze the provided CURRENT COMPONENT CONTEXT.
3. Apply the user's requested changes while preserving the overall structure and logic of the original unless explicitly asked to rebuild.
4. Maintain consistency with the current design tokens.
5. ALWAYS output the COMPLETE updated JSON object (all fields: name, html, css, js, tags, tweaks).
`;

const buildComponentSystemPrompt = (ds: DesignSystem, isRefinement: boolean = false): string => {
  if (ds.name === 'Independent') {
    return `
${INDEPENDENT_COMPONENT_PROMPT}

${isRefinement ? REFINEMENT_INSTRUCTIONS : ''}
${ANTI_SLOP_GUARD}
    `;
  }

  const basePrompt = SYSTEM_TEMPLATE
    .replace('{{EXPERT_PROMPT}}', COMPONENT_EXPERT_PROMPT)
    .replace('{{DS_PRIMARY}}', ds.tokens.primaryColor)
    .replace('{{DS_SURFACE}}', ds.tokens.surfaceColor)
    .replace('{{DS_TEXT}}', ds.tokens.textColor)
    .replace('{{DS_FONT_DISPLAY}}', ds.tokens.fontDisplay)
    .replace('{{DS_FONT_BODY}}', ds.tokens.fontBody)
    .replace('{{DS_RADIUS}}', ds.tokens.radiusScale)
    .replace('{{DS_MOTION}}', ds.tokens.motionPreset)
    .replace('{{DS_INSTRUCTION}}', ds.systemPromptAddendum)
    .replace('{{ANTI_SLOP_GUARD}}', (isRefinement ? REFINEMENT_INSTRUCTIONS : '') + ANTI_SLOP_GUARD);

    return basePrompt;
};

// ---------------------------------------------------------------------------
// CONFIG & PROVIDERS
// ---------------------------------------------------------------------------

export interface AIProviderConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseURL?: string;
}

export const getModel = (aiConfig: AIProviderConfig) => {
  const provider = aiConfig.provider.toLowerCase();
  
  if (provider === 'anthropic') {
    return createAnthropic({ apiKey: aiConfig.apiKey })(aiConfig.model);
  }

  if (provider === 'google') {
    return createGoogleGenerativeAI({ apiKey: aiConfig.apiKey })(aiConfig.model);
  }

  // Generic OpenAI-compatible (including NVIDIA, Groq, Mistral, etc.)
  const openaiBaseURL = aiConfig.baseURL || 
    (provider === 'nvidia' ? 'https://integrate.api.nvidia.com/v1' : 
     provider === 'openai' ? undefined : // Use default OpenAI URL
     provider === 'deepseek' ? 'https://api.deepseek.com' :
     provider === 'mistral' ? 'https://api.mistral.ai/v1' :
     provider === 'groq' ? 'https://api.groq.com/openai/v1' :
     provider === 'perplexity' ? 'https://api.perplexity.ai' :
     undefined);

  const openai = createOpenAI({
    baseURL: openaiBaseURL,
    apiKey: aiConfig.apiKey,
  });

  return openai.chat(aiConfig.model);
};

// ---------------------------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------------------------

export const extractJSON = (raw: string): string => {
  // 1. Try markdown blocks first
  const jsonBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) return jsonBlockMatch[1].trim();
  
  // 2. Try finding the first '{' 
  const start = raw.indexOf('{');
  if (start === -1) return raw.trim(); 
  
  // Find the last '}' that balances with the first '{'
  let braceCount = 0;
  let inString = false;
  for (let i = start; i < raw.length; i++) {
    const char = raw[i];
    if (char === '"' && raw[i-1] !== '\\') inString = !inString;
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (braceCount === 0) {
        return raw.slice(start, i + 1).trim();
      }
    }
  }
  
  // 3. Truncated case: Starts with '{' but never closed correctly
  return raw.slice(start).trim();
};

export const repairJSON = (json: string): string => {
  let s = json.trim();

  // ── Step 1: Replace backtick-quoted values with double-quoted strings ──
  // Handles: "key": `...multi-line...`
  // We do this character-by-character to handle nested backticks safely.
  {
    let out = '';
    let i = 0;
    while (i < s.length) {
      // Look for pattern: ": ` (a JSON value that is a backtick string)
      if (s[i] === ':' && /\s/.test(s[i + 1] || '') && s.indexOf('`', i) !== -1) {
        // Peek ahead past whitespace
        let j = i + 1;
        while (j < s.length && /\s/.test(s[j])) j++;
        if (s[j] === '`') {
          // Found a backtick value — find its closing backtick
          let end = s.indexOf('`', j + 1);
          if (end === -1) end = s.length; // unclosed, take to end
          const content = s.slice(j + 1, end)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
          out += ': "' + content + '"';
          i = end + 1;
          continue;
        }
      }
      out += s[i];
      i++;
    }
    s = out;
  }

  // ── Step 2: Strip JS comments (only outside strings) ──
  {
    let out = '';
    let inStr = false;
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === '"' && s[i - 1] !== '\\') inStr = !inStr;
      if (!inStr) {
        // Single-line comment
        if (ch === '/' && s[i + 1] === '/') {
          while (i < s.length && s[i] !== '\n') i++;
          continue;
        }
        // Multi-line comment
        if (ch === '/' && s[i + 1] === '*') {
          i += 2;
          while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++;
          i += 2;
          continue;
        }
      }
      out += ch;
      i++;
    }
    s = out;
  }

  // ── Step 3: Escape unescaped literal newlines inside strings ──
  {
    let out = '';
    let inStr = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '"' && s[i - 1] !== '\\') inStr = !inStr;
      if (inStr && ch === '\n') { out += '\\n'; continue; }
      if (inStr && ch === '\r') continue; // strip CR
      out += ch;
    }
    s = out;
  }

  // ── Step 4: Remove trailing commas ──
  s = s.replace(/,(\s*[}\]])/g, '$1');

  // ── Step 5: Balance unclosed braces/brackets ──
  {
    let braces = 0, brackets = 0, inStr = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '"' && s[i - 1] !== '\\') inStr = !inStr;
      if (!inStr) {
        if (ch === '{') braces++;
        if (ch === '}') braces--;
        if (ch === '[') brackets++;
        if (ch === ']') brackets--;
      }
    }
    while (brackets > 0) { s += ']'; brackets--; }
    while (braces > 0) { s += '}'; braces--; }
  }

  return s;
};

// ---------------------------------------------------------------------------
// FALLBACK FIELD EXTRACTOR
// If JSON.parse fails even after repair, extract fields individually via regex.
// ---------------------------------------------------------------------------

const extractField = (raw: string, key: string): string => {
  // Match: "key": "value" — handles escaped characters inside the value
  const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"`, 's');
  const m = raw.match(re);
  if (!m) return '';
  return m[1]
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
};

const extractArrayField = (raw: string, key: string): any[] => {
  const re = new RegExp(`"${key}"\\s*:\\s*(\\[[\\s\\S]*?\\])(?:\\s*[,}])`, 's');
  const m = raw.match(re);
  if (!m) return [];
  try { return JSON.parse(m[1]); } catch { return []; }
};

const fallbackParse = (raw: string): any => {
  const name = extractField(raw, 'name') || 'Generated Component';
  const html = extractField(raw, 'html');
  const css  = extractField(raw, 'css');
  const js   = extractField(raw, 'js');
  const tags  = extractArrayField(raw, 'tags');
  const tweaks = extractArrayField(raw, 'tweaks');
  return { name, html, css, js, tags, tweaks };
};

// ---------------------------------------------------------------------------
// CORE SERVICE
// ---------------------------------------------------------------------------

export const aiService = {
  generateDesignSystem: async (
    description: string,
    aiConfig: AIProviderConfig
  ): Promise<DesignSystemGenerationResponse> => {
    const model = getModel(aiConfig);
    const { text } = await generateText({
      model,
      maxTokens: 1000,
      system: DS_GENERATION_PROMPT,
      messages: [{ role: 'user', content: description }],
    });
    
    const cleaned = extractJSON(text);
    return JSON.parse(repairJSON(cleaned));
  },

  generateComponent: async (
    prompt: string,
    designSystem: DesignSystem,
    aiConfig: AIProviderConfig,
    context?: string,
    image?: ImageAttachment
  ): Promise<GenerationResponse> => {
    const model = getModel(aiConfig);
    const system = buildComponentSystemPrompt(designSystem, !!context);
    const userText = context ? `REFINEMENT REQUEST: ${prompt}\n\nCURRENT COMPONENT CONTEXT:\n${context}` : prompt;

    const { text } = await generateText({
      model,
      maxTokens: 6000,
      system,
      messages: [{ 
        role: 'user', 
        content: image ? [
          { type: 'text', text: userText },
          { type: 'image', image: `data:${image.mimeType};base64,${image.data}` }
        ] : userText
      }],
    });

    const cleaned = extractJSON(text);
    const repaired = repairJSON(cleaned);
    try {
      return JSON.parse(repaired);
    } catch {
      console.warn('[generateComponent] JSON.parse failed, using fallback extractor on raw text');
      return fallbackParse(text);
    }
  },

  streamGenerateComponent: async (
    prompt: string,
    designSystem: DesignSystem,
    aiConfig: AIProviderConfig,
    onChunk: (delta: string, fullText: string) => void,
    context?: string,
    image?: ImageAttachment
  ): Promise<GenerationResponse> => {
    const model = getModel(aiConfig);
    const system = buildComponentSystemPrompt(designSystem, !!context);
    const userText = context ? `REFINEMENT REQUEST: ${prompt}\n\nCURRENT COMPONENT CONTEXT:\n${context}` : prompt;

    const result = streamText({
      model,
      maxTokens: 6000,
      system,
      messages: [{
        role: 'user',
        content: image ? [
          { type: 'text', text: userText },
          { type: 'image', image: `data:${image.mimeType};base64,${image.data}` }
        ] : userText
      }],
    });

    let fullText = '';
    for await (const delta of result.textStream) {
      fullText += delta;
      onChunk(delta, fullText);
    }

    const cleaned = extractJSON(fullText);
    const repaired = repairJSON(cleaned);
    try {
      return JSON.parse(repaired);
    } catch {
      console.warn('[streamGenerate] JSON.parse failed, using fallback extractor on raw text');
      return fallbackParse(fullText);
    }
  }
};
