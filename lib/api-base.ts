const LOCAL_BACKEND_FALLBACK = 'http://localhost:5000/api/v1';
const RELATIVE_PROXY_BASE = '/api/v1';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const stripTrailingSlash = (url: string) => {
    if (!url || url === '/') {
        return url;
    }
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const ensureLeadingSlash = (url: string) => {
    if (!url) return url;
    return url.startsWith('/') ? url : `/${url}`;
};

const isRelativeUrl = (url: string) => !/^https?:\/\//i.test(url);

const isLocalBackendUrl = (url: string) => {
    if (!url || isRelativeUrl(url)) {
        return false;
    }

    try {
        const parsed = new URL(url);
        return LOCAL_HOSTNAMES.has(parsed.hostname);
    } catch {
        return false;
    }
};

const isLocalBrowserHost = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return LOCAL_HOSTNAMES.has(window.location.hostname);
};

/**
 * Resolve the API base URL depending on runtime environment.
 * - Uses NEXT_PUBLIC_API_URL when it's an absolute or relative URL
 * - Falls back to localhost for local dev
 * - Switches to relative proxy path when the browser isn't on localhost but the configured URL still points to localhost
 */
export const resolveApiBaseUrl = (): string => {
    const configured = stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL || LOCAL_BACKEND_FALLBACK);

    if (typeof window !== 'undefined') {
        if (isRelativeUrl(configured)) {
            return ensureLeadingSlash(stripTrailingSlash(configured));
        }

        if (isLocalBackendUrl(configured)) {
            return RELATIVE_PROXY_BASE;
        }

        try {
            const parsed = new URL(configured);
            const sameOrigin =
                parsed.hostname === window.location.hostname &&
                (parsed.port || (parsed.protocol === 'https:' ? '443' : '80')) ===
                    (window.location.port || (window.location.protocol === 'https:' ? '443' : '80'));

            if (sameOrigin) {
                return configured;
            }
        } catch {
            // fall through
        }

        // Default to proxying through Next to avoid CORS issues
        return RELATIVE_PROXY_BASE;
    }

    if (isRelativeUrl(configured)) {
        return ensureLeadingSlash(stripTrailingSlash(configured));
    }

    return configured;
};

export const RELATIVE_API_PROXY_BASE = RELATIVE_PROXY_BASE;
