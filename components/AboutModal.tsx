"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AboutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-brand">Atucha II Nuclear Power Plant</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Interactive 3D visualization of Argentina's Atucha II nuclear power plant exterior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">About the Plant</h3>
            <p className="text-muted-foreground leading-relaxed">
              Atucha II is a pressurized heavy water reactor (PHWR) located in Lima, Buenos Aires Province, Argentina.
              This visualization shows the exterior structures including the reactor containment building, turbine hall,
              auxiliary systems, and supporting infrastructure.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Parametric 3D geometry with real-time controls</li>
              <li>Layer-based visibility system</li>
              <li>Cinematic camera system with predefined shots</li>
              <li>XR/AR support for immersive viewing</li>
              <li>Quality presets for optimal performance</li>
              <li>Measurement and section clipping tools</li>
            </ul>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">⚠️ Safety Disclaimer</h3>
            <p className="text-destructive text-xs leading-relaxed">
              This is an educational visualization for demonstration purposes only. It does not represent actual plant
              specifications, safety systems, or operational procedures. Real nuclear facilities have extensive safety
              measures and security protocols not depicted here.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Controls</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p>
                  <kbd className="bg-muted px-1 rounded">1-6</kbd> Toggle layers
                </p>
                <p>
                  <kbd className="bg-muted px-1 rounded">L</kbd> Layer panel
                </p>
                <p>
                  <kbd className="bg-muted px-1 rounded">E</kbd> Exploded view
                </p>
                <p>
                  <kbd className="bg-muted px-1 rounded">S</kbd> Screenshot
                </p>
              </div>
              <div>
                <p>
                  <kbd className="bg-muted px-1 rounded">T</kbd> Camera tour
                </p>
                <p>
                  <kbd className="bg-muted px-1 rounded">C</kbd> Cinematic mode
                </p>
                <p>
                  <kbd className="bg-muted px-1 rounded">?</kbd> Help
                </p>
                <p>
                  <kbd className="bg-muted px-1 rounded">R</kbd> Reset camera
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
