"use client"

import { useRef, useEffect, useCallback, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, Sky } from "@react-three/drei"
import { useAppStore } from "@/lib/store"
import { ReactorBuilding, TurbineHall, AuxiliaryBlocks } from "./AtuchaModel"
import { Switchyard } from "./Switchyard"
import { WaterAndTerrain } from "./WaterAndTerrain"
import { TOURS, getTourAtProgress } from "@/lib/tours"
import * as THREE from "three"

interface AtuchaSceneProps {
  tourId?: string | null
}

export default function AtuchaScene({ tourId }: AtuchaSceneProps) {
  const { camera, gl } = useThree()
  const { layers, sunPosition, environmentPreset, quality, exploded, tourProgress, setTourProgress } = useAppStore()
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const controlsRef = useRef<any>(null)
  const tourStartTimeRef = useRef<number>(0)
  const isInTourRef = useRef<boolean>(false)
  const isMountedRef = useRef<boolean>(true)
  const performanceRef = useRef({ fps: 60, triangles: 0 })

  const shadowMapSize = useMemo(() => {
    return quality === "high" ? 4096 : quality === "medium" ? 2048 : 1024
  }, [quality])

  const sunPositionVector = useMemo(() => {
    const angle = sunPosition * Math.PI * 2 - Math.PI / 2
    return [Math.cos(angle) * 100, Math.sin(angle) * 50 + 20, Math.sin(angle) * 30]
  }, [sunPosition])

  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.2
    gl.outputColorSpace = THREE.SRGBColorSpace
  }, [gl])

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

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const currentTour = useMemo(() => {
    return tourId ? TOURS.find((t) => t.id === tourId) : null
  }, [tourId])

  useFrame(
    useCallback(
      (state) => {
        // Early return if component is unmounted
        if (!isMountedRef.current) return

        const deltaTime = state.clock.getDelta()
        const skipFrame = deltaTime > 0.033 // Skip if frame time > 33ms (30 FPS)

        performanceRef.current.triangles = state.gl.info.render.triangles

        if (lightRef.current && !skipFrame) {
          const [targetX, targetY, targetZ] = sunPositionVector
          lightRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.02)
        }

        // Handle tour animation
        if (isInTourRef.current && tourId && currentTour && !skipFrame) {
          const elapsed = (Date.now() - tourStartTimeRef.current) / 1000
          const progress = Math.min(elapsed / currentTour.totalDuration, 1)

          setTourProgress(progress)

          const tourState = getTourAtProgress(currentTour, progress)

          // Smoothly move camera
          camera.position.lerp(tourState.position, 0.02)
          camera.lookAt(tourState.target)

          // Update camera matrix
          camera.updateMatrixWorld()
        }
      },
      [sunPositionVector, tourId, currentTour, camera, setTourProgress],
    ),
  )

  return (
    <>
      <ambientLight intensity={0.3} color="#87CEEB" />
      <directionalLight
        ref={lightRef}
        intensity={2.5}
        color="#FFF8DC"
        castShadow={quality !== "low"}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={300}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      <directionalLight position={[-50, 20, 50]} intensity={0.8} color="#B0E0E6" castShadow={false} />

      <Sky
        distance={450000}
        sunPosition={sunPositionVector}
        inclination={0.49}
        azimuth={0.25}
        turbidity={8}
        rayleigh={6}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <Environment preset={environmentPreset} background={false} environmentIntensity={0.6} />

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
      {layers.reactor && <ReactorBuilding exploded={exploded} />}
      {layers.turbineHall && <TurbineHall exploded={exploded} />}
      {layers.auxiliary && <AuxiliaryBlocks exploded={exploded} />}
      {layers.switchyard && <Switchyard exploded={exploded} />}

      {quality !== "low" && (
        <ContactShadows
          position={[0, -0.9, 0]}
          opacity={0.6}
          scale={120}
          blur={quality === "high" ? 3 : quality === "medium" ? 2 : 1}
          far={80}
          resolution={quality === "high" ? 1024 : 512}
          color="#1a1a1a"
        />
      )}
    </>
  )
}
