"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = { hasError: boolean };

/** Prevents a failed intelligence Convex query from crashing the whole page. */
export class IntelligenceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[Intelligence] section fallback:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)]/60 px-4 py-3 text-center text-xs text-[var(--text-muted)]">
            Live intel temporarily unavailable
          </div>
        )
      );
    }
    return this.props.children;
  }
}
