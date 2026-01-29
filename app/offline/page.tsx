'use client';

import { useEffect, useState } from 'react';

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOnline) {
            window.location.reload();
        }
    }, [isOnline]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                            />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">You're Offline</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        No internet connection detected. Some features may not be available.
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3 text-left p-4 bg-white rounded-lg border">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Cached Data Available</h3>
                            <p className="text-sm text-gray-600">
                                You can still view previously loaded pages and data
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-left p-4 bg-white rounded-lg border">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Limited Functionality</h3>
                            <p className="text-sm text-gray-600">
                                Creating or updating data requires an internet connection
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => (window.location.href = '/dashboard')}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                        <p className="text-sm text-gray-600">
                            {isOnline ? 'Back Online - Reloading...' : 'Waiting for connection...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
