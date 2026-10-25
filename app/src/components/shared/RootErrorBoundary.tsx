import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { hasError: true, message }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink-900">Something went wrong</h1>
                <p className="mt-2 text-ink-500">The application encountered an unexpected error.</p>
                {this.state.message && (
                  <p className="mt-2 text-sm text-ink-400 font-mono">{this.state.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-palm-600 px-5 py-2.5 text-white font-medium transition-colors hover:bg-palm-700 focus:outline-none focus:ring-2 focus:ring-palm-500 focus:ring-offset-2"
              >
                Reload Application
              </button>
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-4 text-sm text-ink-500 leading-relaxed max-w-md mx-auto">
                  The intelligence layer is connecting to live data sources. Please refresh to try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}