"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

interface SectionClippingProps {
  onClose: () => void
}

export function SectionClipping({ onClose }: SectionClippingProps) {
  const [clippingPlanes, setClippingPlanes] = useState({
    x: { enabled: false, position: 0 },
    y: { enabled: false, position: 0 },
    z: { enabled: false, position: 0 },
  })

  const updatePlane = (axis: "x" | "y" | "z", enabled: boolean, position?: number) => {
    setClippingPlanes((prev) => ({
      ...prev,
      [axis]: {
        enabled,
        position: position !== undefined ? position : prev[axis].position,
      },
    }))
  }

  return (
    <div className="absolute top-20 left-4 z-40">
      <Card className="w-80 bg-custom-panel/95 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-display font-semibold">Section Clipping</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{axis}-Axis</span>
                <Switch
                  checked={clippingPlanes[axis].enabled}
                  onCheckedChange={(enabled) => updatePlane(axis, enabled)}
                />
              </div>

              {clippingPlanes[axis].enabled && (
                <div className="space-y-2">
                  <Slider
                    value={[clippingPlanes[axis].position]}
                    onValueChange={([value]) => updatePlane(axis, true, value)}
                    min={-100}
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-100</span>
                    <span>{clippingPlanes[axis].position}</span>
                    <span>100</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setClippingPlanes({
                x: { enabled: false, position: 0 },
                y: { enabled: false, position: 0 },
                z: { enabled: false, position: 0 },
              })
            }
          >
            Reset All
          </Button>
        </div>
      </Card>
    </div>
  )
}
