import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Algo salió mal 😔</h1>
            <p className="mb-4 text-zinc-300">
              La aplicación ha encontrado un error crítico y no puede continuar.
            </p>
            <div className="bg-black/50 p-4 rounded-lg text-left overflow-auto font-mono text-sm mb-6 border border-zinc-800">
              <p className="text-red-400 font-bold mb-2">Error Técnico:</p>
              {this.state.error?.toString()}
              <p className="mt-4 text-zinc-500 text-xs">
                 Si ves "process is not defined", es un problema de configuración de entorno (Vite).
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}