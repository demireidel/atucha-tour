"use client"

import { useRef, useMemo } from "react"
import type * as THREE from "three"
import {
  concreteMaterial,
  steelMaterial,
  stainlesssteelMaterial,
  paintedSteelMaterial,
  insulationMaterial,
  glassMaterial,
  electricalMaterial,
} from "@/lib/materials"

interface ReactorBuildingProps {
  exploded?: boolean
}

export function ReactorBuilding({ exploded = false }: ReactorBuildingProps) {
  const meshRef = useRef<THREE.Group>(null)

  const reactorDiameter = 24
  const reactorHeight = 30
  const domeHeight = 12
  const ribCount = 16
  const ringCount = 6

  const explodeOffset = exploded ? [0, 10, 0] : [0, 0, 0]

  // Generate vertical ribs
  const ribs = useMemo(() => {
    const ribs = []

    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2
      const x = Math.cos(angle) * (reactorDiameter / 2 + 0.3)
      const z = Math.sin(angle) * (reactorDiameter / 2 + 0.3)
      ribs.push({ position: [x, reactorHeight / 2, z], rotation: [0, angle, 0] })
    }
    return ribs
  }, [reactorDiameter, reactorHeight, ribCount])

  // Generate ring seams
  const rings = useMemo(() => {
    const rings = []
    for (let i = 1; i < ringCount; i++) {
      const y = (i / ringCount) * reactorHeight
      rings.push({ position: [0, y, 0], scale: [reactorDiameter + 0.5, 0.3, reactorDiameter + 0.5] })
    }
    return rings
  }, [reactorDiameter, reactorHeight, ringCount])

  return (
    <group ref={meshRef} position={explodeOffset}>
      {/* Main cylindrical containment */}
      <mesh position={[0, reactorHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[reactorDiameter / 2, reactorDiameter / 2, reactorHeight, 32]} />
        <primitive object={concreteMaterial} />
      </mesh>

      {/* Hemispherical dome */}
      <mesh position={[0, reactorHeight + domeHeight / 2, 0]} castShadow>
        <sphereGeometry args={[reactorDiameter / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={concreteMaterial} />
      </mesh>

      {/* Vertical ribs */}
      {ribs.map((rib, index) => (
        <mesh
          key={`rib-${index}`}
          position={rib.position as [number, number, number]}
          rotation={rib.rotation as [number, number, number]}
          castShadow
        >
          <boxGeometry args={[0.5, reactorHeight, 0.8]} />
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
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <primitive object={steelMaterial} />
        </mesh>
      ))}

      {/* Reactor pressure vessel (internal) */}
      <mesh position={[0, reactorHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[reactorDiameter / 2 - 2, reactorDiameter / 2 - 2, reactorHeight - 4, 32]} />
        <primitive object={stainlesssteelMaterial} />
      </mesh>

      {/* Control rod drive mechanisms */}
      <group>
        {Array.from({ length: 37 }, (_, i) => {
          const row = Math.floor(i / 6)
          const col = i % 6
          const x = (col - 2.5) * 2.5
          const z = (row - 3) * 2.5
          return (
            <mesh key={`control-rod-${i}`} position={[x, reactorHeight + domeHeight + 2, z]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
              <primitive object={stainlesssteelMaterial} />
            </mesh>
          )
        })}
      </group>

      {/* Detailed cooling system with multiple loops */}
      <group>
        {Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2
          const radius = reactorDiameter / 2 + 3
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          return (
            <group key={`cooling-loop-${i}`}>
              {/* Primary coolant pipe */}
              <mesh position={[x, 8, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.8, 0.8, 15, 16]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Secondary coolant pipe */}
              <mesh position={[x, 12, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 12, 16]} />
                <primitive object={paintedSteelMaterial} />
              </mesh>

              {/* Pipe insulation */}
              <mesh position={[x, 8, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[1.0, 1.0, 15, 16]} />
                <primitive object={insulationMaterial} />
              </mesh>

              {/* Valve assemblies */}
              <mesh position={[x - 6, 8, z]} castShadow>
                <boxGeometry args={[2, 2, 2]} />
                <primitive object={paintedSteelMaterial} />
              </mesh>

              {/* Pump housing */}
              <mesh position={[x - 10, 4, z]} castShadow>
                <cylinderGeometry args={[1.5, 1.5, 3, 16]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Pipe supports with detailed brackets */}
              {Array.from({ length: 5 }, (_, j) => (
                <mesh key={`support-${j}`} position={[x - 3 + j * 3, 2, z]} castShadow>
                  <boxGeometry args={[0.5, 4, 1]} />
                  <primitive object={steelMaterial} />
                </mesh>
              ))}
            </group>
          )
        })}
      </group>

      {/* Enhanced steam generator buildings with detailed internals */}
      <group>
        {Array.from({ length: 2 }, (_, i) => {
          const x = i === 0 ? -18 : 18
          return (
            <group key={`steam-generator-complex-${i}`}>
              {/* Main steam generator vessel */}
              <mesh position={[x, 6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[3, 3, 12, 16]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Steam generator internals */}
              <mesh position={[x, 6, 0]} castShadow>
                <cylinderGeometry args={[2.5, 2.5, 11, 16]} />
                <primitive object={stainlesssteelMaterial} />
              </mesh>

              {/* Steam outlet pipes */}
              <mesh position={[x, 12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.8, 0.8, 8, 16]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Feedwater inlet */}
              <mesh position={[x, 2, 3]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 6, 16]} />
                <primitive object={paintedSteelMaterial} />
              </mesh>

              {/* Steam generator platform */}
              <mesh position={[x, 12.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[4, 4, 0.5, 16]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Access ladders */}
              <mesh position={[x + 3.5, 6, 0]} castShadow>
                <boxGeometry args={[0.3, 12, 0.8]} />
                <primitive object={steelMaterial} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Detailed control room with windows and equipment */}
      <group>
        <mesh position={[0, 8, -reactorDiameter / 2 - 8]} castShadow receiveShadow>
          <boxGeometry args={[12, 6, 8]} />
          <primitive object={concreteMaterial} />
        </mesh>

        {/* Control room windows */}
        <mesh position={[0, 9, -reactorDiameter / 2 - 4.1]} castShadow>
          <boxGeometry args={[10, 2, 0.2]} />
          <primitive object={glassMaterial} />
        </mesh>

        {/* Control panels inside */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh key={`control-panel-${i}`} position={[(i - 1) * 3, 6, -reactorDiameter / 2 - 6]} castShadow>
            <boxGeometry args={[2, 2, 1]} />
            <primitive object={electricalMaterial} />
          </mesh>
        ))}

        {/* Ventilation system */}
        <mesh position={[0, 11.5, -reactorDiameter / 2 - 8]} castShadow>
          <boxGeometry args={[8, 1, 4]} />
          <primitive object={steelMaterial} />
        </mesh>
      </group>

      {/* Enhanced external stairways with railings */}
      <group>
        {Array.from({ length: 3 }, (_, i) => {
          const angle = (i / 3) * Math.PI * 2
          const x = Math.cos(angle) * (reactorDiameter / 2 + 1)
          const z = Math.sin(angle) * (reactorDiameter / 2 + 1)
          return (
            <group key={`stairway-complex-${i}`}>
              {/* Main stairway structure */}
              <mesh position={[x, reactorHeight / 2, z]} castShadow>
                <boxGeometry args={[1, reactorHeight, 0.3]} />
                <meshStandardMaterial color="#4A5568" roughness={0.9} metalness={0.8} />
              </mesh>

              {/* Stair railings */}
              <mesh position={[x + 0.7, reactorHeight / 2, z]} castShadow>
                <boxGeometry args={[0.1, reactorHeight, 0.3]} />
                <meshStandardMaterial color="#2D3748" roughness={0.8} metalness={0.7} />
              </mesh>
              <mesh position={[x - 0.7, reactorHeight / 2, z]} castShadow>
                <boxGeometry args={[0.1, reactorHeight, 0.3]} />
                <meshStandardMaterial color="#2D3748" roughness={0.8} metalness={0.7} />
              </mesh>

              {/* Landing platforms */}
              {Array.from({ length: 4 }, (_, j) => (
                <mesh key={`landing-${j}`} position={[x, 5 + j * 6, z]} castShadow receiveShadow>
                  <boxGeometry args={[2, 0.3, 2]} />
                  <meshStandardMaterial color="#4B5563" roughness={0.7} metalness={0.6} />
                </mesh>
              ))}
            </group>
          )
        })}
      </group>

      {/* Containment spray system */}
      <group>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const x = Math.cos(angle) * (reactorDiameter / 2 - 2)
          const z = Math.sin(angle) * (reactorDiameter / 2 - 2)
          return (
            <mesh key={`spray-nozzle-${i}`} position={[x, reactorHeight - 3, z]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
              <meshStandardMaterial color="#E53E3E" roughness={0.4} metalness={0.7} />
            </mesh>
          )
        })}
      </group>

      {/* Emergency diesel generators building */}
      <mesh position={[-30, 4, -15]} castShadow receiveShadow>
        <boxGeometry args={[15, 8, 10]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Fuel handling building */}
      <mesh position={[25, 6, -20]} castShadow receiveShadow>
        <boxGeometry args={[12, 12, 15]} />
        <meshStandardMaterial color="#A1A1AA" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Reactor pressure vessel internals with fuel assemblies */}
      <group>
        {Array.from({ length: 157 }, (_, i) => {
          const row = Math.floor(i / 13)
          const col = i % 13
          const x = (col - 6) * 1.2
          const z = (row - 6) * 1.2
          const distance = Math.sqrt(x * x + z * z)
          if (distance > 7) return null
          return (
            <mesh key={`fuel-assembly-${i}`} position={[x, reactorHeight / 2, z]} castShadow>
              <boxGeometry args={[0.8, reactorHeight - 8, 0.8]} />
              <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.9} />
            </mesh>
          )
        })}
      </group>

      {/* Reactor vessel head with detailed penetrations */}
      <mesh position={[0, reactorHeight + 2, 0]} castShadow>
        <cylinderGeometry args={[reactorDiameter / 2 - 1.5, reactorDiameter / 2 - 1.5, 4, 32]} />
        <meshStandardMaterial color="#2D3748" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Control rod guide tubes */}
      <group>
        {Array.from({ length: 37 }, (_, i) => {
          const row = Math.floor(i / 6)
          const col = i % 6
          const x = (col - 2.5) * 2.5
          const z = (row - 3) * 2.5
          return (
            <mesh key={`guide-tube-${i}`} position={[x, reactorHeight / 2, z]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, reactorHeight - 4, 8]} />
              <meshStandardMaterial color="#4A5568" roughness={0.3} metalness={0.8} />
            </mesh>
          )
        })}
      </group>

      {/* Reactor coolant pumps with detailed impellers */}
      <group>
        {Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2
          const radius = reactorDiameter / 2 + 8
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          return (
            <group key={`rcp-detailed-${i}`}>
              {/* Main pump casing */}
              <mesh position={[x, 6, z]} castShadow receiveShadow>
                <cylinderGeometry args={[2.5, 2.5, 8, 16]} />
                <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.9} />
              </mesh>

              {/* Pump motor */}
              <mesh position={[x, 12, z]} castShadow>
                <cylinderGeometry args={[1.8, 1.8, 4, 16]} />
                <meshStandardMaterial color="#2D3748" roughness={0.4} metalness={0.8} />
              </mesh>

              {/* Pump impeller housing */}
              <mesh position={[x, 4, z]} castShadow>
                <cylinderGeometry args={[2, 2, 2, 16]} />
                <meshStandardMaterial color="#4A5568" roughness={0.2} metalness={0.9} />
              </mesh>

              {/* Suction and discharge piping */}
              <mesh position={[x - 4, 6, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[1.2, 1.2, 8, 16]} />
                <meshStandardMaterial color="#2B6CB0" roughness={0.3} metalness={0.9} />
              </mesh>

              {/* Pump foundation and vibration dampeners */}
              <mesh position={[x, 1, z]} receiveShadow>
                <boxGeometry args={[6, 2, 6]} />
                <meshStandardMaterial color="#1A202C" roughness={0.8} metalness={0.5} />
              </mesh>

              {/* Instrumentation and sensors */}
              {Array.from({ length: 8 }, (_, j) => {
                const sensorAngle = (j / 8) * Math.PI * 2
                const sensorX = x + Math.cos(sensorAngle) * 3
                const sensorZ = z + Math.sin(sensorAngle) * 3
                return (
                  <mesh key={`sensor-${j}`} position={[sensorX, 6, sensorZ]} castShadow>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshStandardMaterial color="#E53E3E" roughness={0.4} metalness={0.7} />
                  </mesh>
                )
              })}
            </group>
          )
        })}
      </group>

      {/* Pressurizer with detailed internals */}
      <group position={[reactorDiameter / 2 + 15, 0, 0]}>
        {/* Main pressurizer vessel */}
        <mesh position={[0, 12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 20, 16]} />
          <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Pressurizer heaters */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const x = Math.cos(angle) * 2
          const z = Math.sin(angle) * 2
          return (
            <mesh key={`heater-${i}`} position={[x, 8, z]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 8, 8]} />
              <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.8} />
            </mesh>
          )
        })}

        {/* Pressurizer spray nozzles */}
        <mesh position={[0, 20, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
          <meshStandardMaterial color="#2B6CB0" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Relief valve piping */}
        <mesh position={[0, 22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 10, 16]} />
          <meshStandardMaterial color="#4A5568" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* Emergency core cooling system */}
      <group>
        {Array.from({ length: 2 }, (_, i) => {
          const x = i === 0 ? -25 : 25
          return (
            <group key={`eccs-${i}`}>
              {/* Accumulator tanks */}
              <mesh position={[x, 8, -25]} castShadow receiveShadow>
                <cylinderGeometry args={[3, 3, 12, 16]} />
                <meshStandardMaterial color="#059669" roughness={0.4} metalness={0.7} />
              </mesh>

              {/* High pressure injection pumps */}
              <mesh position={[x, 4, -30]} castShadow receiveShadow>
                <boxGeometry args={[4, 3, 2]} />
                <meshStandardMaterial color="#DC2626" roughness={0.5} metalness={0.6} />
              </mesh>

              {/* Low pressure injection pumps */}
              <mesh position={[x, 4, -35]} castShadow receiveShadow>
                <boxGeometry args={[5, 4, 3]} />
                <meshStandardMaterial color="#2563EB" roughness={0.5} metalness={0.6} />
              </mesh>

              {/* ECCS piping network */}
              <mesh position={[x, 6, -25]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 20, 16]} />
                <meshStandardMaterial color="#059669" roughness={0.3} metalness={0.9} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Detailed instrumentation and control systems */}
      <group>
        {/* Neutron flux detectors */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2
          const x = Math.cos(angle) * (reactorDiameter / 2 + 0.5)
          const z = Math.sin(angle) * (reactorDiameter / 2 + 0.5)
          return (
            <mesh key={`neutron-detector-${i}`} position={[x, reactorHeight / 2, z]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.3} metalness={0.8} />
            </mesh>
          )
        })}

        {/* Temperature sensors */}
        {Array.from({ length: 32 }, (_, i) => {
          const angle = (i / 32) * Math.PI * 2
          const radius = reactorDiameter / 2 - 1
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          const y = 5 + (i % 4) * 5
          return (
            <mesh key={`temp-sensor-${i}`} position={[x, y, z]} castShadow>
              <boxGeometry args={[0.15, 0.15, 0.15]} />
              <meshStandardMaterial color="#10B981" roughness={0.4} metalness={0.7} />
            </mesh>
          )
        })}

        {/* Pressure transmitters */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const x = Math.cos(angle) * (reactorDiameter / 2 + 2)
          const z = Math.sin(angle) * (reactorDiameter / 2 + 2)
          return (
            <mesh key={`pressure-transmitter-${i}`} position={[x, 8, z]} castShadow>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="#8B5CF6" roughness={0.4} metalness={0.7} />
            </mesh>
          )
        })}
      </group>

      {/* Reactor building crane with maximum detail */}
      <group>
        {/* Main crane structure */}
        <mesh position={[0, reactorHeight + domeHeight - 2, 0]} castShadow>
          <cylinderGeometry args={[reactorDiameter / 2 - 2, reactorDiameter / 2 - 2, 2, 32]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Crane trolley system */}
        <mesh position={[8, reactorHeight + domeHeight - 3, 0]} castShadow>
          <boxGeometry args={[4, 1.5, 2]} />
          <meshStandardMaterial color="#1F2937" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Crane hook and rigging */}
        <mesh position={[8, reactorHeight + domeHeight - 8, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 8]} />
          <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Crane cables and pulleys */}
        {Array.from({ length: 4 }, (_, i) => (
          <mesh
            key={`crane-cable-${i}`}
            position={[8 + (i - 1.5) * 0.5, reactorHeight + domeHeight - 5.5, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.03, 0.03, 5, 8]} />
            <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Auxiliary systems with extreme detail */}
      <group>
        {/* Component cooling water system */}
        <mesh position={[-35, 4, 10]} castShadow receiveShadow>
          <boxGeometry args={[8, 6, 12]} />
          <meshStandardMaterial color="#0EA5E9" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Service water system */}
        <mesh position={[35, 4, 10]} castShadow receiveShadow>
          <boxGeometry args={[8, 6, 12]} />
          <meshStandardMaterial color="#06B6D4" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Waste processing building */}
        <mesh position={[-40, 6, -30]} castShadow receiveShadow>
          <boxGeometry args={[15, 12, 20]} />
          <meshStandardMaterial color="#7C2D12" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Hot machine shop */}
        <mesh position={[40, 5, -30]} castShadow receiveShadow>
          <boxGeometry args={[12, 10, 15]} />
          <meshStandardMaterial color="#92400E" roughness={0.6} metalness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

interface TurbineHallProps {
  exploded?: boolean
}

export function TurbineHall({ exploded = false }: TurbineHallProps) {
  const hallLength = 80
  const hallWidth = 25
  const hallHeight = 18
  const skylightCount = 8
  const roofPitch = 0.1

  const explodeOffset = exploded ? [15, 5, 0] : [0, 0, 0]

  // Generate skylight strips
  const skylights = useMemo(() => {
    const skylights = []
    for (let i = 0; i < skylightCount; i++) {
      const x = (i / (skylightCount - 1) - 0.5) * (hallLength - 5)
      skylights.push({ position: [x, hallHeight + roofPitch * 2, 0] })
    }
    return skylights
  }, [hallLength, hallHeight, skylightCount, roofPitch])

  return (
    <group position={[50, ...explodeOffset]}>
      {/* Main hall structure */}
      <mesh position={[0, hallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[hallLength, hallHeight, hallWidth]} />
        <primitive object={steelMaterial} />
      </mesh>

      {/* Gabled roof */}
      <mesh position={[0, hallHeight + (roofPitch * hallWidth) / 2, 0]} castShadow>
        <boxGeometry args={[hallLength, roofPitch * hallWidth, hallWidth * 1.1]} />
        <primitive object={steelMaterial} />
      </mesh>

      {/* Skylight strips */}
      {skylights.map((skylight, index) => (
        <mesh key={`skylight-${index}`} position={skylight.position as [number, number, number]} castShadow>
          <boxGeometry args={[3, 0.5, hallWidth * 1.2]} />
          <primitive object={glassMaterial} />
        </mesh>
      ))}

      {/* Side ventilation grilles */}
      <mesh position={[0, hallHeight * 0.8, hallWidth / 2 + 0.1]} castShadow>
        <boxGeometry args={[hallLength * 0.8, 2, 0.2]} />
        <meshStandardMaterial color="#6B7280" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, hallHeight * 0.8, -hallWidth / 2 - 0.1]} castShadow>
        <boxGeometry args={[hallLength * 0.8, 2, 0.2]} />
        <meshStandardMaterial color="#6B7280" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Enhanced turbine generators with detailed components */}
      <group>
        {Array.from({ length: 3 }, (_, i) => {
          const x = (i - 1) * 25
          return (
            <group key={`turbine-complex-${i}`}>
              {/* High pressure turbine */}
              <mesh position={[x - 8, 4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2, 2, 8, 16]} />
                <primitive object={stainlesssteelMaterial} />
              </mesh>

              {/* Intermediate pressure turbine */}
              <mesh position={[x, 4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2.5, 2.5, 10, 16]} />
                <primitive object={stainlesssteelMaterial} />
              </mesh>

              {/* Low pressure turbines (2 units) */}
              <mesh position={[x + 10, 4, -3]} castShadow receiveShadow>
                <cylinderGeometry args={[3, 3, 12, 16]} />
                <primitive object={stainlesssteelMaterial} />
              </mesh>
              <mesh position={[x + 10, 4, 3]} castShadow receiveShadow>
                <cylinderGeometry args={[3, 3, 12, 16]} />
                <primitive object={stainlesssteelMaterial} />
              </mesh>

              {/* Main generator */}
              <mesh position={[x + 20, 4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2.5, 2.5, 8, 16]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Turbine shaft */}
              <mesh position={[x + 6, 4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 36, 16]} />
                <primitive object={stainlesssteelMaterial} />
              </mesh>

              {/* Steam inlet manifolds */}
              <mesh position={[x - 8, 8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[1.2, 1.2, 6, 16]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Condenser */}
              <mesh position={[x + 15, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[20, 2, 12]} />
                <primitive object={steelMaterial} />
              </mesh>

              {/* Cooling water pipes */}
              <mesh position={[x + 15, 0, 8]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.8, 0.8, 25, 16]} />
                <primitive object={paintedSteelMaterial} />
              </mesh>
              <mesh position={[x + 15, 0, -8]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.8, 0.8, 25, 16]} />
                <primitive object={paintedSteelMaterial} />
              </mesh>

              {/* Turbine foundation with detailed anchor bolts */}
              <mesh position={[x, 0.5, 0]} receiveShadow>
                <boxGeometry args={[35, 1, 8]} />
                <meshStandardMaterial color="#1A202C" roughness={0.8} metalness={0.5} />
              </mesh>

              {/* Vibration monitoring sensors */}
              {Array.from({ length: 6 }, (_, j) => (
                <mesh key={`sensor-${j}`} position={[x - 15 + j * 6, 5, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.3, 0.3]} />
                  <meshStandardMaterial color="#E53E3E" roughness={0.4} metalness={0.7} />
                </mesh>
              ))}
            </group>
          )
        })}
      </group>

      {/* Enhanced overhead crane with detailed trolley system */}
      <group>
        {/* Main crane bridge */}
        <mesh position={[0, hallHeight - 2, 0]} castShadow>
          <boxGeometry args={[hallLength - 5, 1.5, 2]} />
          <meshStandardMaterial color="#E53E3E" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Crane rails */}
        <mesh position={[0, hallHeight - 2, hallWidth / 2 - 1]} castShadow>
          <boxGeometry args={[hallLength - 5, 0.5, 0.5]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, hallHeight - 2, -hallWidth / 2 + 1]} castShadow>
          <boxGeometry args={[hallLength - 5, 0.5, 0.5]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Crane trolley */}
        <mesh position={[10, hallHeight - 3, 0]} castShadow>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Crane hook */}
        <mesh position={[10, hallHeight - 8, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Crane cables */}
        <mesh position={[10, hallHeight - 5.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 5, 8]} />
          <meshStandardMaterial color="#2D3748" roughness={0.8} metalness={0.7} />
        </mesh>
      </group>

      {/* Detailed electrical and control systems */}
      <group>
        {/* Main electrical switchgear */}
        {Array.from({ length: 8 }, (_, i) => {
          const x = (i - 3.5) * 8
          return (
            <group key={`switchgear-${i}`}>
              <mesh position={[x, 3, hallWidth / 2 - 2]} castShadow receiveShadow>
                <boxGeometry args={[2, 6, 1.5]} />
                <meshStandardMaterial color="#2B6CB0" roughness={0.6} metalness={0.4} />
              </mesh>

              {/* Control indicators */}
              <mesh position={[x, 4, hallWidth / 2 - 1.2]} castShadow>
                <boxGeometry args={[1.5, 2, 0.1]} />
                <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.8} />
              </mesh>
            </group>
          )
        })}

        {/* Cable trays */}
        <mesh position={[0, hallHeight - 4, hallWidth / 2 - 3]} castShadow>
          <boxGeometry args={[hallLength - 10, 0.3, 1]} />
          <meshStandardMaterial color="#4B5563" roughness={0.7} metalness={0.6} />
        </mesh>
        <mesh position={[0, hallHeight - 4, -hallWidth / 2 + 3]} castShadow>
          <boxGeometry args={[hallLength - 10, 0.3, 1]} />
          <meshStandardMaterial color="#4B5563" roughness={0.7} metalness={0.6} />
        </mesh>

        {/* Transformer units */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh key={`transformer-${i}`} position={[(i - 1) * 25, 2, -hallWidth / 2 + 5]} castShadow receiveShadow>
            <boxGeometry args={[4, 4, 3]} />
            <meshStandardMaterial color="#718096" roughness={0.5} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Ventilation and HVAC systems */}
      <group>
        {/* Main ventilation ducts */}
        <mesh position={[0, hallHeight - 1, 0]} castShadow>
          <boxGeometry args={[hallLength - 10, 1, 2]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Exhaust fans */}
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={`fan-${i}`} position={[(i - 1.5) * 15, hallHeight + 1, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.5, 16]} />
            <meshStandardMaterial color="#4B5563" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

interface AuxiliaryBlocksProps {
  exploded?: boolean
}

export function AuxiliaryBlocks({ exploded = false }: AuxiliaryBlocksProps) {
  const blockCount = 6
  const blockSpread = 40
  const minHeight = 8
  const maxHeight = 20

  const explodeOffset = exploded ? [0, 0, 15] : [0, 0, 0]

  // Generate auxiliary building blocks
  const blocks = useMemo(() => {
    const blocks = []
    for (let i = 0; i < blockCount; i++) {
      const angle = (i / blockCount) * Math.PI * 2
      const distance = 25 + Math.random() * blockSpread
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance
      const width = 8 + Math.random() * 12
      const depth = 6 + Math.random() * 10
      const height = minHeight + Math.random() * (maxHeight - minHeight)

      blocks.push({
        position: [x, height / 2, z],
        scale: [width, height, depth],
        rotation: [0, (Math.random() * Math.PI) / 4, 0],
      })
    }
    return blocks
  }, [blockCount, blockSpread, minHeight, maxHeight])

  return (
    <group position={explodeOffset}>
      {blocks.map((block, index) => (
        <group key={`aux-block-${index}`}>
          {/* Main building block */}
          <mesh
            position={block.position as [number, number, number]}
            scale={block.scale as [number, number, number]}
            rotation={block.rotation as [number, number, number]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <primitive object={concreteMaterial} />
          </mesh>

          {/* Decorative ladder */}
          <mesh position={[block.position[0] + block.scale[0] / 2, block.position[1], block.position[2]]} castShadow>
            <boxGeometry args={[0.3, block.scale[1], 0.8]} />
            <primitive object={steelMaterial} />
          </mesh>

          {/* HVAC units on roof */}
          <mesh
            position={[block.position[0], block.position[1] + block.scale[1] / 2 + 0.5, block.position[2]]}
            castShadow
          >
            <boxGeometry args={[block.scale[0] * 0.3, 1, block.scale[2] * 0.3]} />
            <primitive object={steelMaterial} />
          </mesh>

          {/* Windows */}
          {Array.from({ length: Math.floor(block.scale[1] / 3) }, (_, i) => (
            <mesh
              key={`window-${i}`}
              position={[
                block.position[0] + block.scale[0] / 2 + 0.05,
                block.position[1] - block.scale[1] / 2 + (i + 1) * 3,
                block.position[2],
              ]}
              castShadow
            >
              <boxGeometry args={[0.1, 1.5, 2]} />
              <primitive object={glassMaterial} />
            </mesh>
          ))}

          {/* Entrance door */}
          <mesh
            position={[
              block.position[0] - block.scale[0] / 2 - 0.05,
              block.position[1] - block.scale[1] / 2 + 1,
              block.position[2],
            ]}
            castShadow
          >
            <boxGeometry args={[0.1, 2, 1.5]} />
            <primitive object={steelMaterial} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
