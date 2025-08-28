export const REACTOR_CONFIG = {
  diameter: 24,
  height: 30,
  domeHeight: 12,
  ribCount: 16,
  ringCount: 6,
  fuelAssemblyCount: 157,
  controlRodCount: 37,
  coolingLoopCount: 4,
} as const

export const TURBINE_HALL_CONFIG = {
  length: 80,
  width: 25,
  height: 18,
  skylightCount: 8,
  roofPitch: 0.1,
  turbineCount: 3,
} as const

export const PERFORMANCE_CONFIG = {
  targetFPS: 60,
  maxFrameTime: 33, // ms (30 FPS threshold)
  qualityLevels: {
    low: {
      shadowMapSize: 512,
      maxDetails: 50,
      enablePostProcessing: false,
    },
    medium: {
      shadowMapSize: 1024,
      maxDetails: 100,
      enablePostProcessing: true,
    },
    high: {
      shadowMapSize: 2048,
      maxDetails: 200,
      enablePostProcessing: true,
    },
  },
} as const

export const TOUR_CONFIG = {
  interpolationSpeed: 0.02,
  cameraLerpFactor: 0.02,
  minTourDuration: 8 * 60, // 8 minutes in seconds
  maxTourDuration: 25 * 60, // 25 minutes in seconds
} as const
