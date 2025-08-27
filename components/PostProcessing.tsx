"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import {
  Bloom,
  EffectComposer,
  FXAA,
  SMAA,
  SSAO,
  DepthOfField,
  ChromaticAberration,
  Vignette,
  NormalPass,
} from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"

export function PostProcessing() {
  const { quality } = useAppStore()

  const effects = useMemo(() => {
    const effectsArray = []

    if (quality === "medium" || quality === "high") {
      effectsArray.push(<NormalPass key="normal" />)
    }

    switch (quality) {
      case "low":
        effectsArray.push(<FXAA key="fxaa" />)
        break

      case "medium":
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
            intensity={0.4}
            width={300}
            height={300}
            kernelSize={5}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.025}
          />,
        )
        break

      case "high":
        effectsArray.push(
          <SMAA key="smaa" />,
          <SSAO
            key="ssao"
            blendFunction={BlendFunction.MULTIPLY}
            samples={32}
            rings={6}
            distanceThreshold={0.4}
            distanceFalloff={0.1}
            rangeThreshold={0.01}
            rangeFalloff={0.005}
            luminanceInfluence={0.8}
            radius={0.15}
            intensity={1.2}
            bias={0.02}
          />,
          <Bloom
            key="bloom"
            blendFunction={BlendFunction.ADD}
            intensity={0.5}
            width={400}
            height={400}
            kernelSize={7}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.02}
          />,
          <DepthOfField key="dof" focusDistance={0.02} focalLength={0.05} bokehScale={3} height={480} />,
          <ChromaticAberration key="chromatic" blendFunction={BlendFunction.NORMAL} offset={[0.001, 0.001]} />,
          <Vignette key="vignette" offset={0.3} darkness={0.5} eskil={false} blendFunction={BlendFunction.NORMAL} />,
        )
        break
    }

    return effectsArray
  }, [quality])

  if (!effects.length) return null

  return <EffectComposer multisampling={quality === "high" ? 8 : 4}>{effects}</EffectComposer>
}
