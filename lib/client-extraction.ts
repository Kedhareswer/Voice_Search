/**
 * Client-side keyword extraction utilities that work without requiring API keys
 */

// Simple stopwords list for filtering
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "by",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "from",
  "up",
  "down",
  "of",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
  "d",
  "ll",
  "m",
  "o",
  "re",
  "ve",
  "y",
  "ain",
  "aren",
  "couldn",
  "didn",
  "doesn",
  "hadn",
  "hasn",
  "haven",
  "isn",
  "ma",
  "mightn",
  "mustn",
  "needn",
  "shan",
  "shouldn",
  "wasn",
  "weren",
  "won",
  "wouldn",
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "would",
  "should",
  "could",
  "ought",
  "i'm",
  "you're",
  "he's",
  "she's",
  "it's",
  "we're",
  "they're",
  "i've",
  "you've",
  "we've",
  "they've",
  "i'd",
  "you'd",
  "he'd",
  "she'd",
  "we'd",
  "they'd",
  "i'll",
  "you'll",
  "he'll",
  "she'll",
  "we'll",
  "they'll",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "hasn't",
  "haven't",
  "hadn't",
  "doesn't",
  "don't",
  "didn't",
  "won't",
  "wouldn't",
  "shan't",
  "shouldn't",
  "can't",
  "cannot",
  "couldn't",
  "mustn't",
  "let's",
  "that's",
  "who's",
  "what's",
  "here's",
  "there's",
  "when's",
  "where's",
  "why's",
  "how's",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
])

/**
 * Extract keywords from text using a simple frequency-based approach
 * @param text The input text to extract keywords from
 * @param options Configuration options
 * @returns A string of extracted keywords
 */
export function extractKeywords(
  text: string,
  options: {
    maxKeywords?: number
    includeQuotes?: boolean
    includeBoolean?: boolean
  } = {},
): string {
  const { maxKeywords = 8, includeQuotes = true, includeBoolean = true } = options

  if (!text || text.trim().length === 0) {
    return ""
  }

  // Extract quoted phrases first if enabled
  const quotes: string[] = []
  if (includeQuotes) {
    const quoteRegex = /"([^"]+)"/g
    let match
    let processedText = text

    while ((match = quoteRegex.exec(text)) !== null) {
      quotes.push(match[1])
      // Remove the quoted text to avoid double-counting
      processedText = processedText.replace(match[0], "")
    }

    text = processedText
  }

  // Clean and tokenize the text
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim()

  const words = cleanText.split(" ")

  // Count word frequencies
  const wordFreq: Record<string, number> = {}
  for (const word of words) {
    if (word.length > 2 && !STOPWORDS.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  }

  // Sort words by frequency
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])

  // Get the top keywords
  let keywords = sortedWords.slice(0, maxKeywords)

  // Add quoted phrases
  if (includeQuotes && quotes.length > 0) {
    // Limit the number of quotes to include
    const quotesToInclude = quotes.slice(0, Math.min(3, quotes.length))
    keywords = [...quotesToInclude.map((q) => `"${q}"`), ...keywords]

    // Adjust to maintain max keywords
    if (keywords.length > maxKeywords) {
      keywords = keywords.slice(0, maxKeywords)
    }
  }

  // Add boolean operators if enabled
  if (includeBoolean && keywords.length > 1) {
    // For simplicity, just add AND between the first two important keywords
    if (keywords.length >= 2) {
      const result = keywords.slice(0, 2).join(" AND ") + " " + keywords.slice(2).join(" ")
      return result
    }
  }

  return keywords.join(" ")
}

/**
 * Detect search intent from text to improve keyword extraction
 * @param text The input text
 * @returns The detected intent
 */
export function detectSearchIntent(text: string): {
  intent: "question" | "definition" | "comparison" | "howto" | "general"
  modifier?: string
} {
  const lowerText = text.toLowerCase()

  // Question intent
  if (/^(who|what|when|where|why|how|is|are|can|do|does|did|will|should)[\s\w]+\?*$/.test(lowerText)) {
    return { intent: "question" }
  }

  // Definition intent
  if (/^(what is|what are|define|meaning of|definition of)[\s\w]+$/.test(lowerText)) {
    return { intent: "definition" }
  }

  // Comparison intent
  if (/\b(vs|versus|compared to|difference between|better than)\b/.test(lowerText)) {
    return { intent: "comparison" }
  }

  // How-to intent
  if (/^(how to|steps to|guide for|tutorial on)[\s\w]+$/.test(lowerText)) {
    return { intent: "howto", modifier: "tutorial" }
  }

  // Default to general search
  return { intent: "general" }
}

/**
 * Enhance extracted keywords based on detected intent
 * @param keywords The extracted keywords
 * @param intent The detected search intent
 * @returns Enhanced search query
 */
export function enhanceKeywords(keywords: string, intent: ReturnType<typeof detectSearchIntent>): string {
  if (!keywords) return ""

  switch (intent.intent) {
    case "question":
      // For questions, try to preserve the question format
      return keywords
    case "definition":
      return `define ${keywords}`
    case "comparison":
      return `${keywords} comparison`
    case "howto":
      return `how to ${keywords} ${intent.modifier || ""}`
    default:
      return keywords
  }
}

/**
 * Main function to extract search keywords from text without using AI
 * @param text The input text
 * @returns Optimized search keywords
 */
export function extractSearchKeywords(text: string): string {
  // Detect intent
  const intent = detectSearchIntent(text)

  // Extract basic keywords
  const keywords = extractKeywords(text, {
    maxKeywords: 8,
    includeQuotes: true,
    includeBoolean: intent.intent === "comparison",
  })

  // Enhance based on intent
  return enhanceKeywords(keywords, intent)
}
