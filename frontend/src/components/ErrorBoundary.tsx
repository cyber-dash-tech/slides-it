import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[slides-it] Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="h-screen flex flex-col items-center justify-center gap-4 p-8"
          style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
        >
          <p className="text-base font-semibold">Something went wrong</p>
          <pre
            className="text-xs max-w-lg overflow-auto p-3 rounded"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          >
            {this.state.error.message}
          </pre>
          <button
            className="text-sm px-4 py-1.5 rounded"
            style={{ background: 'var(--btn-send)', color: '#fff' }}
            onClick={() => this.setState({ error: null })}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
