"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useAppStore } from "@/lib/store"
import { X, Sun, Cloud, Building } from "lucide-react"

interface SunControlsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SunControls({ open, onOpenChange }: SunControlsProps) {
  const { sunPosition, setSunPosition, sunPreset, setSunPreset, environmentPreset, setEnvironmentPreset } =
    useAppStore()

  if (!open) return null

  const sunPresets = [
    { key: "noon" as const, label: "Noon", position: 0.5, icon: Sun },
    { key: "golden" as const, label: "Golden Hour", position: 0.8, icon: Sun },
    { key: "overcast" as const, label: "Overcast", position: 0.5, icon: Cloud },
  ]

  const environmentPresets = [
    { key: "city" as const, label: "City", icon: Building },
    { key: "studio" as const, label: "Studio", icon: Sun },
    { key: "sunset" as const, label: "Sunset", icon: Sun },
  ]

  return (
    <div className="absolute top-20 right-4 w-80 z-40">
      <Card className="bg-custom-panel/95 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-display font-semibold">Sun & Environment</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Sun Position */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Sun Position</h4>
            <Slider
              value={[sunPosition]}
              onValueChange={([value]) => setSunPosition(value)}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dawn</span>
              <span>Noon</span>
              <span>Dusk</span>
            </div>
          </div>

          {/* Sun Presets */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Sun Presets</h4>
            <div className="grid grid-cols-3 gap-2">
              {sunPresets.map(({ key, label, position, icon: Icon }) => (
                <Button
                  key={key}
                  variant={sunPreset === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSunPreset(key)
                    setSunPosition(position)
                  }}
                  className="flex flex-col h-auto p-2"
                >
                  <Icon className="h-3 w-3 mb-1" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Environment</h4>
            <div className="grid grid-cols-3 gap-2">
              {environmentPresets.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={environmentPreset === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEnvironmentPreset(key)}
                  className="flex flex-col h-auto p-2"
                >
                  <Icon className="h-3 w-3 mb-1" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
