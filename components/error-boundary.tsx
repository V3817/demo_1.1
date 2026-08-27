"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 border rounded-lg bg-red-50 text-red-900">
                    <h2 className="text-2xl font-bold">Something went wrong</h2>
                    <p className="max-w-md text-sm opacity-80">
                        {this.state.error?.message || "An unexpected error occurred in the dashboard."}
                    </p>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            this.setState({ hasError: false });
                            window.location.reload();
                        }}
                    >
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
