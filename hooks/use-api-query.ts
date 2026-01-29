import { useState, useEffect, useCallback } from 'react';

export interface UseApiQueryOptions<T> {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    refetchOnMount?: boolean;
    refetchInterval?: number;
}

export interface UseApiQueryResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    setData: (data: T | null) => void;
}

/**
 * Custom hook for API data fetching with loading and error states
 * Replaces repeated useState/useEffect patterns across 30+ pages
 * 
 * @example
 * const { data, loading, error, refetch } = useApiQuery(
 *   () => apiClient.getCitizens({ page: 1, limit: 20 })
 * );
 */
export function useApiQuery<T>(
    queryFn: () => Promise<{ data: T } | T>,
    options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
    const {
        enabled = true,
        onSuccess,
        onError,
        refetchOnMount = true,
        refetchInterval
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        try {
            setLoading(true);
            setError(null);

            const result = await queryFn();

            // Handle both { data: T } and T response formats
            const responseData = (result && typeof result === 'object' && 'data' in result)
                ? (result as { data: T }).data
                : result as T;

            setData(responseData);

            if (onSuccess) {
                onSuccess(responseData);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);

            if (onError) {
                onError(error);
            }
        } finally {
            setLoading(false);
        }
    }, [queryFn, enabled]);

    useEffect(() => {
        if (refetchOnMount) {
            fetchData();
        }
    }, [fetchData, refetchOnMount]);

    useEffect(() => {
        if (refetchInterval && enabled) {
            const interval = setInterval(fetchData, refetchInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refetchInterval, enabled]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        setData
    };
}

/**
 * Hook for paginated API queries
 * 
 * @example
 * const { data, loading, pagination, setPage } = usePaginatedQuery(
 *   (page, limit) => apiClient.getCitizens({ page, limit })
 * );
 */
export function usePaginatedQuery<T>(
    queryFn: (page: number, limit: number) => Promise<{
        data: { items?: T[]; citizens?: T[]; visits?: T[];[key: string]: any };
    }>,
    initialPage = 1,
    initialLimit = 20
) {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);

    const wrappedQueryFn = useCallback(
        () => queryFn(page, limit),
        [queryFn, page, limit]
    );

    const { data, loading, error, refetch } = useApiQuery(
        wrappedQueryFn,
        { enabled: true }
    );

    // Extract items from various possible response formats
    const items = data
        ? (data.items || data.citizens || data.visits || data.officers || data.registrations || [])
        : [];

    const pagination = data?.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0
    };

    return {
        data: items,
        loading,
        error,
        pagination,
        page,
        setPage,
        limit,
        setLimit,
        refetch
    };
}
