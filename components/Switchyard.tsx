"use client"

import { useMemo } from "react"
import * as THREE from "three"

interface SwitchyardProps {
  exploded?: boolean
}

export function Switchyard({ exploded = false }: SwitchyardProps) {
  const yardWidth = 60
  const yardDepth = 40
  const transformerCount = 8
  const pylonCount = 12
  const fenceHeight = 3

  const explodeOffset = exploded ? [0, 0, -20] : [0, 0, 0]

  // Generate transformer positions
  const transformers = useMemo(() => {
    const transformers = []
    const rows = Math.ceil(Math.sqrt(transformerCount))
    const cols = Math.ceil(transformerCount / rows)

    for (let i = 0; i < transformerCount; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      const x = (col / (cols - 1) - 0.5) * (yardWidth - 10)
      const z = (row / (rows - 1) - 0.5) * (yardDepth - 10)

      transformers.push({
        position: [x, 2, z],
        scale: [3 + Math.random(), 4 + Math.random(), 2 + Math.random() * 0.5],
        rotation: [0, (Math.random() * Math.PI) / 2, 0],
      })
    }
    return transformers
  }, [transformerCount, yardWidth, yardDepth])

  // Generate pylon positions
  const pylons = useMemo(() => {
    const pylons = []
    for (let i = 0; i < pylonCount; i++) {
      const angle = (i / pylonCount) * Math.PI * 2
      const distance = Math.min(yardWidth, yardDepth) / 2 - 5
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance

      pylons.push({
        position: [x, 8, z],
        height: 12 + Math.random() * 4,
      })
    }
    return pylons
  }, [pylonCount, yardWidth, yardDepth])

  // Generate fence perimeter
  const fenceSections = useMemo(() => {
    const sections = []
    const perimeter = [
      { start: [-yardWidth / 2, 0, -yardDepth / 2], end: [yardWidth / 2, 0, -yardDepth / 2] },
      { start: [yardWidth / 2, 0, -yardDepth / 2], end: [yardWidth / 2, 0, yardDepth / 2] },
      { start: [yardWidth / 2, 0, yardDepth / 2], end: [-yardWidth / 2, 0, yardDepth / 2] },
      { start: [-yardWidth / 2, 0, yardDepth / 2], end: [-yardWidth / 2, 0, -yardDepth / 2] },
    ]

    perimeter.forEach((section, index) => {
      const length = new THREE.Vector3()
        .subVectors(new THREE.Vector3(...section.end), new THREE.Vector3(...section.start))
        .length()

      const center = new THREE.Vector3()
        .addVectors(new THREE.Vector3(...section.start), new THREE.Vector3(...section.end))
        .multiplyScalar(0.5)

      const angle = Math.atan2(section.end[2] - section.start[2], section.end[0] - section.start[0])

      sections.push({
        position: [center.x, fenceHeight / 2, center.z],
        scale: [length, fenceHeight, 0.1],
        rotation: [0, angle, 0],
      })
    })

    return sections
  }, [yardWidth, yardDepth, fenceHeight])

  return (
    <group position={[-80, ...explodeOffset]}>
      {/* Ground pad */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[yardWidth, 0.2, yardDepth]} />
        <meshStandardMaterial color="#374151" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Transformers */}
      {transformers.map((transformer, index) => (
        <mesh
          key={`transformer-${index}`}
          position={transformer.position as [number, number, number]}
          scale={transformer.scale as [number, number, number]}
          rotation={transformer.rotation as [number, number, number]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1F2937" roughness={0.6} metalness={0.8} />
        </mesh>
      ))}

      {/* Pylons */}
      {pylons.map((pylon, index) => (
        <group key={`pylon-${index}`}>
          {/* Main pole */}
          <mesh position={[pylon.position[0], pylon.height / 2, pylon.position[2]]} castShadow>
            <cylinderGeometry args={[0.3, 0.5, pylon.height, 8]} />
            <meshStandardMaterial color="#6B7280" roughness={0.7} metalness={0.9} />
          </mesh>

          {/* Cross arms */}
          <mesh position={[pylon.position[0], pylon.height * 0.8, pylon.position[2]]} castShadow>
            <boxGeometry args={[4, 0.3, 0.3]} />
            <meshStandardMaterial color="#6B7280" roughness={0.7} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Fence */}
      {fenceSections.map((section, index) => (
        <mesh
          key={`fence-${index}`}
          position={section.position as [number, number, number]}
          scale={section.scale as [number, number, number]}
          rotation={section.rotation as [number, number, number]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.8} metalness={0.3} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}
