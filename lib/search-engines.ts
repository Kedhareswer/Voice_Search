import type { SearchEngine } from "@/types/search-engines"

export const searchEngines: SearchEngine[] = [
  // General Search
  {
    id: "google",
    name: "Google",
    description: "Most comprehensive web search",
    icon: "🔍",
    color: "bg-blue-500",
    category: "general",
    searchUrl: (query: string) => `https://www.google.com/search?igu=1&q=${encodeURIComponent(query)}`,
    isDefault: true,
  },
  {
    id: "bing",
    name: "Bing",
    description: "Microsoft's search engine",
    icon: "🅱️",
    color: "bg-blue-600",
    category: "general",
    searchUrl: (query: string) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "yandex",
    name: "Yandex",
    description: "Great for international content",
    icon: "🌍",
    color: "bg-red-500",
    category: "general",
    searchUrl: (query: string) => `https://yandex.com/search/?text=${encodeURIComponent(query)}`,
  },

  // Privacy-Focused
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    description: "Privacy-focused search",
    icon: "🦆",
    color: "bg-orange-500",
    category: "privacy",
    searchUrl: (query: string) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  },
  {
    id: "startpage",
    name: "Startpage",
    description: "Google results without tracking",
    icon: "🔒",
    color: "bg-green-600",
    category: "privacy",
    searchUrl: (query: string) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(query)}`,
  },
  {
    id: "brave",
    name: "Brave Search",
    description: "Independent search engine",
    icon: "🦁",
    color: "bg-orange-600",
    category: "privacy",
    searchUrl: (query: string) => `https://search.brave.com/search?q=${encodeURIComponent(query)}`,
  },

  // Academic & Reference
  {
    id: "wikipedia",
    name: "Wikipedia",
    description: "Free encyclopedia",
    icon: "📚",
    color: "bg-gray-600",
    category: "academic",
    searchUrl: (query: string) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
  },
  {
    id: "scholar",
    name: "Google Scholar",
    description: "Academic papers and citations",
    icon: "🎓",
    color: "bg-blue-700",
    category: "academic",
    searchUrl: (query: string) => `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
  },
  {
    id: "arxiv",
    name: "arXiv",
    description: "Scientific preprints",
    icon: "🔬",
    color: "bg-purple-600",
    category: "academic",
    searchUrl: (query: string) => `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`,
  },

  // Developer Tools
  {
    id: "github",
    name: "GitHub",
    description: "Code repositories",
    icon: "💻",
    color: "bg-gray-800",
    category: "developer",
    searchUrl: (query: string) => `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`,
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    description: "Programming Q&A",
    icon: "📋",
    color: "bg-orange-500",
    category: "developer",
    searchUrl: (query: string) => `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "mdn",
    name: "MDN Web Docs",
    description: "Web development documentation",
    icon: "🌐",
    color: "bg-black",
    category: "developer",
    searchUrl: (query: string) => `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`,
  },

  // Social & Media
  {
    id: "reddit",
    name: "Reddit",
    description: "Community discussions",
    icon: "🤖",
    color: "bg-orange-600",
    category: "social",
    searchUrl: (query: string) => `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Video content",
    icon: "📺",
    color: "bg-red-600",
    category: "media",
    searchUrl: (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    description: "Real-time updates",
    icon: "🐦",
    color: "bg-black",
    category: "social",
    searchUrl: (query: string) => `https://twitter.com/search?q=${encodeURIComponent(query)}`,
  },

  // News
  {
    id: "news",
    name: "Google News",
    description: "Latest news articles",
    icon: "📰",
    color: "bg-blue-500",
    category: "news",
    searchUrl: (query: string) => `https://news.google.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "hackernews",
    name: "Hacker News",
    description: "Tech news and discussions",
    icon: "🔥",
    color: "bg-orange-500",
    category: "news",
    searchUrl: (query: string) => `https://hn.algolia.com/?q=${encodeURIComponent(query)}`,
  },
]

export const searchCategories = [
  { id: "all", name: "All", icon: "🔍" },
  { id: "general", name: "General", icon: "🌐" },
  { id: "privacy", name: "Privacy", icon: "🔒" },
  { id: "academic", name: "Academic", icon: "🎓" },
  { id: "developer", name: "Developer", icon: "💻" },
  { id: "social", name: "Social", icon: "👥" },
  { id: "media", name: "Media", icon: "📺" },
  { id: "news", name: "News", icon: "📰" },
]

export function getEnginesByCategory(category: string) {
  if (category === "all") return searchEngines
  return searchEngines.filter((engine) => engine.category === category)
}

export function getDefaultEngine() {
  return searchEngines.find((engine) => engine.isDefault) || searchEngines[0]
}
