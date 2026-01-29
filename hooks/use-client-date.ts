import { useState, useEffect } from 'react';

/**
 * Hook to safely get current date on client side only
 * Prevents hydration mismatch errors
 * 
 * @example
 * const currentDate = useClientDate();
 * // Returns '' on server, actual date on client
 */
export function useClientDate(format: 'iso' | 'locale' | 'date' = 'iso'): string {
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        const now = new Date();
        switch (format) {
            case 'iso':
                setDate(now.toISOString());
                break;
            case 'locale':
                setDate(now.toLocaleDateString());
                break;
            case 'date':
                setDate(now.toISOString().split('T')[0]);
                break;
            default:
                setDate(now.toISOString());
        }
    }, [format]);

    return date;
}

/**
 * Hook to get current timestamp
 * Prevents hydration mismatch errors
 */
export function useClientTimestamp(): number {
    const [timestamp, setTimestamp] = useState<number>(0);

    useEffect(() => {
        setTimestamp(Date.now());
    }, []);

    return timestamp;
}

/**
 * Hook for date that updates on mount
 * Returns a tuple [date, setDate] similar to useState
 */
export function useSafeDate(initialFormat: 'iso' | 'locale' | 'date' = 'iso'): [string, (date: string) => void] {
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        const now = new Date();
        switch (initialFormat) {
            case 'iso':
                setDate(now.toISOString());
                break;
            case 'locale':
                setDate(now.toLocaleDateString());
                break;
            case 'date':
                setDate(now.toISOString().split('T')[0]);
                break;
        }
    }, [initialFormat]);

    return [date, setDate];
}
