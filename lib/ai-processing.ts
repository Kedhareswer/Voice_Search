import type { AIProvider } from "@/types/ai-provider"
import { extractSearchKeywords } from "@/lib/client-extraction"

interface AIConfig {
  provider: AIProvider
  apiKey: string
  model: string
}

export async function processVoiceInput(transcript: string, config: AIConfig): Promise<string> {
  // If using local processing or no API key is provided, use client-side extraction
  if (config.provider === "local" || !config.apiKey) {
    return extractSearchKeywords(transcript)
  }

  try {
    const endpoint = getProviderEndpoint(config.provider, config)
    const headers = createHeaders(config.provider, config.apiKey)
    const payload = createProviderPayload(config.provider, config.model, transcript)

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`)
      // Fallback to client-side extraction if API call fails
      return extractSearchKeywords(transcript)
    }

    const data = await response.json()
    return extractResponseContent(data, config.provider)
  } catch (error) {
    console.error("Error in AI processing:", error)
    // Fallback to client-side extraction on error
    return extractSearchKeywords(transcript)
  }
}

function getProviderEndpoint(provider: AIProvider, config: AIConfig): string {
  switch (provider) {
    case "openai":
      return "https://api.openai.com/v1/chat/completions"
    case "anthropic":
      return "https://api.anthropic.com/v1/messages"
    case "mistral":
      return "https://api.mistral.ai/v1/chat/completions"
    case "groq":
      return "https://api.groq.com/openai/v1/chat/completions"
    case "cohere":
      return "https://api.cohere.ai/v1/generate"
    case "openrouter":
      return "https://openrouter.ai/api/v1/chat/completions"
    case "gemini":
      return "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    case "azure":
      // Azure requires a deployment name and endpoint from the user
      const endpoint = config.apiKey.split("|")[1] || ""
      return `${endpoint}/openai/deployments/${config.model}/chat/completions?api-version=2023-05-15`
    case "ollama":
      // Default to localhost, but could be configured
      return "http://localhost:11434/api/generate"
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

function createHeaders(provider: AIProvider, apiKey: string): Record<string, string> {
  const baseHeaders = {
    "Content-Type": "application/json",
  }

  switch (provider) {
    case "openai":
      return {
        ...baseHeaders,
        Authorization: `Bearer ${apiKey}`,
      }
    case "anthropic":
      return {
        ...baseHeaders,
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      }
    case "mistral":
    case "groq":
      return {
        ...baseHeaders,
        Authorization: `Bearer ${apiKey}`,
      }
    case "cohere":
      return {
        ...baseHeaders,
        Authorization: `Bearer ${apiKey}`,
      }
    case "openrouter":
      return {
        ...baseHeaders,
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "Multi-Search AI",
      }
    case "gemini":
      return {
        ...baseHeaders,
        Authorization: `Bearer ${apiKey}`,
      }
    case "azure":
      // Extract the actual API key from the combined string
      const actualKey = apiKey.split("|")[0] || apiKey
      return {
        ...baseHeaders,
        "api-key": actualKey,
      }
    case "ollama":
      return baseHeaders
    default:
      return baseHeaders
  }
}

function createProviderPayload(provider: AIProvider, model: string, transcript: string) {
  const keywordExtractionPrompt = `
    You are a search keyword extraction specialist. Your task is to analyze the user's input and extract the most effective search keywords or phrases for a Google search.
    
    Guidelines:
    1. Focus ONLY on extracting the most relevant search terms
    2. Remove all filler words, articles, and unnecessary context
    3. Identify the core search intent and primary entities
    4. Format keywords in a way that would yield the best search results
    5. Correct any speech-to-text errors that are obvious
    6. Use Boolean operators (AND, OR, site:, etc.) when appropriate
    7. Include exact phrases in quotes when precision is needed
    8. For complex queries, structure with appropriate operators
    
    User's input: "${transcript}"
    
    Return ONLY the optimized search keywords without any explanations, introductions, or additional text.
  `

  switch (provider) {
    case "openai":
      return {
        model,
        messages: [
          {
            role: "system",
            content: "You are a search keyword extraction specialist.",
          },
          {
            role: "user",
            content: keywordExtractionPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }
    case "anthropic":
      return {
        model,
        messages: [
          {
            role: "user",
            content: keywordExtractionPrompt,
          },
        ],
        max_tokens: 150,
      }
    case "mistral":
      return {
        model,
        messages: [
          {
            role: "system",
            content: "You are a search keyword extraction specialist.",
          },
          {
            role: "user",
            content: keywordExtractionPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }
    case "groq":
      return {
        model,
        messages: [
          {
            role: "system",
            content: "You are a search keyword extraction specialist.",
          },
          {
            role: "user",
            content: keywordExtractionPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }
    case "cohere":
      return {
        model,
        prompt: keywordExtractionPrompt,
        max_tokens: 150,
        temperature: 0.3,
      }
    case "openrouter":
      return {
        model,
        messages: [
          {
            role: "system",
            content: "You are a search keyword extraction specialist.",
          },
          {
            role: "user",
            content: keywordExtractionPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }
    case "gemini":
      return {
        contents: [
          {
            parts: [
              {
                text: keywordExtractionPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 150,
        },
      }
    case "azure":
      return {
        messages: [
          {
            role: "system",
            content: "You are a search keyword extraction specialist.",
          },
          {
            role: "user",
            content: keywordExtractionPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }
    case "ollama":
      return {
        model,
        prompt: `${keywordExtractionPrompt}`,
        stream: false,
      }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

function extractResponseContent(data: any, provider: AIProvider): string {
  try {
    switch (provider) {
      case "openai":
        return data.choices[0].message.content.trim()
      case "anthropic":
        return data.content[0].text.trim()
      case "mistral":
        return data.choices[0].message.content.trim()
      case "groq":
        return data.choices[0].message.content.trim()
      case "cohere":
        return data.generations[0].text.trim()
      case "openrouter":
        return data.choices[0].message.content.trim()
      case "gemini":
        return data.candidates[0].content.parts[0].text.trim()
      case "azure":
        return data.choices[0].message.content.trim()
      case "ollama":
        return data.response.trim()
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  } catch (error) {
    console.error("Error extracting response content:", error)
    throw error
  }
}
