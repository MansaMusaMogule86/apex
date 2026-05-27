"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, message };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030305] flex items-center justify-center px-6">
          <div className="text-center space-y-4 max-w-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/70">
              APEX Intelligence Platform
            </p>
            <h1 className="font-serif text-3xl font-light text-white">
              System initialising
            </h1>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              The intelligence layer is connecting to live data sources.
              Please refresh to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-[2px] border border-[#c9a84c]/30 bg-[#c9a84c]/[0.08] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c9a84c] hover:bg-[#c9a84c]/15 transition-all"
            >
              Reload platform
            </button>
            {process.env.NODE_ENV === "development" && (
              <p className="mt-4 text-[10px] text-red-400/60 font-mono break-all">
                {this.state.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
