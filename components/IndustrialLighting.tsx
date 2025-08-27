"use client"

import { useMemo } from "react"

interface IndustrialLightingProps {
  quality: "low" | "medium" | "high"
}

export function IndustrialLighting({ quality }: IndustrialLightingProps) {
  const lightPositions = useMemo(() => {
    const positions = []

    // Perimeter flood lights
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      positions.push({
        position: [Math.cos(angle) * 80, 25, Math.sin(angle) * 80],
        color: "#FFFFFF",
        intensity: 2,
        type: "flood",
      })
    }

    // Warning beacons on tall structures
    positions.push(
      { position: [0, 45, 0], color: "#FF0000", intensity: 1, type: "beacon" },
      { position: [50, 25, 0], color: "#FF0000", intensity: 1, type: "beacon" },
    )

    // Security spotlights
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      positions.push({
        position: [Math.cos(angle) * 60, 15, Math.sin(angle) * 60],
        color: "#FFFFCC",
        intensity: 1.5,
        type: "spot",
      })
    }

    return positions
  }, [])

  if (quality === "low") return null

  return (
    <group>
      {lightPositions.map((light, index) => {
        if (light.type === "flood") {
          return (
            <spotLight
              key={`flood-${index}`}
              position={light.position as [number, number, number]}
              color={light.color}
              intensity={light.intensity}
              angle={Math.PI / 3}
              penumbra={0.5}
              distance={100}
              castShadow={quality === "high"}
              shadow-mapSize-width={quality === "high" ? 1024 : 512}
              shadow-mapSize-height={quality === "high" ? 1024 : 512}
            />
          )
        }

        if (light.type === "beacon") {
          return (
            <pointLight
              key={`beacon-${index}`}
              position={light.position as [number, number, number]}
              color={light.color}
              intensity={light.intensity}
              distance={50}
            />
          )
        }

        if (light.type === "spot") {
          return (
            <spotLight
              key={`spot-${index}`}
              position={light.position as [number, number, number]}
              color={light.color}
              intensity={light.intensity}
              angle={Math.PI / 4}
              penumbra={0.3}
              distance={80}
              castShadow={quality === "high"}
            />
          )
        }

        return null
      })}

      {quality === "high" && (
        <>
          <rectAreaLight position={[0, 20, 0]} width={40} height={20} color="#FFFFFF" intensity={0.5} />
          <rectAreaLight position={[50, 15, 0]} width={60} height={15} color="#FFFFFF" intensity={0.3} />
        </>
      )}
    </group>
  )
}
