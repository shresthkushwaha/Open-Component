export interface TweakDefinition {
  id: string;
  label: string;
  type: 'slider' | 'color' | 'text' | 'image' | 'select' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  value: string | number | boolean;
  property: string; // The CSS variable name OR a selector for text/image updates
  unit?: string;
  options?: Array<{
    label: string;
    value: string | number;
  }>;
}

export interface DesignSystem {
  id: string;
  name: string;
  description: string;           // plain-text intent from user
  tokens: {                      // AI-generated tokens
    primaryColor: string;        // oklch(...)
    surfaceColor: string;
    textColor: string;
    fontDisplay: string;         // Google Font name
    fontBody: string;
    radiusScale: 'sharp' | 'soft' | 'pill';
    motionPreset: 'snappy' | 'bouncy' | 'fluid';
  };
  systemPromptAddendum: string;  // injected into every generation
}

export interface Component {
  id: string;
  fileId: string;
  name: string;
  prompt: string;
  html: string;
  css: string;
  js: string;
  tweaks?: TweakDefinition[];
  timestamp: number;
  tags?: string[];
  hasImage?: boolean;
}

export interface ComponentFile {
  id: string;
  name: string;
  designSystem: DesignSystem;
  createdAt: number;
  type?: 'atomic' | 'suite';
}

export interface GenerationResponse {
  name: string;
  html: string;
  css: string;
  js: string;
  tweaks?: TweakDefinition[];
  tags?: string[];
}

export interface DesignSystemGenerationResponse {
  name: string;
  tokens: {
    primaryColor: string;
    surfaceColor: string;
    textColor: string;
    fontDisplay: string;
    fontBody: string;
    radiusScale: 'sharp' | 'soft' | 'pill';
    motionPreset: 'snappy' | 'bouncy' | 'fluid';
  };
  systemPromptAddendum: string;
}

export interface ImageAttachment {
  data: string; // base64
  mimeType: string;
}

export interface APIKey {
  id: string;
  name: string;
  provider: string;
  value: string;
  preferredModel: string;
  baseURL?: string;
}

export interface UserConfig {
  id: string;
  activeKeyId: string | null;
  keys: APIKey[];
  appTheme: 'dark' | 'light';
  agentPersonality: 'terse' | 'verbose';
  streamingEnabled: boolean;
  autoCritique: boolean;
  activeFileId: string | null; // Added to remember last opened file
}



