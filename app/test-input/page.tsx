"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function TestInputPage() {
  const [inputValue, setInputValue] = useState("")
  const [microphoneSupported, setMicrophoneSupported] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState("unknown")
  const [isListening, setIsListening] = useState(false)
  
  useEffect(() => {
    console.log("TestInputPage component mounted")
    
    // Check if microphone is supported
    if (navigator.mediaDevices) {
      console.log("MediaDevices API is supported")
      setMicrophoneSupported(true)
    }
    
    // Force pointer events to be enabled on all elements
    const style = document.createElement('style')
    style.innerHTML = '* { pointer-events: auto !important; }'
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  
  const checkMicrophonePermission = async () => {
    try {
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
      e.preventDefault()
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
        setTimeout(() => {
          setIsListening(false)
          toast({
            title: "Voice Input Received",
            description: "This is a simulated transcript",
          })
        }, 3000)
      } catch (error) {
        console.error("Error requesting microphone for listening:", error)
        toast({
          title: "Microphone Error",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        })
      }
    }
  }
  
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center">Input Test Page</h1>
      <p className="text-center text-muted-foreground">This page tests basic input functionality</p>
      
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
              style={{ pointerEvents: 'auto' }}
              autoComplete="off"
            />
            <Button 
              onClick={handleSubmit}
              style={{ pointerEvents: 'auto' }}
            >
              Submit
            </Button>
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
                
                <Button 
                  onClick={checkMicrophonePermission}
                  style={{ pointerEvents: 'auto' }}
                >
                  Request Microphone Permission
                </Button>
              </div>
            </div>
          </div>
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
              style={{ pointerEvents: 'auto' }}
            >
              {isListening ? "Stop" : "Start"}
            </Button>
          </div>
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
              microphonePermission,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
