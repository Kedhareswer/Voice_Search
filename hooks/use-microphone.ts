"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface MicrophoneOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

interface MicrophoneState {
  isListening: boolean
  isSupported: boolean
  hasPermission: boolean
  error: string | null
  transcript: string
}

export function useMicrophone(options: MicrophoneOptions = {}) {
  const {
    continuous = true,
    interimResults = true,
    language = "en-US",
    onTranscript,
    onError,
    onStart,
    onEnd,
  } = options

  const [state, setState] = useState<MicrophoneState>({
    isListening: false,
    isSupported: false,
    hasPermission: false,
    error: null,
    transcript: "",
  })

  const recognitionRef = useRef<any>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef({
    onTranscript,
    onError,
    onStart,
    onEnd,
  })

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onTranscript,
      onError,
      onStart,
      onEnd,
    }
  }, [onTranscript, onError, onStart, onEnd])

  // Initialize speech recognition only once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: true }))

      const recognition = new SpeechRecognition()
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = language

      recognition.onstart = () => {
        console.log("Speech recognition started")
        setState((prev) => ({ ...prev, isListening: true, error: null }))
        callbacksRef.current.onStart?.()
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }

        if (finalTranscript) {
          setState((prev) => ({ ...prev, transcript: finalTranscript }))
          callbacksRef.current.onTranscript?.(finalTranscript)
        }
      }

      recognition.onend = () => {
        console.log("Speech recognition ended")
        setState((prev) => ({ ...prev, isListening: false }))
        callbacksRef.current.onEnd?.()
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)

        let errorMessage = "Speech recognition error occurred"

        switch (event.error) {
          case "not-allowed":
            errorMessage = "Microphone permission denied. Please allow microphone access."
            setState((prev) => ({ ...prev, hasPermission: false }))
            break
          case "no-speech":
            errorMessage = "No speech detected. Please try speaking."
            break
          case "audio-capture":
            errorMessage = "No microphone found. Please connect a microphone."
            break
          case "network":
            errorMessage = "Network error occurred. Please check your connection."
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }

        setState((prev) => ({
          ...prev,
          isListening: false,
          error: errorMessage,
        }))

        callbacksRef.current.onError?.(errorMessage)
      }

      recognitionRef.current = recognition
    } else {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: "Speech recognition not supported in this browser",
      }))
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error("Error stopping recognition:", error)
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [continuous, interimResults, language]) // Only include stable values

  const checkPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMessage = "Browser doesn't support media devices";
      setState((prev) => ({
        ...prev,
        hasPermission: false,
        error: errorMessage,
      }));
      return false;
    }

    try {
      // Explicitly request microphone permission
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted!");
      
      // Store the stream for later use
      mediaStreamRef.current = stream;
      
      // Update state to reflect permission granted
      setState((prev) => ({ ...prev, hasPermission: true, error: null }));
      return true;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      
      let errorMessage = "Microphone access failed";
      
      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Microphone permission denied";
            break;
          case "NotFoundError":
            errorMessage = "No microphone found";
            break;
          case "NotSupportedError":
            errorMessage = "Microphone not supported";
            break;
          case "NotReadableError":
            errorMessage = "Microphone is being used by another application";
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setState((prev) => ({
        ...prev,
        hasPermission: false,
        error: errorMessage,
      }));
      
      return false;
    }
  }, [])

  const startListening = useCallback(async () => {
    if (!state.isSupported) {
      const error = "Speech recognition is not supported in this browser"
      setState((prev) => ({ ...prev, error }))
      callbacksRef.current.onError?.(error)
      return false
    }

    if (state.isListening) {
      return true
    }

    // Check permission first
    const hasPermission = await checkPermission()
    if (!hasPermission) {
      return false
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        return true
      }
      return false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start speech recognition"
      setState((prev) => ({ ...prev, error: errorMessage }))
      callbacksRef.current.onError?.(errorMessage)
      return false
    }
  }, [state.isSupported, state.isListening, checkPermission])

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current && state.isListening) {
        recognitionRef.current.stop()
      }
    } catch (error) {
      console.error("Error stopping recognition:", error)
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
  }, [state.isListening])

  const resetTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: "" }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    checkPermission,
  }
}
