"use client"

import { useEffect, useRef } from "react"

interface VoiceFeedbackProps {
  isListening: boolean
}

export function VoiceFeedback({ isListening }: VoiceFeedbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let cleanup = () => {}

    const setupAudio = async () => {
      // Safety check - if not listening, clean up resources
      if (!isListening) {
        // Clean up media stream
        if (mediaStreamRef.current) {
          try {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop())
          } catch (e) {
            console.error("Error stopping media tracks:", e)
          }
          mediaStreamRef.current = null
        }
        
        // Cancel any animation frames
        if (animationRef.current) {
          try {
            cancelAnimationFrame(animationRef.current)
          } catch (e) {
            console.error("Error canceling animation frame:", e)
          }
        }
        
        // Close audio context
        if (audioContextRef.current) {
          try {
            await audioContextRef.current.close()
          } catch (e) {
            console.error("Error closing audio context:", e)
          }
          audioContextRef.current = null
        }

        // Clear canvas with fade effect
        const canvas = canvasRef.current
        if (canvas) {
          try {
            const ctx = canvas.getContext("2d")
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
          } catch (e) {
            console.error("Error clearing canvas:", e)
          }
        }
        return
      }

      try {
        // Request microphone permission explicitly
        if (!mediaStreamRef.current) {
          console.log("Requesting microphone permission...")
          try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
            console.log("Microphone permission granted!")
          } catch (permissionError) {
            console.error("Microphone permission error:", permissionError)
            return // Exit if we can't get microphone access
          }
        }

        // Create audio context with error handling
        if (!audioContextRef.current) {
          try {
            audioContextRef.current = new AudioContext()
            analyserRef.current = audioContextRef.current.createAnalyser()
            
            if (mediaStreamRef.current) {
              const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current)
              source.connect(analyserRef.current)
              
              analyserRef.current.fftSize = 256
              const bufferLength = analyserRef.current.frequencyBinCount
              dataArrayRef.current = new Uint8Array(bufferLength)
            }
          } catch (audioError) {
            console.error("Audio context error:", audioError)
            return // Exit if we can't set up audio processing
          }
        }

        // Start visualization
        draw()
      } catch (error) {
        console.error("Error in setupAudio:", error)
      }
    }

    const draw = (): void => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height

      analyserRef.current.getByteFrequencyData(dataArrayRef.current)

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)")
      gradient.addColorStop(0.5, "rgba(147, 51, 234, 0.1)")
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const barWidth = (width / dataArrayRef.current.length) * 2.5
      let x = 0

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * height * 0.8

        // Create gradient for bars
        const barGradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
        barGradient.addColorStop(0, "rgba(59, 130, 246, 0.8)")
        barGradient.addColorStop(0.5, "rgba(147, 51, 234, 0.6)")
        barGradient.addColorStop(1, "rgba(59, 130, 246, 0.4)")

        ctx.fillStyle = barGradient
        ctx.fillRect(x, height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }

      animationRef.current = requestAnimationFrame(() => draw())
    }

    setupAudio()

    cleanup = () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((e) => console.error("Error closing audio context:", e))
        audioContextRef.current = null
      }
    }

    return cleanup
  }, [isListening])

  return (
    <div
      className={`voice-feedback transition-all duration-300 ${
        isListening ? "opacity-100 scale-100" : "opacity-30 scale-95"
      }`}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="rounded-lg border bg-background/50 backdrop-blur-sm"
        />
        {!isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Voice visualization</p>
          </div>
        )}
      </div>
    </div>
  )
}
