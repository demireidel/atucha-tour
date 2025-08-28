// Web Worker para cálculos geométricos complejos
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

    default:
      console.warn("Unknown worker message type:", type)
  }
}
