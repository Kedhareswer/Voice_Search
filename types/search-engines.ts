export interface SearchEngine {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: SearchCategory
  searchUrl: (query: string) => string
  isDefault?: boolean
  requiresProxy?: boolean
}

export type SearchCategory = "general" | "privacy" | "academic" | "social" | "developer" | "media" | "news"

export interface SearchResult {
  engine: string
  url: string
  query: string
  timestamp: number
}
