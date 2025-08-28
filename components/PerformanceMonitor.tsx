"use client"

import { useState } from "react"
import { useFrame } from "@react-three/fiber"

interface PerformanceStats {
  fps: number
  frameTime: number
  memoryUsage: number
  triangles: number
}

export function PerformanceMonitor({ onStatsUpdate }: { onStatsUpdate?: (stats: PerformanceStats) => void }) {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    triangles: 0,
  })

  let frameCount = 0
  let lastTime = Date.now()

  useFrame((state, deltaTime) => {
    frameCount++
    const now = Date.now()

    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime))
      const frameTime = deltaTime * 1000

      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

      // Get triangle count from renderer info
      const triangles = state.gl.info.render.triangles

      const newStats = {
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        memoryUsage: Math.round((memoryUsage / 1024 / 1024) * 100) / 100, // MB
        triangles,
      }

      setStats(newStats)
      onStatsUpdate?.(newStats)

      frameCount = 0
      lastTime = now
    }
  })

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>FPS: {stats.fps}</div>
      <div>Frame: {stats.frameTime}ms</div>
      <div>Memory: {stats.memoryUsage}MB</div>
      <div>Triangles: {stats.triangles.toLocaleString()}</div>
    </div>
  )
}
