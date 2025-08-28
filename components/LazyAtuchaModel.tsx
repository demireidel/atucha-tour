"use client"

import { Suspense, lazy, memo } from "react"
import { Html, useProgress } from "@react-three/drei"

// Lazy load the optimized components
const OptimizedReactorBuilding = lazy(() =>
  import("./OptimizedAtuchaModel").then((module) => ({ default: module.OptimizedReactorBuilding })),
)

const ReactorBuilding = lazy(() => import("./AtuchaModel").then((module) => ({ default: module.ReactorBuilding })))

const TurbineHall = lazy(() => import("./AtuchaModel").then((module) => ({ default: module.TurbineHall })))

const AuxiliaryBlocks = lazy(() => import("./AtuchaModel").then((module) => ({ default: module.AuxiliaryBlocks })))

// Loading component for 3D assets
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-black/80 rounded-lg text-white">
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm">Cargando modelo 3D... {Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

interface LazyReactorBuildingProps {
  exploded?: boolean
  quality?: "low" | "medium" | "high"
  useOptimized?: boolean
}

export const LazyReactorBuilding = memo(function LazyReactorBuilding({
  exploded = false,
  quality = "high",
  useOptimized = false,
}: LazyReactorBuildingProps) {
  const Component = useOptimized ? OptimizedReactorBuilding : ReactorBuilding

  return (
    <Suspense fallback={<Loader />}>
      <Component exploded={exploded} quality={quality} />
    </Suspense>
  )
})

interface LazyTurbineHallProps {
  exploded?: boolean
}

export const LazyTurbineHall = memo(function LazyTurbineHall({ exploded = false }: LazyTurbineHallProps) {
  return (
    <Suspense fallback={<Loader />}>
      <TurbineHall exploded={exploded} />
    </Suspense>
  )
})

interface LazyAuxiliaryBlocksProps {
  exploded?: boolean
}

export const LazyAuxiliaryBlocks = memo(function LazyAuxiliaryBlocks({ exploded = false }: LazyAuxiliaryBlocksProps) {
  return (
    <Suspense fallback={<Loader />}>
      <AuxiliaryBlocks exploded={exploded} />
    </Suspense>
  )
})
