"use client"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { camera } = useAppStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw site outline (simplified top-down view)
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

    // Draw reactor building (circle)
    ctx.fillStyle = "#6366f1"
    ctx.beginPath()
    ctx.arc(canvas.width * 0.4, canvas.height * 0.5, 25, 0, Math.PI * 2)
    ctx.fill()

    // Draw turbine hall (rectangle)
    ctx.fillStyle = "#8b5cf6"
    ctx.fillRect(canvas.width * 0.6, canvas.height * 0.4, 40, 20)

    // Draw water (blue area)
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(10, canvas.height * 0.7, canvas.width - 20, canvas.height * 0.3 - 10)

    // Draw grid lines
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 0.5
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }
  }, [])

  return (
    <Card className="w-48 h-48 p-2 bg-custom-panel/90 backdrop-blur-sm border-border/50">
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded border border-border/30"
          width={192}
          height={192}
          data-minimap-canvas
        />

        {/* Camera position indicator */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-brand rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-8 h-8 border border-brand/50 rounded transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </Card>
  )
}
