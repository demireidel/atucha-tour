"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { useAppStore } from "@/lib/store"
import { OptimizedAtuchaModel } from "./OptimizedAtuchaModel"
import { Switchyard } from "./Switchyard"
import { WaterAndTerrain } from "./WaterAndTerrain"
import { TOURS, getTourAtProgress } from "@/lib/tours"
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
  const frameCountRef = useRef<number>(0)
  const lastFpsCheckRef = useRef<number>(Date.now())
  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

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

  useFrame((state, deltaTime) => {
    if (!isMountedRef.current) return

    // Skip expensive operations if frame time is too high (< 30 FPS)
    const skipFrame = deltaTime > 0.033

    // Performance monitoring
    frameCountRef.current++
    const now = Date.now()
    if (now - lastFpsCheckRef.current > 1000) {
      const fps = frameCountRef.current
      frameCountRef.current = 0
      lastFpsCheckRef.current = now

      // Log performance in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[v0] FPS: ${fps}, Frame time: ${(deltaTime * 1000).toFixed(1)}ms`)
      }
    }

    // Animate sun position (skip if performance is poor)
    if (lightRef.current && !skipFrame) {
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

        // Smoothly move camera (always do this for tours)
        camera.position.lerp(tourState.position, 0.02)
        camera.lookAt(tourState.target)

        // Update camera matrix
        camera.updateMatrixWorld()
      }
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={lightRef}
        intensity={1.2}
        castShadow={quality !== "low"}
        shadow-mapSize-width={quality === "high" ? 2048 : 1024}
        shadow-mapSize-height={quality === "high" ? 2048 : 1024}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />

      {/* Environment */}
      <Environment preset={environmentPreset} />

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

      {layers.terrain && <WaterAndTerrain exploded={exploded} />}
      <OptimizedAtuchaModel exploded={exploded} quality={quality} />
      {layers.switchyard && <Switchyard exploded={exploded} />}

      {/* Contact shadows for better ground connection */}
      {quality !== "low" && (
        <ContactShadows position={[0, -0.9, 0]} opacity={0.4} scale={100} blur={quality === "high" ? 2 : 1} far={50} />
      )}
    </>
  )
}
