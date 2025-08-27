"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PerformanceMonitor } from "@/lib/quality"
import { X, Activity, Cpu, HardDrive } from "lucide-react"

interface PerformanceHUDProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PerformanceHUD({ open, onOpenChange }: PerformanceHUDProps) {
  const [fps, setFps] = useState(60)
  const [memory, setMemory] = useState({ used: 0, total: 0 })
  const [monitor] = useState(() => new PerformanceMonitor())

  useEffect(() => {
    const unsubscribe = monitor.onFpsUpdate(setFps)

    // Memory monitoring
    const updateMemory = () => {
      if ("memory" in performance) {
        const mem = (performance as any).memory
        setMemory({
          used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
          total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        })
      }
    }

    updateMemory()
    const memoryInterval = setInterval(updateMemory, 2000)

    return () => {
      unsubscribe()
      clearInterval(memoryInterval)
    }
  }, [monitor])

  if (!open) return null

  const fpsColor = fps >= 50 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"
  const memoryPercent = memory.total > 0 ? (memory.used / memory.total) * 100 : 0

  return (
    <div className="absolute top-4 left-4 w-64 z-50">
      <Card className="bg-black/80 backdrop-blur-sm border-border/50 text-white">
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <h3 className="font-mono text-sm font-semibold">Performance</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="p-3 space-y-3 font-mono text-xs">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>FPS</span>
            </div>
            <span className={fpsColor}>{fps}</span>
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-3 w-3" />
              <span>Memory</span>
            </div>
            <span>
              {memory.used}MB / {memory.total}MB
            </span>
          </div>

          {/* Memory Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(memoryPercent, 100)}%` }}
            />
          </div>

          {/* CPU Cores */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-3 w-3" />
              <span>Cores</span>
            </div>
            <span>{navigator.hardwareConcurrency || "Unknown"}</span>
          </div>

          {/* Device Memory */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-3 w-3" />
              <span>Device RAM</span>
            </div>
            <span>{(navigator as any).deviceMemory || "Unknown"}GB</span>
          </div>

          {/* Warmup Status */}
          {!monitor.isWarmedUp() && <div className="text-yellow-400 text-center">Warming up...</div>}
        </div>
      </Card>
    </div>
  )
}
