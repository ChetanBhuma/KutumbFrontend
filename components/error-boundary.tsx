'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: any): State {
        let normalizedError: Error;
        if (error instanceof Error) {
            normalizedError = error;
        } else if (typeof error === 'string') {
            normalizedError = new Error(error);
        } else if (error && typeof error === 'object') {
            if ('message' in error && typeof error.message === 'string') {
                normalizedError = new Error(error.message);
            } else if (error instanceof Event || (error && 'type' in error)) {
                normalizedError = new Error(`DOM Event error (${error.type || 'unknown event'})`);
            } else {
                normalizedError = new Error(JSON.stringify(error));
            }
        } else {
            normalizedError = new Error('An unexpected application error occurred');
        }

        return {
            hasError: true,
            error: normalizedError,
            errorInfo: null,
        };
    }

    componentDidCatch(error: any, errorInfo: ErrorInfo) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', normalized, errorInfo);
        }

        // Call custom error handler if provided
        this.props.onError?.(normalized, errorInfo);

        // Update state with error info
        this.setState({
            errorInfo,
        });

        // TODO: Send error to logging service in production
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                    <Card className="max-w-2xl w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                                <div>
                                    <CardTitle>Something went wrong</CardTitle>
                                    <CardDescription>
                                        An unexpected error occurred. Please try again.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                    <p className="font-semibold text-sm mb-2">Error Details:</p>
                                    <pre className="text-xs overflow-auto max-h-40 text-destructive">
                                        {this.state.error.message || this.state.error.toString()}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-xs font-medium">
                                                Component Stack
                                            </summary>
                                            <pre className="text-xs mt-2 overflow-auto max-h-40">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button onClick={this.handleReset} className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}
