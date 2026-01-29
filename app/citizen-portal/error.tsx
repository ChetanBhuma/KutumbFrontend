'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <Card className="w-full max-w-md border-red-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-red-700">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        We encountered an unexpected error while loading this page.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={() => window.location.href = '/citizen-portal'}>
                            Go Home
                        </Button>
                        <Button onClick={() => reset()}>
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
