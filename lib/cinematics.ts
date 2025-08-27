import * as THREE from "three"

export interface CinematicShot {
  id: string
  name: string
  duration: number // in seconds
  fps: number
  description: string
  cameraPath: THREE.Vector3[]
  targetPath: THREE.Vector3[]
  fovStart: number
  fovEnd: number
  easing: (t: number) => number
}

// Easing functions
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// Predefined cinematic shots
export const cinematicShots: CinematicShot[] = [
  {
    id: "sunrise-sweep",
    name: "Sunrise Sweep",
    duration: 12,
    fps: 24,
    description: "Low dolly across site with rising sun",
    cameraPath: [
      new THREE.Vector3(-80, 5, -40),
      new THREE.Vector3(-40, 8, -20),
      new THREE.Vector3(0, 12, 0),
      new THREE.Vector3(40, 15, 20),
      new THREE.Vector3(80, 18, 40),
    ],
    targetPath: [
      new THREE.Vector3(-20, 10, 0),
      new THREE.Vector3(0, 15, 0),
      new THREE.Vector3(20, 20, 0),
      new THREE.Vector3(40, 25, 0),
      new THREE.Vector3(60, 30, 0),
    ],
    fovStart: 50,
    fovEnd: 40,
    easing: easeInOutCubic,
  },
  {
    id: "reactor-orbit",
    name: "Reactor Orbit",
    duration: 10,
    fps: 24,
    description: "Circular path around reactor dome",
    cameraPath: [
      new THREE.Vector3(30, 25, 0),
      new THREE.Vector3(21, 25, 21),
      new THREE.Vector3(0, 25, 30),
      new THREE.Vector3(-21, 25, 21),
      new THREE.Vector3(-30, 25, 0),
      new THREE.Vector3(-21, 25, -21),
      new THREE.Vector3(0, 25, -30),
      new THREE.Vector3(21, 25, -21),
      new THREE.Vector3(30, 25, 0),
    ],
    targetPath: [
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 20, 0),
    ],
    fovStart: 45,
    fovEnd: 45,
    easing: easeInOutQuad,
  },
  {
    id: "riverside-pullback",
    name: "Riverside Pullback",
    duration: 14,
    fps: 24,
    description: "Pull back from water to overview",
    cameraPath: [
      new THREE.Vector3(0, 2, -90),
      new THREE.Vector3(0, 8, -70),
      new THREE.Vector3(0, 20, -40),
      new THREE.Vector3(0, 35, -10),
      new THREE.Vector3(0, 50, 20),
    ],
    targetPath: [
      new THREE.Vector3(0, 0, -80),
      new THREE.Vector3(0, 5, -40),
      new THREE.Vector3(0, 10, 0),
      new THREE.Vector3(0, 15, 20),
      new THREE.Vector3(0, 20, 40),
    ],
    fovStart: 55,
    fovEnd: 35,
    easing: easeInOutCubic,
  },
]

// Utility functions for camera path interpolation
export function interpolateAlongPath(
  path: THREE.Vector3[],
  t: number,
  easing: (t: number) => number = easeInOutCubic,
): THREE.Vector3 {
  const easedT = easing(Math.max(0, Math.min(1, t)))
  const curve = new THREE.CatmullRomCurve3(path)
  return curve.getPoint(easedT)
}

export function interpolateFOV(
  startFOV: number,
  endFOV: number,
  t: number,
  easing: (t: number) => number = easeInOutCubic,
): number {
  const easedT = easing(Math.max(0, Math.min(1, t)))
  return startFOV + (endFOV - startFOV) * easedT
}

// Convert progress (0-1) to timecode string
export function progressToTimecode(progress: number, duration: number): string {
  const totalSeconds = progress * duration
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const frames = Math.floor((totalSeconds % 1) * 24) // Assuming 24fps

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
}
