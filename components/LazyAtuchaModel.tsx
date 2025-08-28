"use client"

import { Suspense, useState, useEffect } from "react"
import { Html, useProgress } from "@react-three/drei"
import { ReactorBuilding, TurbineHall, AuxiliaryBlocks } from "./AtuchaModel"

function LoadingProgress() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="bg-black/80 text-white px-4 py-2 rounded-lg">
        <div className="text-sm mb-2">Cargando modelo 3D...</div>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs mt-1 text-center">{Math.round(progress)}%</div>
      </div>
    </Html>
  )
}

interface LazyReactorBuildingProps {
  exploded?: boolean
  quality?: "low" | "medium" | "high"
}

export function LazyReactorBuilding({ exploded = false, quality = "high" }: LazyReactorBuildingProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return (
      <Html center>
        <div className="text-white text-sm">Preparando reactor...</div>
      </Html>
    )
  }

  return (
    <Suspense fallback={<LoadingProgress />}>
      <ReactorBuilding exploded={exploded} />
    </Suspense>
  )
}

interface LazyTurbineHallProps {
  exploded?: boolean
  quality?: "low" | "medium" | "high"
}

export function LazyTurbineHall({ exploded = false, quality = "high" }: LazyTurbineHallProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return (
      <Html center>
        <div className="text-white text-sm">Preparando sala de turbinas...</div>
      </Html>
    )
  }

  return (
    <Suspense fallback={<LoadingProgress />}>
      <TurbineHall exploded={exploded} />
    </Suspense>
  )
}

interface LazyAuxiliaryBlocksProps {
  exploded?: boolean
  quality?: "low" | "medium" | "high"
}

export function LazyAuxiliaryBlocks({ exploded = false, quality = "high" }: LazyAuxiliaryBlocksProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return (
      <Html center>
        <div className="text-white text-sm">Preparando edificios auxiliares...</div>
      </Html>
    )
  }

  return (
    <Suspense fallback={<LoadingProgress />}>
      <AuxiliaryBlocks exploded={exploded} />
    </Suspense>
  )
}
