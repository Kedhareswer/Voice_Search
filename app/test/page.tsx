"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [inputValue, setInputValue] = useState("")
  const [microphoneSupported, setMicrophoneSupported] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState("unknown")
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  useEffect(() => {
    // Check if microphone is supported
    if (navigator.mediaDevices) {
      setMicrophoneSupported(true)
    }
    
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true)
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
    } catch (error) {
      console.error("Error requesting microphone:", error)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error")
      setMicrophonePermission("denied")
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }
  
  const handleSubmit = () => {
    if (inputValue.trim()) {
      alert(`You submitted: "${inputValue}"`)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }
  
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center">Voice Search Test Page</h1>
      
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
          <CardTitle>Browser Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
            {JSON.stringify({
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              vendor: navigator.vendor,
              language: navigator.language,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
