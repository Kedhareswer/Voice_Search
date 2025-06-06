import type { AIProviderInfo } from "@/types/ai-provider"

export const aiProviders: AIProviderInfo[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT models for high-quality text processing",
    website: "https://platform.openai.com/api-keys",
    color: "bg-green-500",
    models: [
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", badge: "Fast" },
      { value: "gpt-4", label: "GPT-4", badge: "Accurate" },
      { value: "gpt-4o", label: "GPT-4o", badge: "Latest" },
    ],
    requiresApiKey: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude models for safe and helpful AI",
    website: "https://console.anthropic.com/",
    color: "bg-orange-500",
    models: [
      { value: "claude-instant-1", label: "Claude Instant", badge: "Fast" },
      { value: "claude-2", label: "Claude 2", badge: "Balanced" },
      { value: "claude-3-haiku", label: "Claude 3 Haiku", badge: "Fast" },
      { value: "claude-3-sonnet", label: "Claude 3 Sonnet", badge: "Balanced" },
      { value: "claude-3-opus", label: "Claude 3 Opus", badge: "Best" },
    ],
    requiresApiKey: true,
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Open and efficient language models",
    website: "https://console.mistral.ai/",
    color: "bg-blue-500",
    models: [
      { value: "mistral-tiny", label: "Mistral Tiny", badge: "Fast" },
      { value: "mistral-small", label: "Mistral Small", badge: "Balanced" },
      { value: "mistral-medium", label: "Mistral Medium", badge: "Accurate" },
    ],
    requiresApiKey: true,
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference for AI models",
    website: "https://console.groq.com/keys",
    color: "bg-purple-500",
    models: [
      { value: "llama2-70b-4096", label: "LLaMA 2 70B", badge: "Powerful" },
      { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B", badge: "Fast" },
      { value: "gemma-7b-it", label: "Gemma 7B", badge: "Efficient" },
    ],
    requiresApiKey: true,
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "State-of-the-art language models for businesses",
    website: "https://dashboard.cohere.com/api-keys",
    color: "bg-indigo-500",
    models: [
      { value: "command", label: "Command", badge: "Fast" },
      { value: "command-light", label: "Command Light", badge: "Efficient" },
      { value: "command-r", label: "Command-R", badge: "Latest" },
      { value: "command-r-plus", label: "Command-R+", badge: "Advanced" },
    ],
    requiresApiKey: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Gateway to multiple AI models with unified API",
    website: "https://openrouter.ai/keys",
    color: "bg-pink-500",
    models: [
      { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo", badge: "OpenAI" },
      { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku", badge: "Anthropic" },
      { value: "meta-llama/llama-3-8b-instruct", label: "Llama 3 8B", badge: "Meta" },
      { value: "google/gemini-pro", label: "Gemini Pro", badge: "Google" },
      { value: "mistral/mistral-7b", label: "Mistral 7B", badge: "Mistral" },
    ],
    requiresApiKey: true,
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Run open-source LLMs locally",
    website: "https://ollama.com",
    color: "bg-gray-700",
    models: [
      { value: "llama3", label: "Llama 3", badge: "Meta" },
      { value: "mistral", label: "Mistral", badge: "Mistral AI" },
      { value: "gemma", label: "Gemma", badge: "Google" },
      { value: "phi", label: "Phi-2", badge: "Microsoft" },
      { value: "codellama", label: "CodeLlama", badge: "Coding" },
    ],
    requiresApiKey: false,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's multimodal AI models",
    website: "https://ai.google.dev/",
    color: "bg-blue-600",
    models: [
      { value: "gemini-pro", label: "Gemini Pro", badge: "Balanced" },
      { value: "gemini-pro-vision", label: "Gemini Pro Vision", badge: "Multimodal" },
      { value: "gemini-ultra", label: "Gemini Ultra", badge: "Advanced" },
    ],
    requiresApiKey: true,
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    description: "Microsoft's Azure-hosted OpenAI models",
    website: "https://portal.azure.com/",
    color: "bg-blue-800",
    models: [
      { value: "gpt-35-turbo", label: "GPT-3.5 Turbo", badge: "Fast" },
      { value: "gpt-4", label: "GPT-4", badge: "Accurate" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo", badge: "Latest" },
    ],
    requiresApiKey: true,
  },
  {
    id: "local",
    name: "Local Processing",
    description: "Process text locally without API calls",
    website: "",
    color: "bg-green-700",
    models: [
      { value: "keyword-extraction", label: "Keyword Extraction", badge: "No API" },
      { value: "intent-detection", label: "Intent Detection", badge: "No API" },
    ],
    requiresApiKey: false,
  },
]

export function getProviderById(id: string): AIProviderInfo | undefined {
  return aiProviders.find((provider) => provider.id === id)
}

export function getProviderModels(providerId: string): AIProviderInfo["models"] {
  const provider = getProviderById(providerId)
  return provider?.models || []
}
