"use client"

import { useRef, useEffect, useCallback } from "react"

interface WebWorkerMessage {
  id: string
  type: string
  data: any
}

interface WebWorkerResponse {
  id: string
  result: any
  error?: string
}

export function useWebWorker(workerScript: string) {
  const workerRef = useRef<Worker | null>(null)
  const callbacksRef = useRef<Map<string, (result: any, error?: string) => void>>(new Map())

  useEffect(() => {
    if (typeof Worker !== "undefined") {
      workerRef.current = new Worker(workerScript)

      workerRef.current.onmessage = (event: MessageEvent<WebWorkerResponse>) => {
        const { id, result, error } = event.data
        const callback = callbacksRef.current.get(id)
        if (callback) {
          callback(result, error)
          callbacksRef.current.delete(id)
        }
      }

      workerRef.current.onerror = (error) => {
        console.error("[v0] Web Worker error:", error)
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
      callbacksRef.current.clear()
    }
  }, [workerScript])

  const postMessage = useCallback((type: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Web Worker not available"))
        return
      }

      const id = Math.random().toString(36).substr(2, 9)

      callbacksRef.current.set(id, (result, error) => {
        if (error) {
          reject(new Error(error))
        } else {
          resolve(result)
        }
      })

      const message: WebWorkerMessage = { id, type, data }
      workerRef.current.postMessage(message)
    })
  }, [])

  return { postMessage, isSupported: typeof Worker !== "undefined" }
}

export function useGeometryWorker() {
  const { postMessage, isSupported } = useWebWorker("/workers/geometryWorker.js")

  const calculateFuelAssemblyPositions = useCallback(
    async (count: number) => {
      if (!isSupported) {
        const positions = []
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / 13)
          const col = i % 13
          const x = (col - 6) * 1.2
          const z = (row - 6) * 1.2
          const distance = Math.sqrt(x * x + z * z)
          if (distance <= 7) {
            positions.push([x, 0, z])
          }
        }
        return positions
      }

      return postMessage("calculateFuelAssemblyPositions", { count })
    },
    [postMessage, isSupported],
  )

  const calculateCoolingLoopPositions = useCallback(
    async (loopCount: number, radius: number) => {
      if (!isSupported) {
        const positions = []
        for (let i = 0; i < loopCount; i++) {
          const angle = (i / loopCount) * Math.PI * 2
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          positions.push([x, 0, z])
        }
        return positions
      }

      return postMessage("calculateCoolingLoopPositions", { loopCount, radius })
    },
    [postMessage, isSupported],
  )

  return {
    calculateFuelAssemblyPositions,
    calculateCoolingLoopPositions,
    isSupported,
  }
}
