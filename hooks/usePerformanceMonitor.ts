"use client"

import { useRef, useState, useEffect } from "react"

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  triangles: number
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    triangles: 0,
  })

  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const renderTimes = useRef<number[]>([])
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const updateMetrics = () => {
      frameCount.current++
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime.current

      // Calculate FPS every second
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / deltaTime)
        frameCount.current = 0
        lastTime.current = currentTime

        // Get memory usage if available
        const memoryInfo = (performance as any).memory
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0

        // Calculate average render time
        const avgRenderTime =
          renderTimes.current.length > 0
            ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
            : 0

        setMetrics({
          fps,
          memoryUsage,
          renderTime: avgRenderTime,
          triangles: 0, // Will be updated by 3D components if needed
        })

        // Reset render times array
        renderTimes.current = []
      }

      // Track render time for this frame
      const frameStartTime = performance.now()
      requestAnimationFrame(() => {
        const frameEndTime = performance.now()
        renderTimes.current.push(frameEndTime - frameStartTime)

        // Keep only last 60 measurements
        if (renderTimes.current.length > 60) {
          renderTimes.current.shift()
        }
      })

      animationFrameId.current = requestAnimationFrame(updateMetrics)
    }

    animationFrameId.current = requestAnimationFrame(updateMetrics)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return metrics
}
