import React from "react";

type ErrorBoundaryState = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-20 max-w-xl px-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
            <h1 className="text-xl font-semibold text-zinc-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-zinc-600">
              A runtime error occurred. Check the developer console for details. You can refresh the page to try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

