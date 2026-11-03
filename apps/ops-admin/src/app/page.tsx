'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import PrototypeHubPage from './prototype/page';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class PortalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kasper Portal ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black text-xl">
              K
            </div>
            <h2 className="text-xl font-black text-slate-900">Portal View Recovered</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected view state occurred. Click below to return cleanly to the main launchpad.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = window.location.pathname;
                  }
                }}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20"
              >
                Return to Launchpad
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                }}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Home() {
  return (
    <PortalErrorBoundary>
      <PrototypeHubPage />
    </PortalErrorBoundary>
  );
}
