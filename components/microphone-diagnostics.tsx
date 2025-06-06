"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Mic,
  MicOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Volume2,
  Settings,
  ExternalLink,
} from "lucide-react"

interface DiagnosticResult {
  test: string
  status: "pass" | "fail" | "warning" | "info"
  message: string
  details?: string
  action?: string
}

export function MicrophoneDiagnostics() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [isTestingAudio, setIsTestingAudio] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    const diagnosticResults: DiagnosticResult[] = []

    // Test 1: Browser Support
    const testBrowserSupport = () => {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

      if (!hasGetUserMedia) {
        return {
          test: "Browser Support - getUserMedia",
          status: "fail" as const,
          message: "getUserMedia not supported",
          details: "Your browser doesn't support microphone access",
          action: "Please use Chrome, Firefox, Safari, or Edge",
        }
      }

      if (!hasSpeechRecognition) {
        return {
          test: "Browser Support - Speech Recognition",
          status: "warning" as const,
          message: "Speech Recognition not supported",
          details: "Voice recognition won't work, but manual input is available",
          action: "Use Chrome, Edge, or Safari for full voice support",
        }
      }

      return {
        test: "Browser Support",
        status: "pass" as const,
        message: "All required APIs are supported",
      }
    }

    diagnosticResults.push(testBrowserSupport())

    // Test 2: HTTPS Check
    const testHTTPS = () => {
      const isSecure = location.protocol === "https:" || location.hostname === "localhost"

      return {
        test: "HTTPS Security",
        status: isSecure ? ("pass" as const) : ("fail" as const),
        message: isSecure ? "Secure connection detected" : "Insecure connection",
        details: isSecure ? undefined : "Microphone access requires HTTPS",
        action: isSecure ? undefined : "Access this site via HTTPS",
      }
    }

    diagnosticResults.push(testHTTPS())

    // Test 3: Permission API Check
    const testPermissionAPI = async () => {
      try {
        if ("permissions" in navigator) {
          const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })

          return {
            test: "Microphone Permission",
            status:
              permission.state === "granted"
                ? ("pass" as const)
                : permission.state === "denied"
                  ? ("fail" as const)
                  : ("warning" as const),
            message: `Permission state: ${permission.state}`,
            details:
              permission.state === "denied"
                ? "Microphone access has been blocked"
                : permission.state === "prompt"
                  ? "Permission will be requested when needed"
                  : undefined,
            action: permission.state === "denied" ? "Reset permissions in browser settings" : undefined,
          }
        } else {
          return {
            test: "Permission API",
            status: "warning" as const,
            message: "Permission API not available",
            details: "Cannot check permission status in advance",
          }
        }
      } catch (error) {
        return {
          test: "Permission API",
          status: "warning" as const,
          message: "Permission check failed",
          details: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    diagnosticResults.push(await testPermissionAPI())

    // Test 4: Device Enumeration
    const testDeviceEnumeration = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const audioInputs = devices.filter((device) => device.kind === "audioinput")

          return {
            test: "Audio Input Devices",
            status: audioInputs.length > 0 ? ("pass" as const) : ("fail" as const),
            message: `Found ${audioInputs.length} audio input device(s)`,
            details:
              audioInputs.length === 0
                ? "No microphone devices detected"
                : audioInputs.map((device) => device.label || "Unknown device").join(", "),
            action: audioInputs.length === 0 ? "Connect a microphone and refresh" : undefined,
          }
        } else {
          return {
            test: "Device Enumeration",
            status: "warning" as const,
            message: "Device enumeration not supported",
          }
        }
      } catch (error) {
        return {
          test: "Device Enumeration",
          status: "warning" as const,
          message: "Could not enumerate devices",
          details: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    diagnosticResults.push(await testDeviceEnumeration())

    // Test 5: Microphone Access Test
    const testMicrophoneAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

        // Store stream for audio level testing
        setMediaStream(stream)

        // Test that we can actually get audio data
        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        source.connect(analyser)

        // Clean up test audio context
        setTimeout(() => {
          audioContext.close()
        }, 100)

        return {
          test: "Microphone Access",
          status: "pass" as const,
          message: "Microphone access granted successfully",
          details: "Audio stream is active and ready",
        }
      } catch (error) {
        let message = "Microphone access failed"
        let details = ""
        let action = ""

        if (error instanceof Error) {
          switch (error.name) {
            case "NotAllowedError":
              message = "Permission denied"
              details = "User denied microphone access"
              action = "Click 'Allow' when prompted or reset site permissions"
              break
            case "NotFoundError":
              message = "No microphone found"
              details = "No audio input devices available"
              action = "Connect a microphone and try again"
              break
            case "NotSupportedError":
              message = "Not supported"
              details = "Microphone access not supported in this context"
              action = "Try a different browser or check site permissions"
              break
            case "NotReadableError":
              message = "Device in use"
              details = "Microphone is being used by another application"
              action = "Close other applications using the microphone"
              break
            case "OverconstrainedError":
              message = "Constraints not satisfied"
              details = "Requested audio constraints cannot be satisfied"
              action = "Try with different audio settings"
              break
            default:
              details = error.message
          }
        }

        return {
          test: "Microphone Access",
          status: "fail" as const,
          message,
          details,
          action,
        }
      }
    }

    diagnosticResults.push(await testMicrophoneAccess())

    setResults(diagnosticResults)
    setIsRunning(false)
  }

  const testAudioLevels = () => {
    if (!mediaStream) return

    setIsTestingAudio(true)
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(mediaStream)
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    microphone.connect(analyser)
    analyser.fftSize = 256

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(Math.round((average / 255) * 100))

      if (isTestingAudio) {
        requestAnimationFrame(updateAudioLevel)
      }
    }

    updateAudioLevel()

    // Stop after 10 seconds
    setTimeout(() => {
      setIsTestingAudio(false)
      audioContext.close()
    }, 10000)
  }

  const stopAudioTest = () => {
    setIsTestingAudio(false)
    setAudioLevel(0)
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      setMediaStream(null)
    }
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "pass":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
      case "fail":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
    }
  }

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [mediaStream])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Microphone Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDiagnostics} disabled={isRunning} className="flex-1">
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>

          {mediaStream && !isTestingAudio && (
            <Button onClick={testAudioLevels} variant="outline">
              <Volume2 className="h-4 w-4 mr-2" />
              Test Audio
            </Button>
          )}

          {isTestingAudio && (
            <Button onClick={stopAudioTest} variant="destructive">
              <MicOff className="h-4 w-4 mr-2" />
              Stop Test
            </Button>
          )}
        </div>

        {isTestingAudio && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Audio Level</span>
              <Badge variant="secondary">{audioLevel}%</Badge>
            </div>
            <Progress value={audioLevel} className="h-2" />
            <p className="text-xs text-muted-foreground">Speak into your microphone to test audio levels</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Diagnostic Results</h3>
            {results.map((result, index) => (
              <Alert key={index} className={getStatusColor(result.status)}>
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{result.test}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.status}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">{result.message}</AlertDescription>
                    {result.details && <p className="text-xs text-muted-foreground">{result.details}</p>}
                    {result.action && (
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Action: {result.action}</p>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Browser-specific instructions */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Browser-Specific Instructions
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <strong>Chrome/Edge:</strong> Click the microphone icon in the address bar or go to Settings → Privacy →
              Site Settings → Microphone
            </div>
            <div>
              <strong>Firefox:</strong> Click the shield icon in the address bar or go to Preferences → Privacy &
              Security → Permissions
            </div>
            <div>
              <strong>Safari:</strong> Go to Safari → Preferences → Websites → Microphone
            </div>
          </div>
          <Button variant="link" size="sm" className="mt-2 p-0 h-auto" asChild>
            <a href="https://support.google.com/chrome/answer/2693767" target="_blank" rel="noopener noreferrer">
              Learn more about microphone permissions
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
