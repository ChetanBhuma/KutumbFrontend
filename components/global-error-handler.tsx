'use client';

import { useEffect } from 'react';

/**
 * GlobalErrorHandler catches and prevents unhandled DOM Event rejections
 * and event errors from bubbling up to the Next.js runtime error overlay as "[object Event]".
 * All real Error instances are preserved and logged normally.
 */
export function GlobalErrorHandler() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason;
            // Check if the rejection reason is an Event object or non-Error DOM event
            const isEventObject =
                reason instanceof Event ||
                (reason && typeof reason === 'object' && Object.prototype.toString.call(reason) === '[object Event]') ||
                (reason && typeof reason === 'object' && !('message' in reason) && !('stack' in reason) && 'type' in reason);

            if (isEventObject) {
                console.warn('[GlobalErrorHandler] Prevented unhandled DOM Event rejection from crashing overlay:', reason);
                event.preventDefault();
            }
        };

        const handleError = (event: ErrorEvent) => {
            const error = event.error;
            const isEventError =
                error instanceof Event ||
                (error && typeof error === 'object' && Object.prototype.toString.call(error) === '[object Event]') ||
                (typeof event.message === 'string' && event.message.includes('[object Event]'));

            if (isEventError) {
                console.warn('[GlobalErrorHandler] Prevented DOM Event error from crashing overlay:', event);
                event.preventDefault();
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleError);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleError);
        };
    }, []);

    return null;
}
