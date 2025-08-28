"use client"

import type React from "react"
import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class Scene3DErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] 3D Scene Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Error en la visualización 3D</h2>
              <p className="text-gray-300 mb-4">
                Hubo un problema al cargar la escena 3D. Esto puede deberse a limitaciones de hardware.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
