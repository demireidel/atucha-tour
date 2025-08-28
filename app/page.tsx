"use client"

import type React from "react"

import { Suspense, useState } from "react"
import dynamic from "next/dynamic"
import { Canvas } from "@react-three/fiber"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Users, Shield, Zap, Building, AlertTriangle, Loader2 } from "lucide-react"
import { Scene3DErrorBoundary } from "@/components/Scene3DErrorBoundary"
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor"

const AtuchaScene = dynamic(() => import("@/components/AtuchaScene"), { ssr: false })

const TOURS = [
  {
    id: "reactor-core",
    title: "Recorrido por el Núcleo del Reactor",
    description:
      "Caminá por el corazón de la generación de energía nuclear, explorando el recipiente del reactor y los sistemas de control.",
    duration: "12 minutos",
    highlights: ["Recipiente del Reactor", "Barras de Control", "Generadores de Vapor"],
    icon: <Zap className="h-6 w-6" />,
    difficulty: "Principiante",
  },
  {
    id: "turbine-hall",
    title: "Experiencia en la Sala de Turbinas",
    description: "Descubrí cómo la energía nuclear se transforma en electricidad a través de turbogeneradores masivos.",
    duration: "10 minutos",
    highlights: ["Turbinas de Vapor", "Sala de Generadores", "Conversión de Energía"],
    icon: <Building className="h-6 w-6" />,
    difficulty: "Intermedio",
  },
  {
    id: "safety-systems",
    title: "Tour de Sistemas de Seguridad",
    description:
      "Aprendé sobre las múltiples capas de seguridad que protegen tanto a los trabajadores como al ambiente.",
    duration: "15 minutos",
    highlights: ["Sistemas de Emergencia", "Contención", "Protocolos de Seguridad"],
    icon: <Shield className="h-6 w-6" />,
    difficulty: "Avanzado",
  },
  {
    id: "control-room",
    title: "Operaciones en la Sala de Control",
    description: "Entrá al centro neurálgico donde los operadores monitorean y controlan toda la instalación.",
    duration: "8 minutos",
    highlights: ["Paneles de Control", "Sistemas de Monitoreo", "Centro de Operaciones"],
    icon: <Users className="h-6 w-6" />,
    difficulty: "Intermedio",
  },
  {
    id: "complete-facility",
    title: "Vista General Completa de la Instalación",
    description: "Un recorrido integral que cubre todos los sistemas principales y áreas de la planta Atucha II.",
    duration: "25 minutos",
    highlights: ["Tour Completo de la Planta", "Todos los Sistemas Principales", "Vista General Integral"],
    icon: <Play className="h-6 w-6" />,
    difficulty: "Todos los Niveles",
  },
]

export default function HomePage() {
  const [selectedTour, setSelectedTour] = useState<string | null>(null)
  const [isInTour, setIsInTour] = useState(false)
  const [isSceneLoading, setIsSceneLoading] = useState(false)
  const { fps, memoryUsage } = usePerformanceMonitor()

  const startTour = (tourId: string) => {
    setSelectedTour(tourId)
    setIsInTour(true)
    setIsSceneLoading(true)
  }

  const exitTour = () => {
    setSelectedTour(null)
    setIsInTour(false)
    setIsSceneLoading(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent, tourId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      startTour(tourId)
    }
  }

  if (isInTour) {
    return (
      <main className="relative h-screen w-full overflow-hidden bg-background">
        <Scene3DErrorBoundary
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-900 text-white">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error en la visualización 3D</h2>
                <p className="text-gray-300 mb-4 max-w-md">
                  Hubo un problema al cargar la escena 3D. Esto puede deberse a limitaciones de hardware o problemas de
                  compatibilidad con WebGL.
                </p>
                <div className="space-y-2">
                  <Button onClick={exitTour} variant="secondary">
                    Volver al Inicio
                  </Button>
                  <p className="text-sm text-gray-400">
                    FPS: {fps} | Memoria: {memoryUsage.toFixed(1)}MB
                  </p>
                </div>
              </div>
            </div>
          }
        >
          {isSceneLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cargando Experiencia 3D</h3>
                <p className="text-muted-foreground">Preparando el tour virtual...</p>
              </div>
            </div>
          )}

          <Canvas
            shadows
            camera={{ position: [50, 30, 50], fov: 50 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            onCreated={() => setIsSceneLoading(false)}
          >
            <Suspense fallback={null}>
              <AtuchaScene tourId={selectedTour} />
            </Suspense>
          </Canvas>
        </Scene3DErrorBoundary>

        <div className="absolute top-4 left-4 z-10">
          <Button onClick={exitTour} variant="secondary">
            Salir del Tour
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-4 right-4 z-10">
            <Card className="bg-card/90 backdrop-blur-sm">
              <CardContent className="p-2">
                <div className="text-xs space-y-1">
                  <div>FPS: {fps}</div>
                  <div>Memoria: {memoryUsage.toFixed(1)}MB</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-card/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">{TOURS.find((t) => t.id === selectedTour)?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {TOURS.find((t) => t.id === selectedTour)?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {TOURS.find((t) => t.id === selectedTour)?.duration}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 opacity-20" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 text-balance">
            Explorá la Maravilla de Ingeniería de <span className="text-primary">Atucha II</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
            Sumate a nuestros Tours Virtuales Guiados Premium y descubrí la tecnología de vanguardia detrás de la
            instalación nuclear más avanzada de Argentina.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" })}
          >
            Descubrir Tours
          </Button>
        </div>
      </section>

      <section id="tours" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4">Tours Virtuales Premium</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elegí entre nuestros tours diseñados por expertos, cada uno pensado para brindar conocimientos profundos
              sobre diferentes aspectos de la generación de energía nuclear.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TOURS.map((tour) => (
              <Card
                key={tour.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                tabIndex={0}
                role="button"
                aria-label={`Comenzar tour: ${tour.title}`}
                onKeyDown={(e) => handleKeyDown(e, tour.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">{tour.icon}</div>
                    <Badge variant="secondary">{tour.difficulty}</Badge>
                  </div>
                  <CardTitle className="font-display text-xl">{tour.title}</CardTitle>
                  <CardDescription className="text-base">{tour.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {tour.duration}
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Puntos Destacados del Tour:</p>
                      <div className="flex flex-wrap gap-1">
                        {tour.highlights.map((highlight) => (
                          <Badge key={highlight} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => startTour(tour.id)}
                      aria-describedby={`tour-${tour.id}-description`}
                    >
                      Comenzar Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl mb-6">Seguridad y Experiencia</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Nuestros tours virtuales están desarrollados en colaboración con ingenieros nucleares y expertos en
            seguridad, asegurando una representación precisa de los protocolos de seguridad y procedimientos operativos.
            Experimentá los más altos estándares de educación en seguridad nuclear.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Seguridad Primero</h3>
              <p className="text-muted-foreground">Múltiples sistemas y protocolos de seguridad</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Innovación</h3>
              <p className="text-muted-foreground">Tecnología nuclear de vanguardia</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Experiencia</h3>
              <p className="text-muted-foreground">Guiado por profesionales de la industria</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
