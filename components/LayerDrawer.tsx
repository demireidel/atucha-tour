"use client"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { X, Eye, EyeOff } from "lucide-react"

interface LayerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LayerDrawer({ open, onOpenChange }: LayerDrawerProps) {
  const { layers, toggleLayer, exploded, setExploded, annotations, setAnnotations, minimap, setMinimap } = useAppStore()

  if (!open) return null

  const layerConfig = [
    { key: "reactor" as const, label: "Reactor Building", hotkey: "1" },
    { key: "turbineHall" as const, label: "Turbine Hall", hotkey: "2" },
    { key: "auxiliary" as const, label: "Auxiliary Buildings", hotkey: "3" },
    { key: "switchyard" as const, label: "Switchyard", hotkey: "4" },
    { key: "waterfront" as const, label: "Water Systems", hotkey: "5" },
    { key: "terrain" as const, label: "Terrain & Roads", hotkey: "6" },
  ]

  return (
    <div className="absolute top-20 right-4 bottom-4 w-80 z-40">
      <Card className="h-full bg-custom-panel/95 backdrop-blur-sm border-border/50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-display font-semibold">Layer Controls</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Layer Toggles */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Visibility</h4>
            {layerConfig.map(({ key, label, hotkey }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">{hotkey}</kbd>
                  <span className="text-sm">{label}</span>
                </div>
                <Switch checked={layers[key]} onCheckedChange={() => toggleLayer(key)} />
              </div>
            ))}
          </div>

          {/* View Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">View Options</h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">E</kbd>
                <span className="text-sm">Exploded View</span>
              </div>
              <Switch checked={exploded} onCheckedChange={setExploded} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">L</kbd>
                <span className="text-sm">Annotations</span>
              </div>
              <Switch checked={annotations} onCheckedChange={setAnnotations} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Minimap</span>
              <Switch checked={minimap} onCheckedChange={setMinimap} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  Object.keys(layers).forEach((key) => {
                    if (!layers[key as keyof typeof layers]) {
                      toggleLayer(key as keyof typeof layers)
                    }
                  })
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                Show All
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  Object.keys(layers).forEach((key) => {
                    if (layers[key as keyof typeof layers]) {
                      toggleLayer(key as keyof typeof layers)
                    }
                  })
                }}
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hide All
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
