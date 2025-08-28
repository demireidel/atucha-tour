"use client"

import { useRef, useMemo, memo, useEffect, useState } from "react"
import type * as THREE from "three"
import { useWebWorker } from "@/hooks/useWebWorker"
import { concreteMaterial, steelMaterial, stainlesssteelMaterial } from "@/lib/materials"

const REACTOR_CONFIG = {
  diameter: 24,
  height: 30,
  domeHeight: 12,
  ribCount: 16,
  ringCount: 6,
  fuelAssemblies: 157,
  controlRods: 37,
} as const

interface OptimizedReactorBuildingProps {
  exploded?: boolean
  quality?: "low" | "medium" | "high"
}

export const OptimizedReactorBuilding = memo(function OptimizedReactorBuilding({
  exploded = false,
  quality = "high",
}: OptimizedReactorBuildingProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [fuelPositions, setFuelPositions] = useState<number[][]>([])
  const [controlRodPositions, setControlRodPositions] = useState<number[][]>([])
  const [ribs, setRibs] = useState<Array<{ position: number[]; rotation: number[] }>>([])

  const { postMessage, isReady } = useWebWorker("/workers/geometryWorker.js")

  useEffect(() => {
    if (!isReady) return

    // Calcular posiciones de fuel assemblies en worker
    postMessage(
      {
        type: "CALCULATE_FUEL_ASSEMBLIES",
        data: { count: REACTOR_CONFIG.fuelAssemblies, spacing: 1.2 },
      },
      (data) => setFuelPositions(data.positions),
    )

    // Calcular posiciones de control rods en worker
    postMessage(
      {
        type: "CALCULATE_CONTROL_RODS",
        data: { rodCount: REACTOR_CONFIG.controlRods },
      },
      (data) => setControlRodPositions(data.positions),
    )

    // Calcular ribs en worker
    postMessage(
      {
        type: "CALCULATE_RIBS",
        data: { ribCount: REACTOR_CONFIG.ribCount, diameter: REACTOR_CONFIG.diameter },
      },
      (data) => setRibs(data.ribs),
    )
  }, [isReady, postMessage])

  const explodeOffset = useMemo(() => (exploded ? [0, 10, 0] : [0, 0, 0]), [exploded])

  const detailLevel = useMemo(() => {
    switch (quality) {
      case "low":
        return { sensors: 8, pipes: 2, details: false }
      case "medium":
        return { sensors: 16, pipes: 4, details: true }
      case "high":
        return { sensors: 32, pipes: 8, details: true }
      default:
        return { sensors: 16, pipes: 4, details: true }
    }
  }, [quality])

  const rings = useMemo(() => {
    const rings = []
    for (let i = 1; i < REACTOR_CONFIG.ringCount; i++) {
      const y = (i / REACTOR_CONFIG.ringCount) * REACTOR_CONFIG.height
      rings.push({ position: [0, y, 0], scale: [REACTOR_CONFIG.diameter + 0.5, 0.3, REACTOR_CONFIG.diameter + 0.5] })
    }
    return rings
  }, [])

  if (!isReady || fuelPositions.length === 0) {
    return (
      <group position={explodeOffset}>
        {/* Simplified placeholder while worker calculates */}
        <mesh position={[0, REACTOR_CONFIG.height / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry
            args={[REACTOR_CONFIG.diameter / 2, REACTOR_CONFIG.diameter / 2, REACTOR_CONFIG.height, 16]}
          />
          <primitive object={concreteMaterial} />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={meshRef} position={explodeOffset}>
      {/* Main cylindrical containment */}
      <mesh position={[0, REACTOR_CONFIG.height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[
            REACTOR_CONFIG.diameter / 2,
            REACTOR_CONFIG.diameter / 2,
            REACTOR_CONFIG.height,
            quality === "low" ? 16 : 32,
          ]}
        />
        <primitive object={concreteMaterial} />
      </mesh>

      {/* Hemispherical dome */}
      <mesh position={[0, REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight / 2, 0]} castShadow>
        <sphereGeometry
          args={[
            REACTOR_CONFIG.diameter / 2,
            quality === "low" ? 16 : 32,
            quality === "low" ? 8 : 16,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2,
          ]}
        />
        <primitive object={concreteMaterial} />
      </mesh>

      {/* Vertical ribs - calculados en worker */}
      {ribs.map((rib, index) => (
        <mesh
          key={`rib-${index}`}
          position={rib.position as [number, number, number]}
          rotation={rib.rotation as [number, number, number]}
          castShadow
        >
          <boxGeometry args={[0.5, REACTOR_CONFIG.height, 0.8]} />
          <primitive object={steelMaterial} />
        </mesh>
      ))}

      {/* Ring seams */}
      {rings.map((ring, index) => (
        <mesh
          key={`ring-${index}`}
          position={ring.position as [number, number, number]}
          scale={ring.scale as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.5, 0.5, 0.3, quality === "low" ? 16 : 32]} />
          <primitive object={steelMaterial} />
        </mesh>
      ))}

      <instancedMesh args={[undefined, undefined, fuelPositions.length]} castShadow>
        <boxGeometry args={[0.8, REACTOR_CONFIG.height - 8, 0.8]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.9} />
        {fuelPositions.map((position, index) => (
          <group key={`fuel-${index}`} position={[position[0], REACTOR_CONFIG.height / 2, position[2]]} />
        ))}
      </instancedMesh>

      {/* Control rod drive mechanisms - calculados en worker */}
      {quality !== "low" && (
        <group>
          {controlRodPositions.map((position, index) => (
            <mesh
              key={`control-rod-${index}`}
              position={[position[0], REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight + 2, position[2]]}
              castShadow
            >
              <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
              <primitive object={stainlesssteelMaterial} />
            </mesh>
          ))}
        </group>
      )}

      {/* Detailed systems only in medium/high quality */}
      {detailLevel.details && (
        <>
          {/* Reactor pressure vessel (internal) */}
          <mesh position={[0, REACTOR_CONFIG.height / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[
                REACTOR_CONFIG.diameter / 2 - 2,
                REACTOR_CONFIG.diameter / 2 - 2,
                REACTOR_CONFIG.height - 4,
                quality === "medium" ? 16 : 32,
              ]}
            />
            <primitive object={stainlesssteelMaterial} />
          </mesh>

          {/* Reactor coolant pumps */}
          <group>
            {Array.from({ length: detailLevel.pipes }, (_, i) => {
              const angle = (i / detailLevel.pipes) * Math.PI * 2
              const radius = REACTOR_CONFIG.diameter / 2 + 8
              const x = Math.cos(angle) * radius
              const z = Math.sin(angle) * radius
              return (
                <group key={`rcp-${i}`}>
                  <mesh position={[x, 6, z]} castShadow receiveShadow>
                    <cylinderGeometry args={[2.5, 2.5, 8, 16]} />
                    <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.9} />
                  </mesh>
                </group>
              )
            })}
          </group>
        </>
      )}

      {/* Instrumentation - cantidad basada en calidad */}
      <group>
        {Array.from({ length: detailLevel.sensors }, (_, i) => {
          const angle = (i / detailLevel.sensors) * Math.PI * 2
          const x = Math.cos(angle) * (REACTOR_CONFIG.diameter / 2 + 0.5)
          const z = Math.sin(angle) * (REACTOR_CONFIG.diameter / 2 + 0.5)
          return (
            <mesh key={`sensor-${i}`} position={[x, REACTOR_CONFIG.height / 2, z]} castShadow>
              <boxGeometry args={[0.15, 0.15, 0.15]} />
              <meshStandardMaterial color="#10B981" roughness={0.4} metalness={0.7} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
})
