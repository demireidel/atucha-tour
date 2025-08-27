"use client"

import { useAppStore } from "@/lib/store"

export function Overlays() {
  const { cinematicMode, overlays, isRecording } = useAppStore()

  if (!cinematicMode) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Letterbox */}
      {overlays.letterbox && (
        <>
          <div className="absolute top-0 left-0 right-0 h-16 bg-black" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black" />
        </>
      )}

      {/* Rule of Thirds */}
      {overlays.ruleOfThirds && (
        <div className="absolute inset-0">
          {/* Vertical lines */}
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
          {/* Horizontal lines */}
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
        </div>
      )}

      {/* Safe Frame */}
      {overlays.safeFrame && (
        <div className="absolute inset-0 m-12">
          <div className="w-full h-full border border-yellow-400/50 border-dashed" />
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">REC</span>
        </div>
      )}
    </div>
  )
}
