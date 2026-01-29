/**
 * Performance Optimization Utilities
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';


/**
 * Debounce function - delays execution until after wait time has elapsed
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - ensures function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * React hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * React hook for throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(
            () => {
                if (Date.now() - lastRan.current >= limit) {
                    setThrottledValue(value);
                    lastRan.current = Date.now();
                }
            },
            limit - (Date.now() - lastRan.current)
        );

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}

/**
 * React hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
    ref: React.RefObject<Element>,
    options?: IntersectionObserverInit
): boolean {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref, options]);

    return isIntersecting;
}

/**
 * React hook for lazy loading images
 */
export function useLazyImage(src: string): {
    imageSrc: string | undefined;
    isLoading: boolean;
    error: boolean;
} {
    const [imageSrc, setImageSrc] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
        };

        img.onerror = () => {
            setError(true);
            setIsLoading(false);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    return { imageSrc, isLoading, error };
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
}

/**
 * React hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}


/**
 * React hook for window size
 */
export function useWindowSize(): { width: number; height: number } {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = throttle(() => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }, 200);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

/**
 * React hook for media query
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

/**
 * Optimize array operations
 */
export const arrayUtils = {
    /**
     * Chunk array into smaller arrays
     */
    chunk<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    /**
     * Remove duplicates from array
     */
    unique<T>(array: T[]): T[] {
        return Array.from(new Set(array));
    },

    /**
     * Group array by key
     */
    groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
        return array.reduce((result, item) => {
            const groupKey = String(item[key]);
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {} as Record<string, T[]>);
    },
};

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
    private marks: Map<string, number> = new Map();

    /**
     * Start measuring
     */
    start(label: string): void {
        this.marks.set(label, performance.now());
    }

    /**
     * End measuring and return duration
     */
    end(label: string): number {
        const startTime = this.marks.get(label);
        if (!startTime) {
            console.warn(`No start mark found for: ${label}`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(label);

        if (process.env.NODE_ENV === 'development') {
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Measure async function
     */
    async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
        this.start(label);
        try {
            const result = await fn();
            this.end(label);
            return result;
        } catch (error) {
            this.end(label);
            throw error;
        }
    }
}

/**
 * Local storage with expiration
 */
export const storage = {
    set(key: string, value: any, expirationMinutes?: number): void {
        if (typeof window === 'undefined') return;
        const item = {
            value,
            expiration: expirationMinutes
                ? Date.now() + expirationMinutes * 60 * 1000
                : null,
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    get<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);
            if (item.expiration && Date.now() > item.expiration) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        } catch {
            return null;
        }
    },

    remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },

    clear(): void {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    },
};

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

