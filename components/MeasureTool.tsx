"use client"

import { useState } from "react"
import { useThree } from "@react-three/fiber"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import * as THREE from "three"

interface MeasureToolProps {
  onClose: () => void
}

export function MeasureTool({ onClose }: MeasureToolProps) {
  const [measurements, setMeasurements] = useState<
    Array<{
      start: THREE.Vector3
      end: THREE.Vector3
      distance: number
    }>
  >([])
  const [currentStart, setCurrentStart] = useState<THREE.Vector3 | null>(null)
  const { camera, raycaster, scene } = useThree()

  const handleClick = (event: MouseEvent) => {
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const point = intersects[0].point

      if (!currentStart) {
        setCurrentStart(point.clone())
      } else {
        const distance = currentStart.distanceTo(point)
        setMeasurements((prev) => [
          ...prev,
          {
            start: currentStart,
            end: point.clone(),
            distance,
          },
        ])
        setCurrentStart(null)
      }
    }
  }

  return (
    <>
      <div className="absolute top-20 left-4 z-40">
        <Card className="w-64 bg-custom-panel/95 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h3 className="font-display font-semibold">Measurement Tool</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Click two points to measure distance</p>

            {measurements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Measurements</h4>
                {measurements.map((measurement, index) => (
                  <div key={index} className="text-xs bg-muted/20 p-2 rounded">
                    <div>Distance: {measurement.distance.toFixed(2)}m</div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeasurements([])}
              disabled={measurements.length === 0}
            >
              Clear All
            </Button>
          </div>
        </Card>
      </div>

      {/* Click handler */}
      <div className="absolute inset-0 z-30" onClick={handleClick} style={{ cursor: "crosshair" }} />
    </>
  )
}
