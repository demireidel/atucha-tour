// TypeScript definitions for the geometry worker
export interface WorkerMessage {
  type: string
  data: any
  messageId?: string
}

export interface WorkerResponse {
  positions?: number[][]
  ribs?: Array<{ position: number[]; rotation: number[] }>
  messageId?: string
}

export interface FuelAssemblyData {
  count: number
  spacing: number
}

export interface ControlRodData {
  rodCount: number
}

export interface RibData {
  ribCount: number
  diameter: number
}

// Worker script content as string for dynamic creation
export const workerScript = `
self.onmessage = (e) => {
  const { type, data, messageId } = e.data

  switch (type) {
    case "CALCULATE_FUEL_ASSEMBLIES":
      const fuelPositions = []
      for (let i = 0; i < data.count; i++) {
        const row = Math.floor(i / 13)
        const col = i % 13
        const x = (col - 6) * data.spacing
        const z = (row - 6) * data.spacing
        const distance = Math.sqrt(x * x + z * z)
        if (distance <= 7) {
          fuelPositions.push([x, 0, z])
        }
      }
      self.postMessage({ positions: fuelPositions, messageId })
      break

    case "CALCULATE_CONTROL_RODS":
      const controlRodPositions = []
      for (let i = 0; i < data.rodCount; i++) {
        const row = Math.floor(i / 6)
        const col = i % 6
        const x = (col - 2.5) * 2.5
        const z = (row - 3) * 2.5
        controlRodPositions.push([x, 0, z])
      }
      self.postMessage({ positions: controlRodPositions, messageId })
      break

    case "CALCULATE_RIBS":
      const ribs = []
      for (let i = 0; i < data.ribCount; i++) {
        const angle = (i / data.ribCount) * Math.PI * 2
        const x = Math.cos(angle) * (data.diameter / 2 + 0.3)
        const z = Math.sin(angle) * (data.diameter / 2 + 0.3)
        ribs.push({
          position: [x, data.diameter / 2, z],
          rotation: [0, angle, 0],
        })
      }
      self.postMessage({ ribs, messageId })
      break

    case "CALCULATE_COMPLEX_GEOMETRY":
      // Placeholder for more complex calculations
      const result = performComplexCalculation(data)
      self.postMessage({ result, messageId })
      break

    default:
      console.warn("Unknown worker message type:", type)
  }
}

function performComplexCalculation(data) {
  // Simulate complex geometric calculations
  const results = []
  for (let i = 0; i < data.iterations || 1000; i++) {
    results.push({
      x: Math.random() * data.range || 100,
      y: Math.random() * data.range || 100,
      z: Math.random() * data.range || 100
    })
  }
  return results
}
`
