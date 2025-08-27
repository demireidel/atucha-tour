"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

interface ParticleEffectsProps {
  quality: "low" | "medium" | "high"
}

export function ParticleEffects({ quality }: ParticleEffectsProps) {
  const steamRef = useRef<THREE.Points>(null)
  const dustRef = useRef<THREE.Points>(null)

  const steamParticles = useMemo(() => {
    const count = quality === "high" ? 1000 : quality === "medium" ? 500 : 200
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Steam from cooling towers and vents
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      velocities[i * 3] = (Math.random() - 0.5) * 0.1
      velocities[i * 3 + 1] = Math.random() * 0.5 + 0.2
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }

    return { positions, velocities, count }
  }, [quality])

  useFrame((state, delta) => {
    if (steamRef.current) {
      const positions = steamRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < steamParticles.count; i++) {
        positions[i * 3 + 1] += steamParticles.velocities[i * 3 + 1] * delta

        // Reset particles that go too high
        if (positions[i * 3 + 1] > 50) {
          positions[i * 3 + 1] = 0
        }
      }

      steamRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  if (quality === "low") return null

  return (
    <group>
      <points ref={steamRef} position={[0, 30, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={steamParticles.count}
            array={steamParticles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={2} color="#FFFFFF" transparent opacity={0.6} sizeAttenuation />
      </points>

      <points ref={dustRef} position={[50, 5, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={quality === "high" ? 300 : 150}
            array={
              new Float32Array(
                Array.from({ length: (quality === "high" ? 300 : 150) * 3 }, () => (Math.random() - 0.5) * 100),
              )
            }
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.8} color="#D4A574" transparent opacity={0.4} sizeAttenuation />
      </points>
    </group>
  )
}
