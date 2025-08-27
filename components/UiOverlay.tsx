"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { Camera, Settings, Info, Layers, Sun, Play, Headphones, HelpCircle, Activity } from "lucide-react"
import { AboutModal } from "./AboutModal"
import { LayerDrawer } from "./LayerDrawer"
import { QualityPanel } from "./QualityPanel"
import { SunControls } from "./SunControls"
import { Minimap } from "./Minimap"
import { HelpOverlay } from "./HelpOverlay"
import { MeasureTool } from "./MeasureTool"
import { SectionClipping } from "./SectionClipping"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { CinematicPanel } from "./CinematicPanel"
import { Overlays } from "./Overlays"

export default function UiOverlay() {
  const {
    setAboutModalOpen,
    aboutModalOpen,
    setRightDrawerOpen,
    rightDrawerOpen,
    cinematicMode,
    setCinematicMode,
    helpOverlayOpen,
    setHelpOverlayOpen,
    minimap,
    performanceHUD,
    setPerformanceHUD,
  } = useAppStore()

  const [qualityPanelOpen, setQualityPanelOpen] = useState(false)
  const [sunControlsOpen, setSunControlsOpen] = useState(false)
  const [measureToolActive, setMeasureToolActive] = useState(false)
  const [clippingActive, setClippingActive] = useState(false)

  const { toast } = useToast()

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = `atucha-ii-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
      toast({
        title: "Screenshot saved!",
        description: "Your screenshot has been downloaded successfully.",
      })
    }
  }, [toast])

  const handleTour = useCallback(() => {
    toast({
      title: "Camera tour starting...",
      description: "Enjoy the cinematic tour of the Atucha II facility.",
    })
    // Tour implementation will be added in cinematic mode
  }, [toast])

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4">
        <Card className="bg-custom-panel/90 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <h1 className="font-display font-bold text-xl text-brand">Atucha II — Exterior Visualization</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAboutModalOpen(true)}
                title="About this visualization"
              >
                <Info className="h-4 w-4 mr-2" />
                About
              </Button>

              <Button
                variant={rightDrawerOpen ? "default" : "ghost"}
                size="sm"
                onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
                title="Toggle layer controls (L)"
              >
                <Layers className="h-4 w-4 mr-2" />
                Layers
              </Button>

              <Button
                variant={qualityPanelOpen ? "default" : "ghost"}
                size="sm"
                onClick={() => setQualityPanelOpen(!qualityPanelOpen)}
                title="Quality settings"
              >
                <Settings className="h-4 w-4 mr-2" />
                Quality
              </Button>

              <Button
                variant={sunControlsOpen ? "default" : "ghost"}
                size="sm"
                onClick={() => setSunControlsOpen(!sunControlsOpen)}
                title="Sun and environment controls"
              >
                <Sun className="h-4 w-4 mr-2" />
                Sun
              </Button>

              <Button variant="ghost" size="sm" onClick={handleScreenshot} title="Take screenshot (S)">
                <Camera className="h-4 w-4 mr-2" />
                Screenshot
              </Button>

              <Button variant="ghost" size="sm" onClick={handleTour} title="Start camera tour (T)">
                <Play className="h-4 w-4 mr-2" />
                Tour
              </Button>

              <Button
                variant={cinematicMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setCinematicMode(!cinematicMode)}
                title="Toggle cinematic mode (C)"
              >
                <Headphones className="h-4 w-4 mr-2" />
                Cinematic
              </Button>

              <Button
                variant={performanceHUD ? "default" : "ghost"}
                size="sm"
                onClick={() => setPerformanceHUD(!performanceHUD)}
                title="Toggle performance HUD"
              >
                <Activity className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHelpOverlayOpen(true)}
                title="Show help and hotkeys (?)"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 z-50 flex gap-2">
        <Button
          variant={measureToolActive ? "default" : "ghost"}
          size="sm"
          onClick={() => setMeasureToolActive(!measureToolActive)}
          title="Measurement tool"
        >
          📏 Measure
        </Button>

        <Button
          variant={clippingActive ? "default" : "ghost"}
          size="sm"
          onClick={() => setClippingActive(!clippingActive)}
          title="Section clipping (X/Y/Z)"
        >
          ✂️ Clip
        </Button>
      </div>

      {/* Minimap */}
      {minimap && (
        <div className="absolute bottom-4 right-4 z-40">
          <Minimap />
        </div>
      )}

      {/* Modals and Panels */}
      <AboutModal open={aboutModalOpen} onOpenChange={setAboutModalOpen} />
      <LayerDrawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen} />
      <QualityPanel open={qualityPanelOpen} onOpenChange={setQualityPanelOpen} />
      <SunControls open={sunControlsOpen} onOpenChange={setSunControlsOpen} />
      <HelpOverlay open={helpOverlayOpen} onOpenChange={setHelpOverlayOpen} />

      {/* Cinematic Panel */}
      <CinematicPanel open={cinematicMode} onOpenChange={setCinematicMode} />

      {/* Cinematic Overlays */}
      <Overlays />

      {/* Tools */}
      {measureToolActive && <MeasureTool onClose={() => setMeasureToolActive(false)} />}
      {clippingActive && <SectionClipping onClose={() => setClippingActive(false)} />}

      {/* Toast notifications */}
      <Toaster />
    </>
  )
}
