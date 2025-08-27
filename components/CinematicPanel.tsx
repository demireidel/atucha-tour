"use client"

import { useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAppStore } from "@/lib/store"
import { cinematicShots, progressToTimecode } from "@/lib/cinematics"
import { Play, Pause, Square, RotateCcw, Repeat, Camera, Video, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CinematicPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CinematicPanel({ open, onOpenChange }: CinematicPanelProps) {
  const {
    currentShot,
    setCurrentShot,
    shotProgress,
    setShotProgress,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isLooping,
    setIsLooping,
    currentFOV,
    setCurrentFOV,
    overlays,
    setOverlays,
    isRecording,
    setIsRecording,
    recordingType,
    setRecordingType,
  } = useAppStore()

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const { toast } = useToast()

  const currentShotData = cinematicShots[currentShot]

  const handlePlay = useCallback(() => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      toast({
        title: "Playback started",
        description: `Playing: ${currentShotData.name}`,
      })
    }
  }, [isPlaying, setIsPlaying, currentShotData.name, toast])

  const handleStop = useCallback(() => {
    setIsPlaying(false)
    setShotProgress(0)
  }, [setIsPlaying, setShotProgress])

  const handleReset = useCallback(() => {
    setShotProgress(0)
    toast({
      title: "Camera reset",
      description: "Camera reset to start position",
    })
  }, [setShotProgress, toast])

  const handlePreviousShot = useCallback(() => {
    const prevShot = currentShot > 0 ? currentShot - 1 : cinematicShots.length - 1
    setCurrentShot(prevShot)
    setShotProgress(0)
    setIsPlaying(false)
  }, [currentShot, setCurrentShot, setShotProgress, setIsPlaying])

  const handleNextShot = useCallback(() => {
    const nextShot = currentShot < cinematicShots.length - 1 ? currentShot + 1 : 0
    setCurrentShot(nextShot)
    setShotProgress(0)
    setIsPlaying(false)
  }, [currentShot, setCurrentShot, setShotProgress, setIsPlaying])

  const startWebMRecording = useCallback(async () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) {
      toast({
        title: "Recording error",
        description: "Canvas not found",
        variant: "destructive",
      })
      return
    }

    try {
      const stream = canvas.captureStream(currentShotData.fps)
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000,
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `atucha-${currentShotData.id}-${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)
        toast({
          title: "Recording saved!",
          description: "WebM recording has been downloaded",
        })
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingType("webm")
      toast({
        title: "Recording started",
        description: "WebM recording in progress",
      })
    } catch (error) {
      toast({
        title: "Recording error",
        description: "WebM recording not supported",
        variant: "destructive",
      })
    }
  }, [currentShotData, setIsRecording, setRecordingType, toast])

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      setMediaRecorder(null)
    }
    setIsRecording(false)
    setRecordingType(null)
  }, [mediaRecorder, setIsRecording, setRecordingType])

  const startPNGSequence = useCallback(() => {
    setIsRecording(true)
    setRecordingType("png")
    toast({
      title: "PNG sequence started",
      description: "Frame-by-frame capture in progress",
    })
    // PNG sequence implementation would capture frame-by-frame
  }, [setIsRecording, setRecordingType, toast])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return

      switch (event.code) {
        case "Space":
          event.preventDefault()
          handlePlay()
          break
        case "BracketLeft":
          event.preventDefault()
          handlePreviousShot()
          break
        case "BracketRight":
          event.preventDefault()
          handleNextShot()
          break
        case "KeyR":
          if (event.shiftKey) {
            event.preventDefault()
            startWebMRecording()
          }
          break
        case "KeyP":
          if (event.shiftKey) {
            event.preventDefault()
            startPNGSequence()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, handlePlay, handlePreviousShot, handleNextShot, startWebMRecording, startPNGSequence])

  if (!open) return null

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[800px]">
      <Card className="bg-custom-panel/95 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-display font-semibold">Cinematic Mode</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Shot Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={currentShot.toString()} onValueChange={(value) => setCurrentShot(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cinematicShots.map((shot, index) => (
                    <SelectItem key={shot.id} value={index.toString()}>
                      {shot.name} ({shot.duration}s)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {progressToTimecode(shotProgress, currentShotData.duration)} /{" "}
              {progressToTimecode(1, currentShotData.duration)}
            </div>
          </div>

          {/* Progress Scrubber */}
          <div className="space-y-2">
            <Slider
              value={[shotProgress * 100]}
              onValueChange={([value]) => setShotProgress(value / 100)}
              min={0}
              max={100}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">{currentShotData.description}</p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousShot} title="Previous shot ([)">
              ⏮
            </Button>

            <Button variant="outline" size="sm" onClick={handlePlay} title="Play/Pause (Space)">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={handleStop} title="Stop">
              <Square className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleReset} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant={isLooping ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLooping(!isLooping)}
              title="Loop"
            >
              <Repeat className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleNextShot} title="Next shot (])">
              ⏭
            </Button>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-4 gap-4">
            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Speed</label>
              <Select
                value={playbackSpeed.toString()}
                onValueChange={(value) => setPlaybackSpeed(Number.parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25×</SelectItem>
                  <SelectItem value="0.5">0.5×</SelectItem>
                  <SelectItem value="1">1×</SelectItem>
                  <SelectItem value="1.5">1.5×</SelectItem>
                  <SelectItem value="2">2×</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* FOV Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">FOV: {currentFOV.toFixed(0)}°</label>
              <Slider
                value={[currentFOV]}
                onValueChange={([value]) => setCurrentFOV(value)}
                min={20}
                max={120}
                step={1}
              />
            </div>

            {/* Overlays */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Overlays</label>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Letterbox</span>
                  <Switch
                    checked={overlays.letterbox}
                    onCheckedChange={(checked) => setOverlays({ letterbox: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Rule of Thirds</span>
                  <Switch
                    checked={overlays.ruleOfThirds}
                    onCheckedChange={(checked) => setOverlays({ ruleOfThirds: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Recording */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recording</label>
              <div className="flex gap-1">
                <Button
                  variant={recordingType === "webm" ? "destructive" : "outline"}
                  size="sm"
                  onClick={isRecording ? stopRecording : startWebMRecording}
                  title="WebM Recording (Shift+R)"
                >
                  <Video className="h-3 w-3" />
                </Button>
                <Button
                  variant={recordingType === "png" ? "destructive" : "outline"}
                  size="sm"
                  onClick={recordingType === "png" ? stopRecording : startPNGSequence}
                  title="PNG Sequence (Shift+P)"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
