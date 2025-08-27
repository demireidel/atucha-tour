import { MeshStandardMaterial, MeshPhysicalMaterial, TextureLoader, RepeatWrapping } from "three"

const textureLoader = new TextureLoader()

export const concreteMaterial = new MeshStandardMaterial({
  color: "#8B8680",
  roughness: 0.9,
  metalness: 0,
  normalScale: [0.8, 0.8],
  // Adding procedural concrete texture via placeholder
  map: textureLoader.load("/weathered-concrete-texture-with-stains-and-aging.png"),
  normalMap: textureLoader.load("/concrete-normal-map-with-surface-irregularities.png"),
  roughnessMap: textureLoader.load("/concrete-roughness-map-with-varying-surface-finish.png"),
})

export const steelMaterial = new MeshStandardMaterial({
  color: "#B0B8C1",
  roughness: 0.3,
  metalness: 0.9,
  map: textureLoader.load("/brushed-steel-texture-with-industrial-wear-pattern.png"),
  normalMap: textureLoader.load("/steel-normal-map-with-scratches-and-surface-detail.png"),
  roughnessMap: textureLoader.load("/steel-roughness-map-with-polished-and-worn-areas.png"),
})

export const stainlesssteelMaterial = new MeshStandardMaterial({
  color: "#C0C8D0",
  roughness: 0.15,
  metalness: 0.95,
  map: textureLoader.load("/polished-stainless-steel-with-subtle-reflections.png"),
  normalMap: textureLoader.load("/stainless-steel-normal-map-with-fine-surface-detai.png"),
})

export const paintedSteelMaterial = new MeshStandardMaterial({
  color: "#2E5984",
  roughness: 0.4,
  metalness: 0.1,
  map: textureLoader.load("/industrial-blue-painted-steel-with-wear-and-chippi.png"),
  normalMap: textureLoader.load("/painted-steel-normal-map-with-paint-texture.png"),
})

export const copperMaterial = new MeshStandardMaterial({
  color: "#B87333",
  roughness: 0.2,
  metalness: 0.8,
  map: textureLoader.load("/oxidized-copper-pipe-texture-with-patina-and-corro.png"),
  normalMap: textureLoader.load("/copper-pipe-normal-map-with-surface-oxidation.png"),
})

export const insulationMaterial = new MeshStandardMaterial({
  color: "#E8E8E8",
  roughness: 0.8,
  metalness: 0,
  map: textureLoader.load("/white-thermal-insulation-material-with-fabric-text.png"),
  normalMap: textureLoader.load("/insulation-normal-map-with-fabric-weave-pattern.png"),
})

export const metalMaterial = steelMaterial

export const waterMaterial = new MeshPhysicalMaterial({
  color: "#1e40af",
  roughness: 0.05,
  metalness: 0,
  transmission: 0.95,
  thickness: 0.8,
  transparent: true,
  opacity: 0.85,
  normalMap: textureLoader.load("/water-surface-normal-map-with-ripples-and-waves.png"),
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
})

export const terrainMaterial = new MeshStandardMaterial({
  color: "#4A5D23",
  roughness: 0.9,
  metalness: 0,
  map: textureLoader.load("/grass-terrain-texture-with-natural-variations.png"),
  normalMap: textureLoader.load("/grass-terrain-normal-map-with-ground-detail.png"),
  roughnessMap: textureLoader.load("/grass-terrain-roughness-map-with-organic-varia.png"),
})

export const roadMaterial = new MeshStandardMaterial({
  color: "#2D2D2D",
  roughness: 0.8,
  metalness: 0,
  map: textureLoader.load("/asphalt-road-texture-with-wear-marks-and-aging.png"),
  normalMap: textureLoader.load("/asphalt-road-normal-map-with-surface-texture.png"),
  roughnessMap: textureLoader.load("/asphalt-road-roughness-map-with-wear-patterns.png"),
})

export const glassMaterial = new MeshPhysicalMaterial({
  color: "#ffffff",
  roughness: 0.05,
  metalness: 0,
  transmission: 0.9,
  thickness: 0.1,
  transparent: true,
  opacity: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
})

export const rubberMaterial = new MeshStandardMaterial({
  color: "#1a1a1a",
  roughness: 0.9,
  metalness: 0,
  map: textureLoader.load("/placeholder.svg?height=512&width=512"),
})

export const electricalMaterial = new MeshStandardMaterial({
  color: "#2a2a2a",
  roughness: 0.6,
  metalness: 0.2,
  map: textureLoader.load("/placeholder.svg?height=512&width=512"),
  emissive: "#004400",
  emissiveIntensity: 0.1,
})
;[concreteMaterial, steelMaterial, terrainMaterial, roadMaterial, stainlesssteelMaterial, paintedSteelMaterial].forEach(
  (material) => {
    if (material.map) {
      material.map.wrapS = RepeatWrapping
      material.map.wrapT = RepeatWrapping
      material.map.repeat.set(4, 4)
      material.map.anisotropy = 16 // Mejorar calidad de filtrado de texturas
    }
    if (material.normalMap) {
      material.normalMap.wrapS = RepeatWrapping
      material.normalMap.wrapT = RepeatWrapping
      material.normalMap.repeat.set(4, 4)
      material.normalMap.anisotropy = 16
    }
    if (material.roughnessMap) {
      material.roughnessMap.wrapS = RepeatWrapping
      material.roughnessMap.wrapT = RepeatWrapping
      material.roughnessMap.repeat.set(4, 4)
      material.roughnessMap.anisotropy = 16
    }
  },
)
