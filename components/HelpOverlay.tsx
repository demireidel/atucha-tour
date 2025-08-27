"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HelpOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpOverlay({ open, onOpenChange }: HelpOverlayProps) {
  const shortcuts = [
    {
      category: "Layers",
      items: [
        { key: "1-6", description: "Toggle individual layers" },
        { key: "L", description: "Toggle layer panel" },
        { key: "E", description: "Toggle exploded view" },
      ],
    },
    {
      category: "Camera",
      items: [
        { key: "T", description: "Start camera tour" },
        { key: "R", description: "Reset camera position" },
        { key: "Mouse drag", description: "Rotate camera" },
        { key: "Mouse wheel", description: "Zoom in/out" },
        { key: "Right click + drag", description: "Pan camera" },
      ],
    },
    {
      category: "Tools",
      items: [
        { key: "S", description: "Take screenshot" },
        { key: "X/Y/Z", description: "Toggle clipping planes" },
        { key: "M", description: "Measurement tool" },
      ],
    },
    {
      category: "Cinematic",
      items: [
        { key: "C", description: "Toggle cinematic panel" },
        { key: "Space", description: "Play/pause current shot" },
        { key: "[/]", description: "Previous/next shot" },
        { key: "Shift+R", description: "Start WebM recording" },
        { key: "Shift+P", description: "Start PNG sequence" },
      ],
    },
    {
      category: "General",
      items: [
        { key: "?", description: "Show this help" },
        { key: "Esc", description: "Close panels/modals" },
        { key: "F", description: "Toggle fullscreen" },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-brand">Keyboard Shortcuts & Controls</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map(({ category, items }) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-lg border-b border-border pb-2">{category}</h3>
              <div className="space-y-2">
                {items.map(({ key, description }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{description}</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs font-mono">{key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <h4 className="font-semibold mb-2">Mouse Controls</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              • <strong>Left click + drag:</strong> Rotate around the scene
            </p>
            <p>
              • <strong>Right click + drag:</strong> Pan the camera
            </p>
            <p>
              • <strong>Mouse wheel:</strong> Zoom in and out
            </p>
            <p>
              • <strong>Double click:</strong> Focus on clicked object
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
