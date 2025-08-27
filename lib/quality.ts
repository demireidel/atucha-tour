// Quality management and auto-detection system
export interface QualitySettings {
  dpr: number
  shadowMapSize: number
  postProcessing: boolean
  shadows: boolean
  frameloop: "always" | "demand"
  antialias: boolean
}

export function getQualityPresets(): Record<string, QualitySettings> {
  const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1

  return {
    low: {
      dpr: 1,
      shadowMapSize: 512,
      postProcessing: false,
      shadows: false,
      frameloop: "demand",
      antialias: false,
    },
    medium: {
      dpr: Math.min(devicePixelRatio, 2),
      shadowMapSize: 1024,
      postProcessing: true,
      shadows: true,
      frameloop: "always",
      antialias: true,
    },
    high: {
      dpr: Math.min(devicePixelRatio, 2),
      shadowMapSize: 2048,
      postProcessing: true,
      shadows: true,
      frameloop: "always",
      antialias: true,
    },
  }
}

export const QUALITY_PRESETS = getQualityPresets()

export interface DeviceCapabilities {
  memory: number
  cores: number
  gpu: string
  mobile: boolean
  score: number
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const nav = navigator as any
  const memory = nav.deviceMemory || 4
  const cores = nav.hardwareConcurrency || 4
  const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Get GPU info
  const canvas = document.createElement("canvas")
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info")
  const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Unknown"

  // Calculate performance score (0-100)
  let score = 50 // baseline
  score += Math.min(memory * 5, 30) // memory contribution
  score += Math.min(cores * 3, 20) // CPU cores contribution
  score -= mobile ? 20 : 0 // mobile penalty

  // GPU-based adjustments
  if (gpu.includes("RTX") || gpu.includes("RX 6") || gpu.includes("RX 7")) score += 20
  else if (gpu.includes("GTX") || gpu.includes("RX 5")) score += 10
  else if (gpu.includes("Intel") || gpu.includes("Mali")) score -= 15

  return { memory, cores, gpu, mobile, score: Math.max(0, Math.min(100, score)) }
}

export function getRecommendedQuality(capabilities: DeviceCapabilities): "low" | "medium" | "high" {
  if (capabilities.score >= 75) return "high"
  if (capabilities.score >= 45) return "medium"
  return "low"
}

export class PerformanceMonitor {
  private fpsHistory: number[] = []
  private lastTime = performance.now()
  private frameCount = 0
  private callbacks: ((fps: number) => void)[] = []
  private warmupFrames = 0
  private isWarmingUp = true

  constructor() {
    this.tick = this.tick.bind(this)
    requestAnimationFrame(this.tick)
  }

  private tick(currentTime: number) {
    this.frameCount++

    if (currentTime - this.lastTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.fpsHistory.push(fps)

      // Keep only last 10 seconds of data
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift()
      }

      // Warmup period (4 seconds)
      if (this.isWarmingUp) {
        this.warmupFrames++
        if (this.warmupFrames >= 4) {
          this.isWarmingUp = false
        }
      }

      this.callbacks.forEach((callback) => callback(fps))

      this.frameCount = 0
      this.lastTime = currentTime
    }

    requestAnimationFrame(this.tick)
  }

  onFpsUpdate(callback: (fps: number) => void) {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) this.callbacks.splice(index, 1)
    }
  }

  getAverageFps(): number {
    if (this.fpsHistory.length === 0) return 60
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
  }

  shouldDowngrade(): boolean {
    return !this.isWarmingUp && this.getAverageFps() < 30 && this.fpsHistory.length >= 3
  }

  isWarmedUp(): boolean {
    return !this.isWarmingUp
  }
}

// Context loss handling
export function handleContextLoss(canvas: HTMLCanvasElement, onContextLost: () => void) {
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault()
    console.warn("[v0] WebGL context lost")
    onContextLost()
  })

  canvas.addEventListener("webglcontextrestored", () => {
    console.log("[v0] WebGL context restored")
  })
}

// Save/load quality settings
export function saveQualitySettings(quality: string) {
  localStorage.setItem("atucha-quality", quality)
}

export function loadQualitySettings(): string | null {
  return localStorage.getItem("atucha-quality")
}
