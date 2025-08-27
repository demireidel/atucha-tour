"use client"

import { useMemo } from "react"
import { useControls } from "leva"

interface RoadsAndMarkingsProps {
  exploded?: boolean
}

export function RoadsAndMarkings({ exploded = false }: RoadsAndMarkingsProps) {
  const { roadWidth, mainRoadLength, parkingSpots, markingOpacity } = useControls("Roads & Markings", {
    roadWidth: { value: 6, min: 4, max: 12, step: 0.5 },
    mainRoadLength: { value: 200, min: 100, max: 300, step: 10 },
    parkingSpots: { value: 20, min: 10, max: 40, step: 2 },
    markingOpacity: { value: 0.8, min: 0.3, max: 1, step: 0.1 },
  })

  const explodeOffset = exploded ? [0, 1, 0] : [0, 0, 0]

  // Generate road network
  const roads = useMemo(() => {
    return [
      // Main access road
      {
        position: [0, -0.45, 30],
        scale: [roadWidth, 0.1, mainRoadLength],
        rotation: [0, 0, 0],
      },
      // Loop around reactor
      {
        position: [0, -0.45, 0],
        scale: [60, 0.1, roadWidth],
        rotation: [0, 0, 0],
      },
      // Access to turbine hall
      {
        position: [25, -0.45, 0],
        scale: [roadWidth, 0.1, 40],
        rotation: [0, Math.PI / 2, 0],
      },
      // Service road to switchyard
      {
        position: [-40, -0.45, 0],
        scale: [roadWidth, 0.1, 60],
        rotation: [0, Math.PI / 4, 0],
      },
    ]
  }, [roadWidth, mainRoadLength])

  // Generate parking areas
  const parkingAreas = useMemo(() => {
    const areas = []
    const spotsPerRow = Math.ceil(Math.sqrt(parkingSpots))

    for (let i = 0; i < parkingSpots; i++) {
      const row = Math.floor(i / spotsPerRow)
      const col = i % spotsPerRow
      const x = 60 + col * 3
      const z = 20 + row * 6

      areas.push({
        position: [x, -0.4, z],
        scale: [2.5, 0.05, 5],
        rotation: [0, 0, 0],
      })
    }
    return areas
  }, [parkingSpots])

  // Generate road markings
  const markings = useMemo(() => {
    const markings = []

    // Center line for main road
    for (let i = 0; i < 20; i++) {
      const z = -mainRoadLength / 2 + (i / 19) * mainRoadLength
      markings.push({
        position: [0, -0.35, z + 30],
        scale: [0.2, 0.02, 3],
        color: "#FFFFFF",
      })
    }

    // Parking space lines
    parkingAreas.forEach((area, index) => {
      markings.push({
        position: [area.position[0], -0.35, area.position[2]],
        scale: [2.7, 0.02, 0.1],
        color: "#FFFF00",
      })
    })

    return markings
  }, [mainRoadLength, parkingAreas])

  return (
    <group position={explodeOffset}>
      {/* Road surfaces */}
      {roads.map((road, index) => (
        <mesh
          key={`road-${index}`}
          position={road.position as [number, number, number]}
          scale={road.scale as [number, number, number]}
          rotation={road.rotation as [number, number, number]}
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#2D2D2D" roughness={0.7} metalness={0} />
        </mesh>
      ))}

      {/* Parking areas */}
      {parkingAreas.map((area, index) => (
        <mesh
          key={`parking-${index}`}
          position={area.position as [number, number, number]}
          scale={area.scale as [number, number, number]}
          rotation={area.rotation as [number, number, number]}
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#404040" roughness={0.8} metalness={0} />
        </mesh>
      ))}

      {/* Road markings */}
      {markings.map((marking, index) => (
        <mesh
          key={`marking-${index}`}
          position={marking.position as [number, number, number]}
          scale={marking.scale as [number, number, number]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={marking.color}
            transparent
            opacity={markingOpacity}
            emissive={marking.color}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Site grid (subtle) */}
      <mesh position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[250, 250, 25, 25]} />
        <meshStandardMaterial
          color="#3A4A2A"
          roughness={0.9}
          metalness={0}
          wireframe={false}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
