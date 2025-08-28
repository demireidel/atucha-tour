self.onmessage = (event) => {
  const { id, type, data } = event.data

  try {
    let result

    switch (type) {
      case "calculateFuelAssemblyPositions":
        result = calculateFuelAssemblyPositions(data.count)
        break

      case "calculateCoolingLoopPositions":
        result = calculateCoolingLoopPositions(data.loopCount, data.radius)
        break

      default:
        throw new Error(`Unknown calculation type: ${type}`)
    }

    self.postMessage({ id, result })
  } catch (error) {
    self.postMessage({ id, result: null, error: error.message })
  }
}

function calculateFuelAssemblyPositions(count) {
  const positions = []

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 13)
    const col = i % 13
    const x = (col - 6) * 1.2
    const z = (row - 6) * 1.2
    const distance = Math.sqrt(x * x + z * z)

    if (distance <= 7) {
      positions.push([x, 0, z])
    }
  }

  return positions
}

function calculateCoolingLoopPositions(loopCount, radius) {
  const positions = []

  for (let i = 0; i < loopCount; i++) {
    const angle = (i / loopCount) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    positions.push([x, 0, z])
  }

  return positions
}
