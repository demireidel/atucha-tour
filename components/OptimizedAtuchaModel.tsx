"use client"

import { memo, useMemo } from "react"
import { LazyReactorBuilding, LazyTurbineHall, LazyAuxiliaryBlocks } from "./LazyAtuchaModel"

interface OptimizedAtuchaModelProps {
  exploded?: boolean
  quality?: "low" | "medium" | "high"
}

export const OptimizedAtuchaModel = memo(function OptimizedAtuchaModel({
  exploded = false,
  quality = "high",
}: OptimizedAtuchaModelProps) {
  const renderSettings = useMemo(() => {
    switch (quality) {
      case "low":
        return {
          showReactor: true,
          showTurbineHall: false,
          showAuxiliary: false,
          maxDetails: 50,
        }
      case "medium":
        return {
          showReactor: true,
          showTurbineHall: true,
          showAuxiliary: false,
          maxDetails: 100,
        }
      case "high":
      default:
        return {
          showReactor: true,
          showTurbineHall: true,
          showAuxiliary: true,
          maxDetails: 200,
        }
    }
  }, [quality])

  return (
    <group>
      {renderSettings.showReactor && <LazyReactorBuilding exploded={exploded} quality={quality} />}

      {renderSettings.showTurbineHall && <LazyTurbineHall exploded={exploded} quality={quality} />}

      {renderSettings.showAuxiliary && <LazyAuxiliaryBlocks exploded={exploded} quality={quality} />}
    </group>
  )
})
