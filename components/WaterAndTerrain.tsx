"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface WaterAndTerrainProps {
  exploded?: boolean
}

export function WaterAndTerrain({ exploded = false }: WaterAndTerrainProps) {
  const waterRef = useRef<THREE.Mesh>(null)

  const siteScale = 1
  const riverWidth = 50
  const flowSpeed = 0.5
  const waveHeight = 0.2
  const terrainDetail = 20

  const explodeOffset = exploded ? [0, -5, 0] : [0, 0, 0]

  // Animate water flow
  useFrame((state) => {
    if (waterRef.current) {
      const time = state.clock.getElapsedTime()
      waterRef.current.position.x = Math.sin(time * flowSpeed) * 0.5
      waterRef.current.rotation.z = Math.sin(time * flowSpeed * 0.5) * 0.02
    }
  })

  // Generate terrain with some variation
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(300 * siteScale, 300 * siteScale, terrainDetail, terrainDetail)

    const vertices = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < vertices.length; i += 3) {
      // Add subtle height variation
      vertices[i + 2] = Math.sin(vertices[i] * 0.01) * Math.cos(vertices[i + 1] * 0.01) * 2
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    return geometry
  }, [siteScale, terrainDetail])

  // Generate intake/outfall channels
  const channels = useMemo(() => {
    return [
      { position: [-20, -0.3, -100], rotation: [0, 0.3, 0] },
      { position: [20, -0.3, -100], rotation: [0, -0.3, 0] },
    ]
  }, [])

  return (
    <group position={explodeOffset}>
      {/* Main terrain */}
      <mesh geometry={terrainGeometry} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#4A5D23" roughness={0.8} metalness={0} />
      </mesh>

      {/* Main river */}
      <mesh ref={waterRef} position={[0, -0.5, -120]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300 * siteScale, riverWidth]} />
        <meshPhysicalMaterial
          color="#1e40af"
          roughness={0.1}
          metalness={0}
          transmission={0.9}
          thickness={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Intake/Outfall channels */}
      {channels.map((channel, index) => (
        <mesh
          key={`channel-${index}`}
          position={channel.position as [number, number, number]}
          rotation={[-Math.PI / 2, channel.rotation[1], channel.rotation[2]]}
          receiveShadow
        >
          <planeGeometry args={[40, 8]} />
          <meshPhysicalMaterial
            color="#2563eb"
            roughness={0.1}
            metalness={0}
            transmission={0.8}
            thickness={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Shoreline detail */}
      <mesh position={[0, -0.8, -95]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300 * siteScale, 10]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} metalness={0} />
      </mesh>

      {/* Simple vegetation instances */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const distance = 80 + Math.random() * 60
        const x = Math.cos(angle) * distance
        const z = Math.sin(angle) * distance
        const height = 2 + Math.random() * 4

        return (
          <mesh key={`vegetation-${i}`} position={[x, height / 2 - 1, z]} castShadow>
            <cylinderGeometry args={[0.5, 1, height, 6]} />
            <meshStandardMaterial color="#22543D" roughness={0.9} metalness={0} />
          </mesh>
        )
      })}
    </group>
  )
}
