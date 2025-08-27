"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { useAppStore } from "@/lib/store"
import { ReactorBuilding, TurbineHall, AuxiliaryBlocks } from "./AtuchaModel"
import { Switchyard } from "./Switchyard"
import { WaterAndTerrain } from "./WaterAndTerrain"
import { TOURS, getTourAtProgress } from "@/lib/tours"
import { AtmosphericEffects } from "./AtmosphericEffects"
import { IndustrialLighting } from "./IndustrialLighting"
import { PostProcessing } from "./PostProcessing"
import { ParticleEffects } from "./ParticleEffects"
import { EnhancedWater } from "./EnhancedWater"
import type * as THREE from "three"

interface AtuchaSceneProps {
  tourId?: string | null
}

export default function AtuchaScene({ tourId }: AtuchaSceneProps) {
  const { camera } = useThree()
  const { layers, sunPosition, environmentPreset, quality, exploded, tourProgress, setTourProgress } = useAppStore()
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const controlsRef = useRef<any>(null)
  const tourStartTimeRef = useRef<number>(0)
  const isInTourRef = useRef<boolean>(false)

  useEffect(() => {
    if (tourId) {
      isInTourRef.current = true
      tourStartTimeRef.current = Date.now()
      setTourProgress(0)

      // Disable orbit controls during tour
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }
    } else {
      isInTourRef.current = false

      // Re-enable orbit controls when not in tour
      if (controlsRef.current) {
        controlsRef.current.enabled = true
      }
    }
  }, [tourId, setTourProgress])

  useFrame((state) => {
    // Animate sun position
    if (lightRef.current) {
      const angle = sunPosition * Math.PI * 2 - Math.PI / 2
      lightRef.current.position.set(Math.cos(angle) * 100, Math.sin(angle) * 50 + 20, 0)
    }

    // Handle tour animation
    if (isInTourRef.current && tourId) {
      const currentTour = TOURS.find((t) => t.id === tourId)
      if (currentTour) {
        const elapsed = (Date.now() - tourStartTimeRef.current) / 1000 // Convert to seconds
        const progress = Math.min(elapsed / currentTour.totalDuration, 1)

        setTourProgress(progress)

        const tourState = getTourAtProgress(currentTour, progress)

        // Smoothly move camera
        camera.position.lerp(tourState.position, 0.02)
        camera.lookAt(tourState.target)

        // Update camera matrix
        camera.updateMatrixWorld()
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        ref={lightRef}
        intensity={1.5}
        castShadow={quality !== "low"}
        shadow-mapSize-width={quality === "high" ? 4096 : quality === "medium" ? 2048 : 1024}
        shadow-mapSize-height={quality === "high" ? 4096 : quality === "medium" ? 2048 : 1024}
        shadow-camera-far={300}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0001}
        shadow-radius={quality === "high" ? 8 : 4}
      />

      <directionalLight position={[-50, 30, 50]} intensity={0.4} color="#87CEEB" />
      <directionalLight position={[50, 20, -30]} intensity={0.3} color="#FFA500" />

      <Environment preset={environmentPreset} background={true} blur={0.1} intensity={0.8} />

      <AtmosphericEffects quality={quality} />
      <ParticleEffects quality={quality} />

      <IndustrialLighting quality={quality} />

      {/* Controls - disabled during tours */}
      {!tourId && (
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={200}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.05}
        />
      )}

      {layers.terrain && <EnhancedWater exploded={exploded} quality={quality} />}
      {layers.terrain && <WaterAndTerrain exploded={exploded} />}
      {layers.reactor && <ReactorBuilding exploded={exploded} />}
      {layers.turbineHall && <TurbineHall exploded={exploded} />}
      {layers.auxiliary && <AuxiliaryBlocks exploded={exploded} />}
      {layers.switchyard && <Switchyard exploded={exploded} />}

      {quality !== "low" && (
        <ContactShadows
          position={[0, -0.9, 0]}
          opacity={0.6}
          scale={150}
          blur={quality === "high" ? 3 : 2}
          far={80}
          resolution={quality === "high" ? 1024 : 512}
        />
      )}

      <PostProcessing />
    </>
  )
}
