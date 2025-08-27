import * as THREE from "three"

export interface TourWaypoint {
  position: [number, number, number]
  target: [number, number, number]
  duration: number // seconds to reach this waypoint
  description?: string
}

export interface Tour {
  id: string
  title: string
  waypoints: TourWaypoint[]
  totalDuration: number
}

export const TOURS: Tour[] = [
  {
    id: "reactor-core",
    title: "Reactor Core Journey",
    totalDuration: 720, // 12 minutes
    waypoints: [
      {
        position: [30, 5, 30],
        target: [0, 15, 0],
        duration: 60,
        description: "Approaching the reactor building from the main entrance",
      },
      {
        position: [15, 8, 15],
        target: [0, 20, 0],
        duration: 90,
        description: "Walking closer to examine the containment structure",
      },
      {
        position: [5, 12, 8],
        target: [0, 25, 0],
        duration: 120,
        description: "Observing the reactor dome and safety systems",
      },
      {
        position: [-10, 6, 12],
        target: [0, 15, 0],
        duration: 90,
        description: "Circling around to see the auxiliary systems",
      },
      {
        position: [20, 15, -5],
        target: [0, 20, 0],
        duration: 180,
        description: "Elevated view of the complete reactor complex",
      },
      {
        position: [40, 8, 25],
        target: [0, 15, 0],
        duration: 180,
        description: "Final overview of the reactor building",
      },
    ],
  },
  {
    id: "turbine-hall",
    title: "Turbine Hall Experience",
    totalDuration: 600, // 10 minutes
    waypoints: [
      {
        position: [80, 5, 20],
        target: [50, 10, 0],
        duration: 60,
        description: "Approaching the turbine hall entrance",
      },
      {
        position: [65, 8, 15],
        target: [50, 15, 0],
        duration: 90,
        description: "Walking along the turbine hall exterior",
      },
      {
        position: [50, 12, 25],
        target: [50, 18, 0],
        duration: 120,
        description: "Observing the massive turbine generators",
      },
      {
        position: [35, 6, 10],
        target: [50, 12, 0],
        duration: 90,
        description: "Examining the steam intake systems",
      },
      {
        position: [50, 20, -15],
        target: [50, 15, 0],
        duration: 120,
        description: "Aerial view of the turbine hall operations",
      },
      {
        position: [70, 10, -10],
        target: [50, 15, 0],
        duration: 120,
        description: "Final perspective of the power generation systems",
      },
    ],
  },
  {
    id: "safety-systems",
    title: "Safety Systems Tour",
    totalDuration: 900, // 15 minutes
    waypoints: [
      {
        position: [25, 8, 35],
        target: [0, 15, 0],
        duration: 90,
        description: "Starting at the emergency response center",
      },
      {
        position: [12, 6, 20],
        target: [0, 18, 0],
        duration: 120,
        description: "Examining containment safety barriers",
      },
      {
        position: [-5, 10, 15],
        target: [0, 20, 0],
        duration: 150,
        description: "Observing emergency cooling systems",
      },
      {
        position: [8, 15, -8],
        target: [0, 25, 0],
        duration: 120,
        description: "Elevated view of safety redundancy systems",
      },
      {
        position: [-15, 5, 25],
        target: [0, 15, 0],
        duration: 180,
        description: "Walking through auxiliary safety equipment",
      },
      {
        position: [30, 12, -20],
        target: [0, 18, 0],
        duration: 240,
        description: "Comprehensive overview of all safety systems",
      },
    ],
  },
  {
    id: "control-room",
    title: "Control Room Operations",
    totalDuration: 480, // 8 minutes
    waypoints: [
      {
        position: [15, 8, 25],
        target: [0, 12, 0],
        duration: 60,
        description: "Approaching the control building",
      },
      {
        position: [8, 10, 18],
        target: [0, 15, 0],
        duration: 90,
        description: "Entering the operations center",
      },
      {
        position: [2, 12, 12],
        target: [0, 18, 0],
        duration: 120,
        description: "Inside the main control room",
      },
      {
        position: [-3, 8, 15],
        target: [0, 15, 0],
        duration: 90,
        description: "Observing monitoring systems",
      },
      {
        position: [5, 15, 8],
        target: [0, 12, 0],
        duration: 120,
        description: "Overview of control operations",
      },
    ],
  },
  {
    id: "complete-facility",
    title: "Complete Facility Overview",
    totalDuration: 1500, // 25 minutes
    waypoints: [
      {
        position: [60, 15, 60],
        target: [0, 10, 0],
        duration: 120,
        description: "Starting with a complete facility overview",
      },
      {
        position: [40, 8, 40],
        target: [0, 15, 0],
        duration: 180,
        description: "Walking toward the reactor complex",
      },
      {
        position: [20, 10, 25],
        target: [0, 20, 0],
        duration: 240,
        description: "Detailed reactor building examination",
      },
      {
        position: [50, 12, 15],
        target: [50, 18, 0],
        duration: 300,
        description: "Comprehensive turbine hall tour",
      },
      {
        position: [-60, 8, 20],
        target: [-80, 5, 0],
        duration: 240,
        description: "Exploring the switchyard operations",
      },
      {
        position: [0, 6, -80],
        target: [0, 0, -120],
        duration: 180,
        description: "Visiting the water intake systems",
      },
      {
        position: [80, 25, 80],
        target: [0, 10, 0],
        duration: 240,
        description: "Final aerial overview of the complete facility",
      },
    ],
  },
]

export function interpolatePosition(
  start: [number, number, number],
  end: [number, number, number],
  progress: number,
): THREE.Vector3 {
  const startVec = new THREE.Vector3(...start)
  const endVec = new THREE.Vector3(...end)
  return startVec.lerp(endVec, easeInOutCubic(progress))
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function getTourAtProgress(
  tour: Tour,
  progress: number,
): {
  position: THREE.Vector3
  target: THREE.Vector3
  currentWaypoint: number
  description: string
} {
  const totalTime = tour.totalDuration * progress
  let accumulatedTime = 0

  for (let i = 0; i < tour.waypoints.length - 1; i++) {
    const currentWaypoint = tour.waypoints[i]
    const nextWaypoint = tour.waypoints[i + 1]

    if (accumulatedTime + currentWaypoint.duration >= totalTime) {
      const segmentProgress = (totalTime - accumulatedTime) / currentWaypoint.duration

      return {
        position: interpolatePosition(currentWaypoint.position, nextWaypoint.position, segmentProgress),
        target: interpolatePosition(currentWaypoint.target, nextWaypoint.target, segmentProgress),
        currentWaypoint: i,
        description: currentWaypoint.description || "",
      }
    }

    accumulatedTime += currentWaypoint.duration
  }

  // Return final waypoint if we've reached the end
  const finalWaypoint = tour.waypoints[tour.waypoints.length - 1]
  return {
    position: new THREE.Vector3(...finalWaypoint.position),
    target: new THREE.Vector3(...finalWaypoint.target),
    currentWaypoint: tour.waypoints.length - 1,
    description: finalWaypoint.description || "",
  }
}
