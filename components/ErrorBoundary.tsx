// v3.7 - Fixed props inheritance error
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary robusto para capturar fallos críticos de inicialización de módulos.
 */
// Fix: Explicitly extending Component and adding constructor to resolve props/state typing issues
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: ''
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Verso System Crash:', error, errorInfo);
  }

  public render(): ReactNode {
    // Destructuring state to safely access errorMessage and hasError within the render scope.
    const { hasError, errorMessage } = this.state;

    if (hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          color: 'white',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#ef4444', letterSpacing: '-0.05em' }}>VERSO</h1>
          <p style={{ color: '#a1a1aa', margin: '10px 0 20px 0', fontSize: '14px' }}>Error crítico de inicialización</p>
          <div style={{ 
            padding: '16px', 
            background: '#18181b', 
            borderRadius: '12px', 
            fontSize: '11px', 
            fontFamily: 'monospace', 
            color: '#ef4444', 
            maxWidth: '500px', 
            wordBreak: 'break-word',
            border: '1px solid #27272a',
            marginBottom: '20px'
          }}>
            {errorMessage || 'Error en la conexión con los servicios de Firebase/React'}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#27272a', 
                color: 'white',
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '700', 
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
            <button 
              onClick={() => { 
                localStorage.clear(); 
                window.location.reload(); 
              }}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: 'white', 
                color: 'black',
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '700', 
                cursor: 'pointer'
              }}
            >
              Limpiar Caché y Reiniciar
            </button>
          </div>
        </div>
      );
    }

    // Fix: Accessing children via this.props explicitly
    return this.props.children;
  }
}