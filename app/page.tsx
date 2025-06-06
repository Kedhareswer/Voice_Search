"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Loader2, Settings, Sparkles, Copy, Check, Moon, Sun, Zap, Grid3X3 } from "lucide-react"
import { processVoiceInput } from "@/lib/ai-processing"
import { SettingsDialog } from "@/components/settings-dialog"
import { SearchEngineSelector } from "@/components/search-engine-selector"
import { MultiSearchResults } from "@/components/multi-search-results"
import { SearchPreferences } from "@/components/search-preferences"
import { EnhancedVoiceInput } from "@/components/enhanced-voice-input"
import { InputTest } from "@/components/input-test"
import { useTheme } from "next-themes"
import { toast } from "@/hooks/use-toast"
import type { AIProvider } from "@/types/ai-provider"

export default function Home() {
  const [transcript, setTranscript] = useState("")
  const [extractedKeywords, setExtractedKeywords] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isEngineSelectOpen, setIsEngineSelectOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedEngines, setSelectedEngines] = useState<string[]>(["google"])
  const [searchPreferences, setSearchPreferences] = useState({
    autoSearch: true,
    openInNewTab: false,
    saveHistory: true,
    defaultEngines: ["google", "duckduckgo"],
  })
  const { theme, setTheme } = useTheme()

  const [apiConfig, setApiConfig] = useState<{
    provider: AIProvider
    apiKey: string
    model: string
  }>({
    provider: "local", // Default to local processing
    apiKey: "",
    model: "keyword-extraction",
  })

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("searchPreferences")
    if (savedPreferences) {
      try {
        setSearchPreferences(JSON.parse(savedPreferences))
      } catch (error) {
        console.error("Error loading preferences:", error)
      }
    }

    const savedEngines = localStorage.getItem("selectedEngines")
    if (savedEngines) {
      try {
        setSelectedEngines(JSON.parse(savedEngines))
      } catch (error) {
        console.error("Error loading engines:", error)
      }
    }

    // Load API config from localStorage
    const savedApiConfig = localStorage.getItem("apiConfig")
    if (savedApiConfig) {
      try {
        setApiConfig(JSON.parse(savedApiConfig))
      } catch (error) {
        console.error("Error loading API config:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("searchPreferences", JSON.stringify(searchPreferences))
  }, [searchPreferences])

  useEffect(() => {
    localStorage.setItem("selectedEngines", JSON.stringify(selectedEngines))
  }, [selectedEngines])

  useEffect(() => {
    localStorage.setItem("apiConfig", JSON.stringify(apiConfig))
  }, [apiConfig])

  const handleTranscript = (newTranscript: string) => {
    console.log("=== TRANSCRIPT RECEIVED ===")
    console.log("New transcript:", newTranscript)
    console.log("Auto search enabled:", searchPreferences.autoSearch)

    // Always update the transcript state
    setTranscript(newTranscript)
    
    // Show a toast to confirm receipt of transcript
    toast({
      title: "Input Received",
      description: `Processing: "${newTranscript}"`,
    })

    // Auto-process if enabled
    if (searchPreferences.autoSearch && newTranscript.trim()) {
      console.log("Auto-processing transcript...")
      handleProcessVoiceInput(newTranscript)
    } else {
      console.log("Auto-search disabled or empty transcript")
      // If auto-search is disabled but we have a transcript, show a message
      if (newTranscript.trim() && !searchPreferences.autoSearch) {
        toast({
          title: "Manual Processing Required",
          description: "Click 'Process Input' to extract keywords",
        })
      }
    }
  }

  const handleProcessVoiceInput = async (inputTranscript?: string) => {
    const textToProcess = inputTranscript || transcript

    console.log("=== PROCESSING INPUT ===")
    console.log("Text to process:", textToProcess)

    if (!textToProcess || !textToProcess.trim()) {
      toast({
        title: "No Input",
        description: "Please provide some text to process.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      console.log("Processing with config:", apiConfig)
      const result = await processVoiceInput(textToProcess, apiConfig)
      console.log("Processing result:", result)
      setExtractedKeywords(result)

      toast({
        title: "Keywords Extracted!",
        description:
          apiConfig.provider === "local"
            ? "Keywords extracted using local processing"
            : `Keywords extracted using ${apiConfig.provider.toUpperCase()} AI processing`,
      })
    } catch (error) {
      console.error("Error processing voice input:", error)
      toast({
        title: "Processing Error",
        description: "Failed to extract keywords. Using basic extraction instead.",
        variant: "destructive",
      })

      // Fallback to local processing on error
      try {
        const { extractSearchKeywords } = await import("@/lib/client-extraction")
        const fallbackResult = extractSearchKeywords(textToProcess)
        console.log("Fallback result:", fallbackResult)
        setExtractedKeywords(fallbackResult)
      } catch (fallbackError) {
        console.error("Fallback extraction failed:", fallbackError)
        toast({
          title: "Complete Failure",
          description: "Both AI and local processing failed. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSettingsSave = (newConfig: typeof apiConfig) => {
    setApiConfig(newConfig)
    setIsSettingsOpen(false)

    const processingType = newConfig.provider === "local" ? "local" : "AI-powered"
    toast({
      title: "Settings Saved",
      description: `Using ${processingType} keyword extraction.`,
    })
  }

  const handleEngineToggle = (engineId: string) => {
    setSelectedEngines((prev) => (prev.includes(engineId) ? prev.filter((id) => id !== engineId) : [...prev, engineId]))
  }

  const handlePreferenceChange = (key: string, value: any) => {
    setSearchPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleManualSearch = () => {
    if (transcript) {
      handleProcessVoiceInput()
    }
  }

  const copyKeywords = async () => {
    if (extractedKeywords) {
      try {
        await navigator.clipboard.writeText(extractedKeywords)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
          title: "Copied!",
          description: "Keywords copied to clipboard.",
        })
      } catch (error) {
        console.error("Failed to copy:", error)
        toast({
          title: "Copy Failed",
          description: "Failed to copy to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  const clearAll = () => {
    setTranscript("")
    setExtractedKeywords("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Multi-Search AI
                </h1>
                <p className="text-sm text-muted-foreground">AI-powered multi-engine search assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden sm:flex">
                {selectedEngines.length} engine{selectedEngines.length !== 1 ? "s" : ""}
              </Badge>

              <Dialog open={isEngineSelectOpen} onOpenChange={setIsEngineSelectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Search Engines</DialogTitle>
                  </DialogHeader>
                  <SearchEngineSelector selectedEngines={selectedEngines} onEngineToggle={handleEngineToggle} />
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Processing Mode Banner */}
        <Card
          className={`${
            apiConfig.provider === "local"
              ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
              : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Zap className={`h-5 w-5 ${apiConfig.provider === "local" ? "text-blue-600" : "text-green-600"}`} />
              <div>
                <p
                  className={`font-medium ${
                    apiConfig.provider === "local"
                      ? "text-blue-800 dark:text-blue-200"
                      : "text-green-800 dark:text-green-200"
                  }`}
                >
                  {apiConfig.provider === "local"
                    ? "Using Local Processing"
                    : `Using ${apiConfig.provider.toUpperCase()} AI Processing`}
                </p>
                <p
                  className={`text-sm ${
                    apiConfig.provider === "local"
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-green-700 dark:text-green-300"
                  }`}
                >
                  {apiConfig.provider === "local"
                    ? "Keywords are extracted locally in your browser"
                    : `Using ${apiConfig.model} model for keyword extraction`}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="ml-auto">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Voice Input Section */}
          <div className="lg:col-span-3 space-y-6">
            <EnhancedVoiceInput
              onTranscript={handleTranscript}
              disabled={false}
              placeholder="Type your search query here..."
            />

            {/* Manual Search Button */}
            {transcript && !searchPreferences.autoSearch && (
              <div className="flex justify-center">
                <Button onClick={handleManualSearch} disabled={isProcessing} size="lg">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting Keywords...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Extract Keywords & Search
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Extracted Keywords */}
            {extractedKeywords && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      Extracted Keywords
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={copyKeywords} className="h-8 w-8 p-0">
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <p className="font-medium text-foreground">{extractedKeywords}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Multi-Search Results */}
            {extractedKeywords && selectedEngines.length > 0 && (
              <MultiSearchResults
                searchQuery={extractedKeywords}
                selectedEngines={selectedEngines}
                onEngineRemove={(engineId) => handleEngineToggle(engineId)}
              />
            )}

            {/* Clear All Button */}
            {(transcript || extractedKeywords) && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SearchPreferences preferences={searchPreferences} onPreferenceChange={handlePreferenceChange} />
          </div>
        </div>
      </main>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={handleSettingsSave}
      />
    </div>
  )
}
