import { Component, type ErrorInfo, type ReactNode } from 'react'

import { AlertTriangle, Download, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface AppErrorBoundaryProps {
  children: ReactNode
  onExportBackup: () => Promise<void>
}

interface AppErrorBoundaryState {
  hasError: boolean
  isExportingBackup: boolean
  exportError: string | null
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    isExportingBackup: false,
    exportError: null,
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
      isExportingBackup: false,
      exportError: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StingFit route rendering failed.', error, errorInfo)
  }

  handleExportBackup = async () => {
    this.setState({ isExportingBackup: true, exportError: null })

    try {
      await this.props.onExportBackup()
      this.setState({ isExportingBackup: false })
    } catch (error) {
      this.setState({
        isExportingBackup: false,
        exportError: error instanceof Error ? error.message : 'StingFit nedokázal exportovať zálohu.',
      })
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center p-4">
        <div className="card-surface w-full max-w-2xl p-6 sm:p-8">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-text-primary dark:text-text-primary-dark">Táto obrazovka narazila na problém</h1>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            Zvyšok StingFit je stále dostupný. Pred ďalším pokusom môžeš aplikáciu obnoviť alebo exportovať čerstvú zálohu.
          </p>

          {this.state.exportError ? (
            <p className="mt-4 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {this.state.exportError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button leadingIcon={<RefreshCcw className="size-4" />} onClick={() => window.location.reload()}>
              Obnoviť
            </Button>
            <Button
              variant="secondary"
              leadingIcon={<Download className="size-4" />}
              onClick={() => void this.handleExportBackup()}
              disabled={this.state.isExportingBackup}
            >
              {this.state.isExportingBackup ? 'Exportujem zálohu…' : 'Exportovať zálohu'}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
