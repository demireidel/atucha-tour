"use client"

import { useRef } from "react"
import { OrthographicCamera } from "@react-three/drei"
import type * as THREE from "three"
import { useAppStore } from "@/lib/store"

export function MinimapRenderer() {
  const orthoCameraRef = useRef<THREE.OrthographicCamera>(null)
  const { minimap } = useAppStore()

  // Simple orthographic camera for potential future minimap 3D rendering
  // For now, just provide the camera without complex WebGL operations
  if (!minimap) return null

  return (
    <OrthographicCamera
      ref={orthoCameraRef}
      makeDefault={false}
      left={-100}
      right={100}
      top={100}
      bottom={-100}
      near={0.1}
      far={200}
      position={[0, 100, 0]}
    />
  )
}
