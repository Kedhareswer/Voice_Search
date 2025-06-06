"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mic, MicOff, AlertTriangle, Settings, RefreshCw, Keyboard, HelpCircle } from "lucide-react"
import { useMicrophone } from "@/hooks/use-microphone"
import { MicrophoneDiagnostics } from "@/components/microphone-diagnostics"
import { VoiceFeedback } from "@/components/voice-feedback"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

interface EnhancedVoiceInputProps {
  onTranscript: (transcript: string) => void
  disabled?: boolean
  placeholder?: string
}

export function EnhancedVoiceInput({ onTranscript, disabled = false, placeholder }: EnhancedVoiceInputProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [inputMode, setInputMode] = useState<"voice" | "manual">("manual") // Start with manual mode

  const {
    isListening,
    isSupported,
    hasPermission,
    error,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    checkPermission,
  } = useMicrophone({
    onTranscript: (text) => {
      console.log("Voice transcript received:", text)
      if (text.trim()) {
        onTranscript(text)
      }
    },
    onError: (errorMessage) => {
      console.error("Voice error:", errorMessage)
      toast({
        title: "Voice Recognition Error",
        description: errorMessage,
        variant: "destructive",
      })
    },
    onStart: () => {
      console.log("Voice recognition started")
      toast({
        title: "Listening Started",
        description: "Speak now, your voice is being captured.",
      })
    },
  })

  // Auto-switch to manual if voice not supported
  useEffect(() => {
    if (!isSupported) {
      setInputMode("manual")
    }
  }, [isSupported])

  // Force pointer events to be enabled
  useEffect(() => {
    // This ensures that pointer events are enabled on all elements
    const style = document.createElement('style')
    style.innerHTML = '* { pointer-events: auto !important; }'
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleMicrophoneClick = async () => {
    if (disabled) return

    console.log("Microphone button clicked, isListening:", isListening)

    if (isListening) {
      stopListening()
    } else {
      // Explicitly request microphone permission first
      try {
        console.log("Explicitly requesting microphone permission...")
        await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log("Microphone permission granted!")
        
        const success = await startListening()
        console.log("Start listening result:", success)
        
        if (!success) {
          console.error("Failed to start listening even with permissions")
          if (!isSupported) {
            setInputMode("manual")
            toast({
              title: "Voice Input Unavailable",
              description: "Switched to manual input mode",
              variant: "default",
            })
          }
        }
      } catch (error) {
        console.error("Error requesting microphone permission:", error)
        setInputMode("manual")
        toast({
          title: "Microphone Permission Denied",
          description: "Please allow microphone access in your browser settings",
          variant: "destructive",
        })
      }
    }
  }

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log("Manual input changed:", value)
    setManualInput(value)
  }
  
  // Handle Enter key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log("Enter key pressed in manual input")
      e.preventDefault()
      handleManualSubmit()
    }
  }

  const handleManualSubmit = () => {
    console.log("Manual submit clicked, input value:", manualInput)
    if (manualInput.trim()) {
      // Force a console log to verify this function is being called
      console.log("SUBMITTING MANUAL INPUT:", manualInput.trim())
      // Call the onTranscript callback with the trimmed input
      onTranscript(manualInput.trim())
      // Clear the input field after submission
      setManualInput("")
      // Show a toast confirmation
      toast({
        title: "Search Submitted",
        description: `Processing: "${manualInput.trim()}"`,
      })
    } else {
      toast({
        title: "Empty Input",
        description: "Please enter a search query",
        variant: "destructive",
      })
    }
  }

  const handleRetry = async () => {
    clearError()
    resetTranscript()
    await checkPermission()
  }

  const getMicrophoneButtonVariant = () => {
    if (disabled) return "outline"
    if (error) return "destructive"
    if (isListening) return "destructive"
    return "default"
  }

  const getMicrophoneButtonIcon = () => {
    if (error) return <AlertTriangle className="h-6 w-6" />
    if (isListening) return <MicOff className="h-6 w-6" />
    return <Mic className="h-6 w-6" />
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            Voice Input
            <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" style={{ pointerEvents: 'auto' }}>
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Microphone Diagnostics</DialogTitle>
                </DialogHeader>
                <MicrophoneDiagnostics />
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-muted-foreground">
            {inputMode === "voice" ? "Speak your search query or type it manually" : "Type your search query below"}
          </p>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Input Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                variant={inputMode === "voice" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log("Switching to voice mode")
                  setInputMode("voice")
                }}
                disabled={!isSupported || disabled}
                className="rounded-l-md rounded-r-none"
                style={{ pointerEvents: 'auto' }}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice
              </Button>
              <Button
                variant={inputMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log("Switching to manual mode")
                  setInputMode("manual")
                }}
                disabled={disabled}
                className="rounded-r-md rounded-l-none"
                style={{ pointerEvents: 'auto' }}
              >
                <Keyboard className="h-4 w-4 mr-2" />
                Manual
              </Button>
            </div>
          </div>

          {/* Voice Input UI */}
          {inputMode === "voice" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button
                  onClick={handleMicrophoneClick}
                  disabled={disabled}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  className="rounded-full h-16 w-16"
                  style={{ pointerEvents: 'auto' }}
                >
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
              </div>

              {/* Voice feedback visualization */}
              {isListening && <VoiceFeedback isListening={isListening} />}

              {/* Status badge */}
              <div className="flex justify-center">
                <Badge variant={isListening ? "default" : "outline"}>
                  {isListening ? "Listening..." : "Ready"}
                </Badge>
              </div>

              {/* Error display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Transcript display */}
              {transcript && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Transcript:</p>
                  <p>{transcript}</p>
                </div>
              )}
            </div>
          )}

          {/* Manual Input UI */}
          {inputMode === "manual" && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder={placeholder || "Type your search query..."}
                  value={manualInput}
                  onChange={handleManualInputChange}
                  onKeyDown={handleKeyPress}
                  disabled={disabled}
                  className="flex-1"
                  style={{ pointerEvents: 'auto' }}
                  autoComplete="off"
                />
                <Button 
                  onClick={handleManualSubmit} 
                  disabled={disabled || !manualInput.trim()}
                  style={{ pointerEvents: 'auto' }}
                >
                  Submit
                </Button>
              </div>

              {/* Manual input help text */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Type your search query and press Enter or click Submit</p>
              </div>
            </div>
          )}

          {/* Debug info - always show for troubleshooting */}
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded border border-dashed">
            Debug: Input value = "{manualInput}", Length = {manualInput.length}
            <br />
            Voice Support: {isSupported ? "Yes" : "No"}, 
            Has Permission: {hasPermission ? "Yes" : "No"}, 
            Is Listening: {isListening ? "Yes" : "No"}
            {error && <div className="text-red-500 mt-1">Error: {error}</div>}
          </div>

          {/* Support Information */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Having trouble?
              <Button
                variant="link"
                size="sm"
                className="p-0 ml-1 h-auto text-xs"
                onClick={() => setShowDiagnostics(true)}
                style={{ pointerEvents: 'auto' }}
              >
                Run diagnostics
              </Button>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
