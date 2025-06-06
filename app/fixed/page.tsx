"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Script from "next/script"

export default function FixedPage() {
  const [inputValue, setInputValue] = useState("")
  const [microphoneSupported, setMicrophoneSupported] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState("unknown")
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  
  useEffect(() => {
    // Log that component mounted
    console.log("FixedPage component mounted")
    
    // Check if microphone is supported
    if (navigator.mediaDevices) {
      console.log("MediaDevices API is supported")
      setMicrophoneSupported(true)
    } else {
      console.log("MediaDevices API is NOT supported")
    }
    
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      console.log("SpeechRecognition API is supported")
      setSpeechRecognitionSupported(true)
    } else {
      console.log("SpeechRecognition API is NOT supported")
    }
    
    // Add click event listeners to document to test if basic interaction works
    const handleDocumentClick = (e: MouseEvent) => {
      console.log("Document clicked at:", e.clientX, e.clientY)
      console.log("Target:", e.target)
    }
    
    document.addEventListener("click", handleDocumentClick)
    
    return () => {
      document.removeEventListener("click", handleDocumentClick)
    }
  }, [])
  
  const checkMicrophonePermission = async () => {
    try {
      setErrorMessage("")
      console.log("Requesting microphone permission...")
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("Microphone permission granted!")
      
      // Stop tracks to release the microphone
      stream.getTracks().forEach(track => track.stop())
      
      setMicrophonePermission("granted")
      toast({
        title: "Microphone Access Granted",
        description: "You can now use voice input features.",
      })
    } catch (error) {
      console.error("Error requesting microphone:", error)
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setErrorMessage(errorMsg)
      setMicrophonePermission("denied")
      toast({
        title: "Microphone Access Denied",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input changed:", e.target.value)
    setInputValue(e.target.value)
  }
  
  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log("Submitting input:", inputValue)
      toast({
        title: "Input Submitted",
        description: `You entered: "${inputValue}"`,
      })
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Enter key pressed")
      handleSubmit()
    }
  }
  
  const toggleListening = async () => {
    if (isListening) {
      console.log("Stopping listening")
      setIsListening(false)
    } else {
      console.log("Starting listening")
      // First ensure we have microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        
        setIsListening(true)
        setMicrophonePermission("granted")
        
        // In a real app, you would start speech recognition here
        // For this test, we'll just simulate receiving a transcript
        setTimeout(() => {
          setTranscript("This is a simulated transcript")
          setIsListening(false)
          toast({
            title: "Voice Input Received",
            description: "This is a simulated transcript",
          })
        }, 3000)
      } catch (error) {
        console.error("Error requesting microphone for listening:", error)
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        setErrorMessage(errorMsg)
        toast({
          title: "Microphone Error",
          description: errorMsg,
          variant: "destructive",
        })
      }
    }
  }
  
  return (
    <div className="container mx-auto py-10 space-y-8">
      <Script src="/diagnostic.js" strategy="afterInteractive" />
      
      <h1 className="text-3xl font-bold text-center">Fixed Voice Search Test</h1>
      <p className="text-center text-muted-foreground">This page tests basic input and microphone functionality</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Input Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type something here..."
              className="flex-1"
              autoComplete="off"
            />
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
          
          {inputValue && (
            <div className="p-4 bg-muted rounded-lg">
              <p>Current input: <span className="font-mono">{inputValue}</span></p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Microphone Permission Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Browser Support</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className={`mr-2 ${microphoneSupported ? "text-green-500" : "text-red-500"}`}>
                    {microphoneSupported ? "✓" : "✗"}
                  </span>
                  Microphone API Support
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${speechRecognitionSupported ? "text-green-500" : "text-red-500"}`}>
                    {speechRecognitionSupported ? "✓" : "✗"}
                  </span>
                  Speech Recognition API Support
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Permission Status</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className={`mr-2 ${
                    microphonePermission === "granted" ? "text-green-500" : 
                    microphonePermission === "denied" ? "text-red-500" : "text-yellow-500"
                  }`}>
                    {microphonePermission === "granted" ? "✓" : 
                     microphonePermission === "denied" ? "✗" : "?"}
                  </span>
                  Microphone Permission: {microphonePermission}
                </div>
                
                <Button onClick={checkMicrophonePermission}>
                  Request Microphone Permission
                </Button>
              </div>
            </div>
          </div>
          
          {errorMessage && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
              <p className="font-medium">Error:</p>
              <p className="font-mono text-sm">{errorMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Voice Input Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Button 
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              className="h-16 w-16 rounded-full"
            >
              {isListening ? "Stop" : "Start"}
            </Button>
          </div>
          
          {transcript && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Transcript:</p>
              <p>{transcript}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
            {JSON.stringify({
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              vendor: navigator.vendor,
              language: navigator.language,
              windowSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
              microphoneSupported,
              speechRecognitionSupported,
              microphonePermission,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
