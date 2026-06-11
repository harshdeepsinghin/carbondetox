'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Error boundary to catch runtime errors in the app layout.
 * Prevents a full white screen and shows a graceful recovery UI.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // In production, log to your error tracking service
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: 'var(--color-surface)' }}
          >
            <div
              className="glass-card p-8 max-w-md w-full text-center"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <div className="text-4xl mb-4" aria-hidden="true">🌿</div>
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Don&apos;t worry — your data is safe. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl font-semibold transition-all"
                style={{
                  background: 'var(--color-forest)',
                  color: 'white',
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
