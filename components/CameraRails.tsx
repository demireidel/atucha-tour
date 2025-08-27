"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useAppStore } from "@/lib/store"
import { cinematicShots, interpolateAlongPath, interpolateFOV } from "@/lib/cinematics"
import * as THREE from "three"

export function CameraRails() {
  const { camera } = useThree()
  const {
    cinematicMode,
    currentShot,
    shotProgress,
    setShotProgress,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    isLooping,
    currentFOV,
    setCurrentFOV,
  } = useAppStore()

  const startTimeRef = useRef<number>(0)
  const lastProgressRef = useRef<number>(0)

  // Update camera FOV
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = currentFOV
      camera.updateProjectionMatrix()
    }
  }, [camera, currentFOV])

  useFrame((state) => {
    if (!cinematicMode || !isPlaying) return

    const currentShotData = cinematicShots[currentShot]
    if (!currentShotData) return

    // Calculate progress based on time
    const currentTime = state.clock.getElapsedTime()
    if (lastProgressRef.current === 0 || shotProgress === 0) {
      startTimeRef.current = currentTime - (shotProgress * currentShotData.duration) / playbackSpeed
    }

    const elapsed = (currentTime - startTimeRef.current) * playbackSpeed
    const newProgress = Math.min(elapsed / currentShotData.duration, 1)

    // Update progress
    setShotProgress(newProgress)
    lastProgressRef.current = newProgress

    // Interpolate camera position and target
    const cameraPosition = interpolateAlongPath(currentShotData.cameraPath, newProgress, currentShotData.easing)
    const targetPosition = interpolateAlongPath(currentShotData.targetPath, newProgress, currentShotData.easing)

    // Update camera
    camera.position.copy(cameraPosition)
    camera.lookAt(targetPosition)

    // Update FOV
    const newFOV = interpolateFOV(currentShotData.fovStart, currentShotData.fovEnd, newProgress, currentShotData.easing)
    setCurrentFOV(newFOV)

    // Handle end of shot
    if (newProgress >= 1) {
      if (isLooping) {
        setShotProgress(0)
        startTimeRef.current = currentTime
      } else {
        setIsPlaying(false)
        lastProgressRef.current = 0
      }
    }
  })

  // Reset when shot changes
  useEffect(() => {
    lastProgressRef.current = 0
    startTimeRef.current = 0
  }, [currentShot])

  return null
}
