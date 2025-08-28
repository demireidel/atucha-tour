"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { workerScript } from "@/workers/geometryWorker"

interface UseWebWorkerReturn {
  postMessage: (message: any, callback?: (data: any) => void) => void
  terminate: () => void
  isReady: boolean
  error: string | null
}

export function useWebWorker(workerUrl?: string): UseWebWorkerReturn {
  const workerRef = useRef<Worker | null>(null)
  const callbacksRef = useRef<Map<string, (data: any) => void>>(new Map())
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Create worker from script string if no URL provided
      if (!workerUrl) {
        const blob = new Blob([workerScript], { type: "application/javascript" })
        const url = URL.createObjectURL(blob)
        workerRef.current = new Worker(url)
      } else {
        workerRef.current = new Worker(workerUrl)
      }

      const worker = workerRef.current

      worker.onmessage = (e) => {
        const { messageId, ...data } = e.data
        if (messageId && callbacksRef.current.has(messageId)) {
          const callback = callbacksRef.current.get(messageId)
          if (callback) {
            callback(data)
            callbacksRef.current.delete(messageId)
          }
        }
      }

      worker.onerror = (e) => {
        console.error("Worker error:", e)
        setError(e.message)
        setIsReady(false)
      }

      worker.onmessageerror = (e) => {
        console.error("Worker message error:", e)
        setError("Worker message error")
        setIsReady(false)
      }

      setIsReady(true)
      setError(null)

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate()
          workerRef.current = null
        }
        callbacksRef.current.clear()
        setIsReady(false)
      }
    } catch (err) {
      console.error("Failed to create worker:", err)
      setError(err instanceof Error ? err.message : "Failed to create worker")
      setIsReady(false)
    }
  }, [workerUrl])

  const postMessage = useCallback(
    (message: any, callback?: (data: any) => void) => {
      if (!workerRef.current || !isReady) {
        console.warn("Worker not ready")
        return
      }

      const messageId = callback ? `msg_${Date.now()}_${Math.random()}` : undefined

      if (callback && messageId) {
        callbacksRef.current.set(messageId, callback)
      }

      workerRef.current.postMessage({ ...message, messageId })
    },
    [isReady],
  )

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
      callbacksRef.current.clear()
      setIsReady(false)
    }
  }, [])

  return {
    postMessage,
    terminate,
    isReady,
    error,
  }
}

// Hook específico para cálculos geométricos
export function useGeometryWorker() {
  const { postMessage, isReady, error, terminate } = useWebWorker()

  const calculateFuelAssemblies = useCallback(
    (count: number, spacing: number, callback: (positions: number[][]) => void) => {
      postMessage({ type: "CALCULATE_FUEL_ASSEMBLIES", data: { count, spacing } }, (data) => callback(data.positions))
    },
    [postMessage],
  )

  const calculateControlRods = useCallback(
    (rodCount: number, callback: (positions: number[][]) => void) => {
      postMessage({ type: "CALCULATE_CONTROL_RODS", data: { rodCount } }, (data) => callback(data.positions))
    },
    [postMessage],
  )

  const calculateRibs = useCallback(
    (
      ribCount: number,
      diameter: number,
      callback: (ribs: Array<{ position: number[]; rotation: number[] }>) => void,
    ) => {
      postMessage({ type: "CALCULATE_RIBS", data: { ribCount, diameter } }, (data) => callback(data.ribs))
    },
    [postMessage],
  )

  return {
    calculateFuelAssemblies,
    calculateControlRods,
    calculateRibs,
    isReady,
    error,
    terminate,
  }
}
