"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { waterMaterial } from "@/lib/materials"
import * as THREE from "three"

interface EnhancedWaterProps {
  exploded?: boolean
  quality: "low" | "medium" | "high"
}

export function EnhancedWater({ exploded = false, quality }: EnhancedWaterProps) {
  const waterRef = useRef<THREE.Mesh>(null)
  const flowRef = useRef<THREE.Mesh>(null)

  const explodeOffset = exploded ? [0, 0, 20] : [0, 0, 0]

  const waterGeometry = useMemo(() => {
    const segments = quality === "high" ? 128 : quality === "medium" ? 64 : 32
    return [200, 200, segments, segments] as const
  }, [quality])

  useFrame((state) => {
    if (waterRef.current) {
      const time = state.clock.elapsedTime
      waterRef.current.rotation.z = Math.sin(time * 0.1) * 0.01

      // Update water material for wave animation
      if (waterRef.current.material instanceof THREE.MeshPhysicalMaterial) {
        waterRef.current.material.normalScale?.set(1 + Math.sin(time * 0.5) * 0.2, 1 + Math.cos(time * 0.3) * 0.2)
      }
    }

    if (flowRef.current) {
      const time = state.clock.elapsedTime
      flowRef.current.position.x = Math.sin(time * 0.2) * 0.5
    }
  })

  return (
    <group position={explodeOffset}>
      <mesh ref={waterRef} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={waterGeometry} />
        <primitive object={waterMaterial} />
      </mesh>

      <mesh ref={flowRef} position={[-80, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 100, 32, 32]} />
        <meshPhysicalMaterial
          color="#1e40af"
          roughness={0.02}
          metalness={0}
          transmission={0.9}
          thickness={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh position={[80, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 100, 32, 32]} />
        <meshPhysicalMaterial
          color="#2563eb"
          roughness={0.03}
          metalness={0}
          transmission={0.85}
          thickness={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      {quality !== "low" && (
        <points position={[0, 0, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={quality === "high" ? 500 : 250}
              array={
                new Float32Array(
                  Array.from({ length: (quality === "high" ? 500 : 250) * 3 }, (_, i) => {
                    if (i % 3 === 1) return Math.random() * 2 - 1 // Y position
                    return (Math.random() - 0.5) * 200 // X and Z positions
                  }),
                )
              }
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={1} color="#FFFFFF" transparent opacity={0.6} sizeAttenuation />
        </points>
      )}
    </group>
  )
}
