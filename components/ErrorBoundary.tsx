'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorLogger from '@/lib/utils/error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches React rendering errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error logging system
    ErrorLogger.error(
      `React Error Boundary caught error${this.props.context ? ` in ${this.props.context}` : ''}`,
      error,
      this.props.context || 'ErrorBoundary',
      {
        componentStack: errorInfo.componentStack,
      }
    );

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold mb-2 text-red-400">
                Quantum Fluctuation Detected
              </h1>
              <p className="text-gray-300">
                Something went wrong with the quantum casino.{' '}
                {this.props.context && (
                  <span className="text-gray-400">
                    (Error in: {this.props.context})
                  </span>
                )}
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-red-500/20">
                <div className="text-sm text-red-300 font-mono">
                  {this.state.error.toString()}
                </div>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                      Component Stack
                    </summary>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              <a href="/" className="hover:text-cyan-400 transition-colors">
                ← Return to Casino Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  context?: string
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary context={context || Component.displayName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${context || Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
