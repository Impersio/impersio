import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isClerkError = this.state.error?.message.includes("@clerk/clerk-react");

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Something went wrong</h2>
            <p className="text-muted mb-6">
              {isClerkError 
                ? "Clerk Authentication is not configured correctly. Please add your Publishable Key to the environment variables."
                : "An unexpected error occurred while rendering the application."}
            </p>
            {isClerkError && (
              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 mb-6 text-left overflow-x-auto">
                <code className="text-xs text-scira-accent">
                  VITE_CLERK_PUBLISHABLE_KEY is missing
                </code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-background rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
