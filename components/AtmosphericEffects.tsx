"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

interface AtmosphericEffectsProps {
  quality: "low" | "medium" | "high"
}

export function AtmosphericEffects({ quality }: AtmosphericEffectsProps) {
  const fogRef = useRef<THREE.Fog>(null)

  const fogSettings = useMemo(() => {
    switch (quality) {
      case "low":
        return { near: 100, far: 400, color: "#87CEEB" }
      case "medium":
        return { near: 150, far: 500, color: "#B0C4DE" }
      case "high":
        return { near: 200, far: 600, color: "#E6F3FF" }
      default:
        return { near: 150, far: 500, color: "#B0C4DE" }
    }
  }, [quality])

  useFrame((state) => {
    if (fogRef.current) {
      const time = state.clock.elapsedTime * 0.1
      const fogDensity = 0.8 + Math.sin(time) * 0.2
      fogRef.current.far = fogSettings.far * fogDensity
    }
  })

  return (
    <>
      <fog ref={fogRef} attach="fog" args={[fogSettings.color, fogSettings.near, fogSettings.far]} />

      {quality !== "low" && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={quality === "high" ? 2000 : 1000}
              array={
                new Float32Array(
                  Array.from({ length: (quality === "high" ? 2000 : 1000) * 3 }, () => (Math.random() - 0.5) * 400),
                )
              }
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.5} color="#FFFFFF" transparent opacity={0.3} sizeAttenuation />
        </points>
      )}
    </>
  )
}
