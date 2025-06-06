export type AIProvider =
  | "openai"
  | "anthropic"
  | "mistral"
  | "groq"
  | "cohere"
  | "openrouter"
  | "ollama"
  | "gemini"
  | "azure"
  | "local"

export interface AIProviderInfo {
  id: AIProvider
  name: string
  description: string
  website: string
  color: string
  models: {
    value: string
    label: string
    badge?: string
  }[]
  requiresApiKey: boolean
}
