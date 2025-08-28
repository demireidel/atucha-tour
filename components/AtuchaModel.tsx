"use client"

import { useRef, useMemo, memo } from "react"
import type * as THREE from "three"
import {
  concreteMaterial,
  steelMaterial,
  stainlesssteelMaterial,
  paintedSteelMaterial,
  glassMaterial,
} from "@/lib/materials"

const REACTOR_CONFIG = {
  diameter: 24,
  height: 30,
  domeHeight: 12,
  ribCount: 16,
  ringCount: 6,
  fuelAssemblies: 157,
  controlRods: 37,
} as const

const TURBINE_CONFIG = {
  hallLength: 80,
  hallWidth: 25,
  hallHeight: 18,
  skylightCount: 8,
  roofPitch: 0.1,
  turbineCount: 3,
} as const

const AUX_CONFIG = {
  blockCount: 6,
  blockSpread: 40,
  minHeight: 8,
  maxHeight: 20,
} as const

interface ReactorBuildingProps {
  exploded?: boolean
}

export const ReactorBuilding = memo(function ReactorBuilding({ exploded = false }: ReactorBuildingProps) {
  const meshRef = useRef<THREE.Group>(null)

  const explodeOffset = useMemo(() => (exploded ? [0, 10, 0] : [0, 0, 0]), [exploded])

  const ribs = useMemo(() => {
    const ribs = []
    for (let i = 0; i < REACTOR_CONFIG.ribCount; i++) {
      const angle = (i / REACTOR_CONFIG.ribCount) * Math.PI * 2
      const x = Math.cos(angle) * (REACTOR_CONFIG.diameter / 2 + 0.3)
      const z = Math.sin(angle) * (REACTOR_CONFIG.diameter / 2 + 0.3)
      ribs.push({ position: [x, REACTOR_CONFIG.height / 2, z], rotation: [0, angle, 0] })
    }
    return ribs
  }, [])

  const rings = useMemo(() => {
    const rings = []
    for (let i = 1; i < REACTOR_CONFIG.ringCount; i++) {
      const y = (i / REACTOR_CONFIG.ringCount) * REACTOR_CONFIG.height
      rings.push({ position: [0, y, 0], scale: [REACTOR_CONFIG.diameter + 0.5, 0.3, REACTOR_CONFIG.diameter + 0.5] })
    }
    return rings
  }, [])

  const fuelAssemblyPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < REACTOR_CONFIG.fuelAssemblies; i++) {
      const row = Math.floor(i / 13)
      const col = i % 13
      const x = (col - 6) * 1.2
      const z = (row - 6) * 1.2
      const distance = Math.sqrt(x * x + z * z)
      if (distance <= 7) {
        positions.push([x, REACTOR_CONFIG.height / 2, z])
      }
    }
    return positions
  }, [])

  const controlRodPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < REACTOR_CONFIG.controlRods; i++) {
      const row = Math.floor(i / 6)
      const col = i % 6
      const x = (col - 2.5) * 2.5
      const z = (row - 3) * 2.5
      positions.push([x, REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight + 2, z])
    }
    return positions
  }, [])

  return (
    <group ref={meshRef} position={explodeOffset}>
      {/* Main cylindrical containment */}
      <mesh position={[0, REACTOR_CONFIG.height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[REACTOR_CONFIG.diameter / 2, REACTOR_CONFIG.diameter / 2, REACTOR_CONFIG.height, 32]}
        />
        <primitive object={concreteMaterial} />
      </mesh>

      {/* Hemispherical dome */}
      <mesh position={[0, REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight / 2, 0]} castShadow>
        <sphereGeometry args={[REACTOR_CONFIG.diameter / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <primitive object={steelMaterial} />
        </mesh>
      ))}

      <instancedMesh args={[undefined, undefined, fuelAssemblyPositions.length]} castShadow>
        <boxGeometry args={[0.8, REACTOR_CONFIG.height - 8, 0.8]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.9} />
        {fuelAssemblyPositions.map((position, index) => (
          <group key={`fuel-${index}`} position={position as [number, number, number]} />
        ))}
      </instancedMesh>

      {/* Control rod drive mechanisms */}
      <group>
        {controlRodPositions.map((position, index) => (
          <mesh key={`control-rod-${index}`} position={position as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
            <primitive object={stainlesssteelMaterial} />
          </mesh>
        ))}
      </group>

      {/* Reactor pressure vessel (internal) */}
      <mesh position={[0, REACTOR_CONFIG.height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[REACTOR_CONFIG.diameter / 2 - 2, REACTOR_CONFIG.diameter / 2 - 2, REACTOR_CONFIG.height - 4, 32]}
        />
        <primitive object={stainlesssteelMaterial} />
      </mesh>

      {/* Control rod guide tubes */}
      <group>
        {Array.from({ length: REACTOR_CONFIG.controlRods }, (_, i) => {
          const row = Math.floor(i / 6)
          const col = i % 6
          const x = (col - 2.5) * 2.5
          const z = (row - 3) * 2.5
          return (
            <mesh key={`guide-tube-${i}`} position={[x, REACTOR_CONFIG.height / 2, z]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, REACTOR_CONFIG.height - 4, 8]} />
              <meshStandardMaterial color="#4A5568" roughness={0.3} metalness={0.8} />
            </mesh>
          )
        })}
      </group>

      {/* Reactor coolant pumps with detailed impellers */}
      <group>
        {Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2
          const radius = REACTOR_CONFIG.diameter / 2 + 8
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
      <group position={[REACTOR_CONFIG.diameter / 2 + 15, 0, 0]}>
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
          const x = Math.cos(angle) * (REACTOR_CONFIG.diameter / 2 + 0.5)
          const z = Math.sin(angle) * (REACTOR_CONFIG.diameter / 2 + 0.5)
          return (
            <mesh key={`neutron-detector-${i}`} position={[x, REACTOR_CONFIG.height / 2, z]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.3} metalness={0.8} />
            </mesh>
          )
        })}

        {/* Temperature sensors */}
        {Array.from({ length: 32 }, (_, i) => {
          const angle = (i / 32) * Math.PI * 2
          const radius = REACTOR_CONFIG.diameter / 2 - 1
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
          const x = Math.cos(angle) * (REACTOR_CONFIG.diameter / 2 + 2)
          const z = Math.sin(angle) * (REACTOR_CONFIG.diameter / 2 + 2)
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
        <mesh position={[0, REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight - 2, 0]} castShadow>
          <cylinderGeometry args={[REACTOR_CONFIG.diameter / 2 - 2, REACTOR_CONFIG.diameter / 2 - 2, 2, 32]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Crane trolley system */}
        <mesh position={[8, REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight - 3, 0]} castShadow>
          <boxGeometry args={[4, 1.5, 2]} />
          <meshStandardMaterial color="#1F2937" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Crane hook and rigging */}
        <mesh position={[8, REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight - 8, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 8]} />
          <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Crane cables and pulleys */}
        {Array.from({ length: 4 }, (_, i) => (
          <mesh
            key={`crane-cable-${i}`}
            position={[8 + (i - 1.5) * 0.5, REACTOR_CONFIG.height + REACTOR_CONFIG.domeHeight - 5.5, 0]}
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
})

interface TurbineHallProps {
  exploded?: boolean
}

export const TurbineHall = memo(function TurbineHall({ exploded = false }: TurbineHallProps) {
  const explodeOffset = useMemo(() => (exploded ? [15, 5, 0] : [0, 0, 0]), [exploded])

  const skylights = useMemo(() => {
    const skylights = []
    for (let i = 0; i < TURBINE_CONFIG.skylightCount; i++) {
      const x = (i / (TURBINE_CONFIG.skylightCount - 1) - 0.5) * (TURBINE_CONFIG.hallLength - 5)
      skylights.push({ position: [x, TURBINE_CONFIG.hallHeight + TURBINE_CONFIG.roofPitch * 2, 0] })
    }
    return skylights
  }, [])

  return (
    <group position={[50, ...explodeOffset]}>
      {/* Main hall structure */}
      <mesh position={[0, TURBINE_CONFIG.hallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[TURBINE_CONFIG.hallLength, TURBINE_CONFIG.hallHeight, TURBINE_CONFIG.hallWidth]} />
        <primitive object={steelMaterial} />
      </mesh>

      {/* Gabled roof */}
      <mesh
        position={[0, TURBINE_CONFIG.hallHeight + (TURBINE_CONFIG.roofPitch * TURBINE_CONFIG.hallWidth) / 2, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            TURBINE_CONFIG.hallLength,
            TURBINE_CONFIG.roofPitch * TURBINE_CONFIG.hallWidth,
            TURBINE_CONFIG.hallWidth * 1.1,
          ]}
        />
        <primitive object={steelMaterial} />
      </mesh>

      {/* Skylight strips */}
      {skylights.map((skylight, index) => (
        <mesh key={`skylight-${index}`} position={skylight.position as [number, number, number]} castShadow>
          <boxGeometry args={[3, 0.5, TURBINE_CONFIG.hallWidth * 1.2]} />
          <primitive object={glassMaterial} />
        </mesh>
      ))}

      {/* Side ventilation grilles */}
      <mesh position={[0, TURBINE_CONFIG.hallHeight * 0.8, TURBINE_CONFIG.hallWidth / 2 + 0.1]} castShadow>
        <boxGeometry args={[TURBINE_CONFIG.hallLength * 0.8, 2, 0.2]} />
        <meshStandardMaterial color="#6B7280" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, TURBINE_CONFIG.hallHeight * 0.8, -TURBINE_CONFIG.hallWidth / 2 - 0.1]} castShadow>
        <boxGeometry args={[TURBINE_CONFIG.hallLength * 0.8, 2, 0.2]} />
        <meshStandardMaterial color="#6B7280" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Enhanced turbine generators with detailed components */}
      <group>
        {Array.from({ length: TURBINE_CONFIG.turbineCount }, (_, i) => {
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
        <mesh position={[0, TURBINE_CONFIG.hallHeight - 2, 0]} castShadow>
          <boxGeometry args={[TURBINE_CONFIG.hallLength - 5, 1.5, 2]} />
          <meshStandardMaterial color="#E53E3E" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Crane rails */}
        <mesh position={[0, TURBINE_CONFIG.hallHeight - 2, TURBINE_CONFIG.hallWidth / 2 - 1]} castShadow>
          <boxGeometry args={[TURBINE_CONFIG.hallLength - 5, 0.5, 0.5]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, TURBINE_CONFIG.hallHeight - 2, -TURBINE_CONFIG.hallWidth / 2 + 1]} castShadow>
          <boxGeometry args={[TURBINE_CONFIG.hallLength - 5, 0.5, 0.5]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Crane trolley */}
        <mesh position={[10, TURBINE_CONFIG.hallHeight - 3, 0]} castShadow>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Crane hook */}
        <mesh position={[10, TURBINE_CONFIG.hallHeight - 8, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Crane cables */}
        <mesh position={[10, TURBINE_CONFIG.hallHeight - 5.5, 0]} castShadow>
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
              <mesh position={[x, 3, TURBINE_CONFIG.hallWidth / 2 - 2]} castShadow receiveShadow>
                <boxGeometry args={[2, 6, 1.5]} />
                <meshStandardMaterial color="#2B6CB0" roughness={0.6} metalness={0.4} />
              </mesh>

              {/* Control indicators */}
              <mesh position={[x, 4, TURBINE_CONFIG.hallWidth / 2 - 1.2]} castShadow>
                <boxGeometry args={[1.5, 2, 0.1]} />
                <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.8} />
              </mesh>
            </group>
          )
        })}

        {/* Cable trays */}
        <mesh position={[0, TURBINE_CONFIG.hallHeight - 4, TURBINE_CONFIG.hallWidth / 2 - 3]} castShadow>
          <boxGeometry args={[TURBINE_CONFIG.hallLength - 10, 0.3, 1]} />
          <meshStandardMaterial color="#4B5563" roughness={0.7} metalness={0.6} />
        </mesh>
        <mesh position={[0, TURBINE_CONFIG.hallHeight - 4, -TURBINE_CONFIG.hallWidth / 2 + 3]} castShadow>
          <boxGeometry args={[TURBINE_CONFIG.hallLength - 10, 0.3, 1]} />
          <meshStandardMaterial color="#4B5563" roughness={0.7} metalness={0.6} />
        </mesh>

        {/* Transformer units */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh
            key={`transformer-${i}`}
            position={[(i - 1) * 25, 2, -TURBINE_CONFIG.hallWidth / 2 + 5]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[4, 4, 3]} />
            <meshStandardMaterial color="#718096" roughness={0.5} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Ventilation and HVAC systems */}
      <group>
        {/* Main ventilation ducts */}
        <mesh position={[0, TURBINE_CONFIG.hallHeight - 1, 0]} castShadow>
          <boxGeometry args={[TURBINE_CONFIG.hallLength - 10, 1, 2]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Exhaust fans */}
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={`fan-${i}`} position={[(i - 1.5) * 15, TURBINE_CONFIG.hallHeight + 1, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.5, 16]} />
            <meshStandardMaterial color="#4B5563" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
})

interface AuxiliaryBlocksProps {
  exploded?: boolean
}

export const AuxiliaryBlocks = memo(function AuxiliaryBlocks({ exploded = false }: AuxiliaryBlocksProps) {
  const explodeOffset = useMemo(() => (exploded ? [0, 0, 15] : [0, 0, 0]), [exploded])

  const blocks = useMemo(() => {
    const blocks = []
    // Use a stable seed for consistent random generation
    let seed = 12345
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    for (let i = 0; i < AUX_CONFIG.blockCount; i++) {
      const angle = (i / AUX_CONFIG.blockCount) * Math.PI * 2
      const distance = 25 + random() * AUX_CONFIG.blockSpread
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance
      const width = 8 + random() * 12
      const depth = 6 + random() * 10
      const height = AUX_CONFIG.minHeight + random() * (AUX_CONFIG.maxHeight - AUX_CONFIG.minHeight)

      blocks.push({
        position: [x, height / 2, z],
        scale: [width, height, depth],
        rotation: [0, (random() * Math.PI) / 4, 0],
      })
    }
    return blocks
  }, [])

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
})
