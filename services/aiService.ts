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
  "html": "HTML structure (no inline styles). Import fonts from Google Fonts here if needed.",
  "css": "Full CSS. You MUST use the design system tokens above where applicable.",
  "js": "Vanilla JS if interactivity is needed.",
  "tags": ["button", "interaction", "glow"], // 2-4 descriptive tags
  "tweaks": [
    { "id": "t1", "label": "Corner Radius", "type": "slider", "property": "--radius", "min": 0, "max": 40, "value": 12, "unit": "px" },
    { "id": "t2", "label": "Button Text", "type": "text", "property": "#btn-text", "value": "Get Started" },
    { "id": "t3", "label": "Layout Direction", "type": "select", "property": "--layout-dir", "value": "row", "options": [{ "label": "Row", "value": "row" }, { "label": "Column", "value": "column" }] },
    { "id": "t4", "label": "Show Badge", "type": "boolean", "property": "--badge-display", "value": true },
    { "id": "t5", "label": "Hero Image", "type": "image", "property": "#hero-img", "value": "https://images.unsplash.com/photo-1" }
  ]
}

MAGIC TWEAKS — CRITICAL RULES:
1. CSS Tweaks: If "type" is "slider", "color", "select", or "boolean", "property" MUST be a CSS variable (e.g. "--radius") declared in :root {} and consumed via var().
2. Text/Image Tweaks: If "type" is "text" or "image", "property" MUST be a unique ID selector (e.g. "#btn-label" or "#hero-img") that exists in your HTML.
3. Every tweakable value MUST be accessible via the "property" selector/variable.
4. Slider tweaks MUST include a "unit" field (e.g. "px", "rem", "%", "deg").
5. Select tweaks MUST include an "options" array with label/value pairs.
6. Limit tweaks to 2–6 meaningful controls. Design consistency is paramount.

{{ANTI_SLOP_GUARD}}
`;

const buildComponentSystemPrompt = (ds: DesignSystem): string => {
  if (ds.name === 'Independent') {
    return `
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
    { "id": "t1", "label": "Control Name", "type": "slider", "property": "--variable", "min": 0, "max": 100, "value": 50, "unit": "px" }
  ]
}

${ANTI_SLOP_GUARD}
    `;
  }

  return SYSTEM_TEMPLATE
    .replace('{{EXPERT_PROMPT}}', COMPONENT_EXPERT_PROMPT)
    .replace('{{DS_PRIMARY}}', ds.tokens.primaryColor)
    .replace('{{DS_SURFACE}}', ds.tokens.surfaceColor)
    .replace('{{DS_TEXT}}', ds.tokens.textColor)
    .replace('{{DS_FONT_DISPLAY}}', ds.tokens.fontDisplay)
    .replace('{{DS_FONT_BODY}}', ds.tokens.fontBody)
    .replace('{{DS_RADIUS}}', ds.tokens.radiusScale)
    .replace('{{DS_MOTION}}', ds.tokens.motionPreset)
    .replace('{{DS_INSTRUCTION}}', ds.systemPromptAddendum)
    .replace('{{ANTI_SLOP_GUARD}}', ANTI_SLOP_GUARD);
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
  const jsonBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) return jsonBlockMatch[1].trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) return raw.slice(start, end + 1).trim();
  return raw.trim();
};

export const repairJSON = (json: string): string => {
  let repaired = json;
  repaired = repaired.replace(/"(\w+)":\s*`([\s\S]*?)`/g, (match, key, content) => {
    const escaped = content.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${key}": "${escaped}"`;
  });
  return repaired.trim();
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
    const system = buildComponentSystemPrompt(designSystem);
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
    const system = buildComponentSystemPrompt(designSystem);
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
