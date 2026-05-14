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
  const basePrompt = ds.name === 'Independent' ? `
You are the Component Studio Agent — an autonomous design intelligence.
${COMPONENT_EXPERT_PROMPT}

VISUAL FREEDOM: This is a standalone component. You are NOT bound by a specific design system. Derive ALL visual logic, colors, typography, and motion entirely from the user's prompt.

OUTPUT CONTRACT (MANDATORY):
Respond with ONE valid JSON object and NOTHING ELSE. No preamble, no markdown fences.
SCHEMA:
{
  "name": "Short descriptive name",
  "html": "HTML structure (no inline styles). Import fonts from Google Fonts here if needed.",
  "css": "Full CSS. Create a unique, high-fidelity design language from scratch.",
  "js": "Vanilla JS if interactivity is needed.",
  "tags": ["button", "interaction", "glow"],
  "tweaks": [
    { "id": "t1", "label": "Button Text", "type": "text", "property": "#btn-label", "value": "Get Started" },
    { "id": "t2", "label": "Accent Color", "type": "color", "property": "--accent", "value": "#000000" }
  ]
}

MAGIC TWEAKS — CRITICAL RULES:
1. AT LEAST ONE COLOR AND ONE TEXT TWEAK: Every component MUST have at least one text tweak (e.g. label) and one color tweak (e.g. background or accent).
2. CSS Tweaks: If "type" is "slider", "color", "select", or "boolean", "property" MUST be a CSS variable (e.g. "--btn-bg") declared in :root {} and used in your CSS.
3. Text/Image Tweaks: If "type" is "text" or "image", "property" MUST be a unique ID selector (e.g. "#btn-label") that exists in your HTML.

${isRefinement ? REFINEMENT_INSTRUCTIONS : ''}
${ANTI_SLOP_GUARD}
    ` : SYSTEM_TEMPLATE
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
  let repaired = json.trim();

  // 1. Strip comments (common in AI output)
  repaired = repaired.replace(/\/\/.*/g, ''); // Single line comments
  repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, ''); // Multi line comments

  // 2. Handle common AI quirk: using backticks for long strings
  repaired = repaired.replace(/"(\w+)":\s*`([\s\S]*?)`/g, (match, key, content) => {
    const escaped = content.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${key}": "${escaped}"`;
  });

  // 3. Fix unquoted keys (e.g. { name: "val" } -> { "name": "val" })
  repaired = repaired.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

  // 4. Escape literal newlines within strings (common failure point for JSON.parse)
  // This is tricky; we only want to escape newlines inside double quotes.
  let inString = false;
  let result = '';
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (char === '"' && repaired[i-1] !== '\\') inString = !inString;
    if (inString && char === '\n') {
      result += '\\n';
    } else if (inString && char === '\r') {
      // skip
    } else {
      result += char;
    }
  }
  repaired = result;

  // 5. Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // 6. Attempt to fix unclosed strings (common in truncation)
  const lastOpenQuote = repaired.lastIndexOf('"');
  const lastCloseQuote = repaired.lastIndexOf('"', lastOpenQuote - 1);
  if (lastOpenQuote !== -1 && (lastOpenQuote > lastCloseQuote || lastCloseQuote === -1)) {
    const textAfterQuote = repaired.slice(lastOpenQuote + 1);
    if (!textAfterQuote.includes(':')) {
       repaired += '"'; 
    }
  }

  // 7. Balance braces/brackets
  let braceCount = 0;
  let bracketCount = 0;
  inString = false;
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (char === '"' && repaired[i-1] !== '\\') inString = !inString;
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }
  }

  while (bracketCount > 0) { repaired += ']'; bracketCount--; }
  while (braceCount > 0) { repaired += '}'; braceCount--; }

  return repaired;
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
    return JSON.parse(repairJSON(cleaned));
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
    return JSON.parse(repairJSON(cleaned));
  }
};
