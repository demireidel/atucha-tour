"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Bloom, EffectComposer, FXAA, SMAA, SSAO } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"

export function PostProcessing() {
  const { quality, postProcessing } = useAppStore()

  const effects = useMemo(() => {
    if (!postProcessing) return null

    const effectsArray = []

    switch (quality) {
      case "low":
        // No post-processing for low quality
        return null

      case "medium":
        effectsArray.push(<FXAA key="fxaa" />)
        break

      case "high":
      case "auto":
        effectsArray.push(
          <SMAA key="smaa" />,
          <SSAO
            key="ssao"
            blendFunction={BlendFunction.MULTIPLY}
            samples={16}
            rings={4}
            distanceThreshold={0.5}
            distanceFalloff={0.1}
            rangeThreshold={0.015}
            rangeFalloff={0.01}
            luminanceInfluence={0.7}
            radius={0.1}
            intensity={1.0}
            bias={0.025}
          />,
          <Bloom
            key="bloom"
            blendFunction={BlendFunction.ADD}
            intensity={0.3}
            width={300}
            height={300}
            kernelSize={5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.025}
          />,
        )
        break
    }

    return effectsArray
  }, [quality, postProcessing])

  if (!effects) return null

  return <EffectComposer>{effects}</EffectComposer>
}
