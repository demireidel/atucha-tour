import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AppState {
  // Layer visibility
  layers: {
    reactor: boolean
    turbineHall: boolean
    auxiliary: boolean
    switchyard: boolean
    waterfront: boolean
    terrain: boolean
  }

  // Tour system
  currentTour: string | null
  tourProgress: number
  isInTour: boolean

  // Basic view controls
  exploded: boolean
  quality: "low" | "medium" | "high"

  // Sun and environment
  sunPosition: number
  environmentPreset: "city" | "studio" | "overcast"

  // Actions
  toggleLayer: (layer: keyof AppState["layers"]) => void
  setExploded: (exploded: boolean) => void
  setQuality: (quality: AppState["quality"]) => void
  setSunPosition: (position: number) => void
  setEnvironmentPreset: (preset: AppState["environmentPreset"]) => void
  setCurrentTour: (tour: string | null) => void
  setTourProgress: (progress: number) => void
  setIsInTour: (inTour: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      layers: {
        reactor: true,
        turbineHall: true,
        auxiliary: true,
        switchyard: true,
        waterfront: true,
        terrain: true,
      },

      currentTour: null,
      tourProgress: 0,
      isInTour: false,

      exploded: false,
      quality: "medium",

      sunPosition: 0.5,
      environmentPreset: "city",

      // Actions
      toggleLayer: (layer) =>
        set((state) => ({
          layers: { ...state.layers, [layer]: !state.layers[layer] },
        })),

      setExploded: (exploded) => set({ exploded }),
      setQuality: (quality) => set({ quality }),
      setSunPosition: (sunPosition) => set({ sunPosition }),
      setEnvironmentPreset: (environmentPreset) => set({ environmentPreset }),
      setCurrentTour: (currentTour) => set({ currentTour }),
      setTourProgress: (tourProgress) => set({ tourProgress }),
      setIsInTour: (isInTour) => set({ isInTour }),
    }),
    {
      name: "atucha-app-state",
      partialize: (state) => ({
        layers: state.layers,
        quality: state.quality,
        environmentPreset: state.environmentPreset,
      }),
    },
  ),
)
