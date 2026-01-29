// Frontend Performance Utilities
import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce hook for performance optimization
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
 * Throttle hook for limiting function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const lastRan = useRef(Date.now());

    return useCallback(
        (...args: any[]) => {
            if (Date.now() - lastRan.current >= delay) {
                callback(...args);
                lastRan.current = Date.now();
            }
        },
        [callback, delay]
    ) as T;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
    ref: React.RefObject<Element>,
    options?: IntersectionObserverInit
) {
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
 * Virtual scroll hook for large lists
 */
export function useVirtualScroll<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
) {
    const [scrollTop, setScrollTop] = useState(0);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
    const visibleItems = items.slice(startIndex, endIndex);

    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
        visibleItems,
        totalHeight,
        offsetY,
        onScroll: (e: React.UIEvent<HTMLDivElement>) => {
            setScrollTop(e.currentTarget.scrollTop);
        },
    };
}

/**
 * Image lazy loading with placeholder
 */
export function useLazyImage(src: string, placeholder?: string) {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
        };
    }, [src]);

    return { imageSrc, isLoaded };
}

/**
 * Memoized selector hook
 */
export function useMemoizedSelector<T, R>(
    data: T,
    selector: (data: T) => R,
    deps: any[] = []
): R {
    return useMemo(() => selector(data), [data, ...deps]);
}

/**
 * Prefetch data on hover
 */
export function usePrefetch<T>(
    fetchFn: () => Promise<T>
): [(el: Element | null) => void, T | null] {
    const [data, setData] = useState<T | null>(null);
    const prefetchedRef = useRef(false);

    const handleHover = useCallback(() => {
        if (!prefetchedRef.current) {
            fetchFn().then(setData);
            prefetchedRef.current = true;
        }
    }, [fetchFn]);

    const ref = useCallback(
        (el: Element | null) => {
            if (el) {
                el.addEventListener('mouseenter', handleHover);
                return () => el.removeEventListener('mouseenter', handleHover);
            }
        },
        [handleHover]
    );

    return [ref, data];
}

/**
 * Performance measurement hook
 */
export function usePerformance(name: string) {
    useEffect(() => {
        performance.mark(`${name}-start`);

        return () => {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);

            const measure = performance.getEntriesByName(name)[0];
            if (measure) {
                console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
            }

            performance.clearMarks(`${name}-start`);
            performance.clearMarks(`${name}-end`);
            performance.clearMeasures(name);
        };
    }, [name]);
}

/**
 * Client-side caching hook
 */
export function useClientCache<T>(key: string, fetchFn: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check cache first
        const cached = localStorage.getItem(key);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                // Check if cache is still valid (1 hour)
                if (Date.now() - parsed.timestamp < 3600000) {
                    setData(parsed.data);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                // Invalid cache, fetch fresh data
            }
        }

        // Fetch fresh data
        fetchFn().then((result) => {
            setData(result);
            setLoading(false);

            // Update cache
            localStorage.setItem(
                key,
                JSON.stringify({
                    data: result,
                    timestamp: Date.now(),
                })
            );
        });
    }, [key, fetchFn]);

    return { data, loading };
}

import { useState, useEffect, useMemo, useCallback } from 'react';
