
export interface ModelEntry {
  id: string;
  name: string;
}

export interface ProviderEntry {
  id: string;
  name: string;
  models: Record<string, ModelEntry>;
  api?: string;
}

export interface ModelsRegistry {
  [providerId: string]: ProviderEntry;
}

const REGISTRY_URL = 'https://models.dev/api.json';
const CACHE_KEY = 'ALTR_MODELS_CACHE';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Hardcoded fallback/additions to ensure stability and requested models
const FALLBACK_REGISTRY: ModelsRegistry = {
  google: {
    id: 'google',
    name: 'Google Gemini',
    models: {
      'gemini-1.5-pro-latest': { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
      'gemini-1.5-flash-latest': { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash' },
    }
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: {
      'claude-3-5-sonnet-20240620': { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
      'claude-3-opus-20240229': { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      'claude-3-haiku-20240307': { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    }
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    models: {
      'gpt-4o': { id: 'gpt-4o', name: 'GPT-4o' },
      'gpt-4-turbo': { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      'gpt-3.5-turbo': { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    }
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    api: 'http://localhost:11434/v1',
    models: {
      'llama3': { id: 'llama3', name: 'Llama 3' },
      'mistral': { id: 'mistral', name: 'Mistral' },
      'gemma': { id: 'gemma', name: 'Gemma' },
      'phi3': { id: 'phi3', name: 'Phi-3' },
    }
  },
  lmstudio: {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    api: 'http://localhost:1234/v1',
    models: {
      'local-model': { id: 'local-model', name: 'Currently Loaded Model' },
    }
  }
};

export async function fetchModels(): Promise<ModelsRegistry> {
  // Check cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return mergeWithFallback(data);
    }
  }

  try {
    const response = await fetch(REGISTRY_URL);
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    
    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return mergeWithFallback(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return FALLBACK_REGISTRY;
  }
}

function mergeWithFallback(fetched: ModelsRegistry): ModelsRegistry {
  const merged = { ...FALLBACK_REGISTRY };
  
  Object.keys(fetched).forEach(providerId => {
    // Filter out known broken models
    const fetchedModels = { ...fetched[providerId].models };
    delete fetchedModels['gemini-3-flash'];

    if (!merged[providerId]) {
      merged[providerId] = { ...fetched[providerId], models: fetchedModels };
    } else {
      // Merge models
      merged[providerId].models = {
        ...merged[providerId].models,
        ...fetchedModels
      };
    }
  });
  
  return merged;
}

export function formatModelsForProvider(registry: ModelsRegistry, providerId: string) {
  const provider = registry[providerId];
  if (!provider) return [];
  
  return Object.values(provider.models).map(m => ({
    value: m.id,
    label: m.name || m.id
  }));
}
