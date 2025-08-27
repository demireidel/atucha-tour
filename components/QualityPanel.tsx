"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAppStore } from "@/lib/store"
import { X, Zap, Settings, Sparkles, Activity, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { detectDeviceCapabilities, getRecommendedQuality, PerformanceMonitor, saveQualitySettings } from "@/lib/quality"

interface QualityPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QualityPanel({ open, onOpenChange }: QualityPanelProps) {
  const {
    quality,
    setQuality,
    shadows,
    postProcessing,
    autoQuality,
    setAutoQuality,
    performanceHUD,
    setPerformanceHUD,
    contextLostCount,
  } = useAppStore()

  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof detectDeviceCapabilities> | null>(null)
  const [monitor] = useState(() => new PerformanceMonitor())
  const [currentFps, setCurrentFps] = useState(60)
  const [showDowngradePrompt, setShowDowngradePrompt] = useState(false)

  useEffect(() => {
    // Detect device capabilities on mount
    const capabilities = detectDeviceCapabilities()
    setDeviceInfo(capabilities)

    // Auto-set quality if enabled
    if (autoQuality && quality === "auto") {
      const recommended = getRecommendedQuality(capabilities)
      setQuality(recommended)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = monitor.onFpsUpdate((fps) => {
      setCurrentFps(fps)

      // Auto-downgrade if performance is poor
      if (autoQuality && monitor.shouldDowngrade() && quality !== "low") {
        setShowDowngradePrompt(true)
      }
    })

    return unsubscribe
  }, [monitor, autoQuality, quality])

  const handleQualityChange = (newQuality: typeof quality) => {
    setQuality(newQuality)
    saveQualitySettings(newQuality)
    setShowDowngradePrompt(false)
  }

  const handleDowngrade = () => {
    const currentIndex = ["low", "medium", "high"].indexOf(quality as string)
    if (currentIndex > 0) {
      const newQuality = ["low", "medium", "high"][currentIndex - 1] as typeof quality
      handleQualityChange(newQuality)
    }
    setShowDowngradePrompt(false)
  }

  if (!open) return null

  const qualityPresets = [
    {
      key: "low" as const,
      label: "Low",
      icon: Zap,
      description: "DPR=1, no shadows, no post-FX",
    },
    {
      key: "medium" as const,
      label: "Medium",
      icon: Settings,
      description: "FXAA, 1024px shadows, balanced",
    },
    {
      key: "high" as const,
      label: "High",
      icon: Sparkles,
      description: "SMAA + SSAO + Bloom, 2048px shadows",
    },
    {
      key: "auto" as const,
      label: "Auto",
      icon: Activity,
      description: "Adapts based on device performance",
    },
  ]

  const fpsColor = currentFps >= 50 ? "text-green-400" : currentFps >= 30 ? "text-yellow-400" : "text-red-400"

  return (
    <div className="absolute top-20 right-4 w-80 z-40">
      <Card className="bg-custom-panel/95 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-display font-semibold">Quality Settings</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Performance Downgrade Prompt */}
          {showDowngradePrompt && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Low Performance Detected</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Average FPS is below 30. Would you like to lower quality settings?
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDowngrade}>
                  Lower Quality
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowDowngradePrompt(false)}>
                  Keep Current
                </Button>
              </div>
            </div>
          )}

          {/* Quality Presets */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              {qualityPresets.map(({ key, label, icon: Icon, description }) => (
                <Button
                  key={key}
                  variant={quality === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQualityChange(key)}
                  className="flex flex-col h-auto p-3"
                  title={description}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Auto Quality Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Auto Quality</span>
              <p className="text-xs text-muted-foreground">Automatically adjust based on performance</p>
            </div>
            <Switch checked={autoQuality} onCheckedChange={setAutoQuality} />
          </div>

          {/* Performance HUD Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Performance HUD</span>
              <p className="text-xs text-muted-foreground">Show FPS and memory usage</p>
            </div>
            <Switch checked={performanceHUD} onCheckedChange={setPerformanceHUD} />
          </div>

          {/* Current Performance */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Current Performance</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className={fpsColor}>{currentFps}</span>
              </div>
              <div className="flex justify-between">
                <span>Shadows:</span>
                <span>{shadows ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="flex justify-between">
                <span>Post Processing:</span>
                <span>{postProcessing ? "Enabled" : "Disabled"}</span>
              </div>
              {contextLostCount > 0 && (
                <div className="flex justify-between text-yellow-400">
                  <span>Context Lost:</span>
                  <span>{contextLostCount}x</span>
                </div>
              )}
            </div>
          </div>

          {/* Device Info */}
          {deviceInfo && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Device Info</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Performance Score:</span>
                  <span>{deviceInfo.score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span>{deviceInfo.memory}GB</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Cores:</span>
                  <span>{deviceInfo.cores}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile:</span>
                  <span>{deviceInfo.mobile ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
