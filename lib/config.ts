export const REACTOR_CONFIG = {
  diameter: 24,
  height: 30,
  domeHeight: 12,
  ribCount: 16,
  ringCount: 6,
  fuelAssemblies: 157,
  controlRods: 37,
} as const

export const TURBINE_CONFIG = {
  hallLength: 80,
  hallWidth: 25,
  hallHeight: 18,
  skylightCount: 8,
  roofPitch: 0.1,
  turbineCount: 3,
} as const

export const AUX_CONFIG = {
  blockCount: 6,
  blockSpread: 40,
  minHeight: 8,
  maxHeight: 20,
} as const

export const PERFORMANCE_CONFIG = {
  maxFPS: 60,
  targetFPS: 30,
  lowQualityThreshold: 25,
  memoryWarningThreshold: 100 * 1024 * 1024, // 100MB
} as const
