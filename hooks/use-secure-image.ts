import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch images securely from the backend.
 * This is needed because the backend protects /uploads directories with authentication.
 *
 * @param imageUrl - The URL of the image to fetch (can be relative, absolute, or a blob/data URL)
 * @returns An object containing the secureUrl (blob URL), loading state, and error state.
 */
export function useSecureImage(imageUrl: string | null | undefined) {
    const [secureUrl, setSecureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Reset state when input changes
        setLoading(false);
        setError(null);

        // 1. Handle empty inputs
        if (!imageUrl) {
            setSecureUrl(null);
            return;
        }

        // 2. Handle already local URLs (Blob or Data)
        if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
            setSecureUrl(imageUrl);
            return;
        }

        // 3. Handle external URLs (not hosted on our backend)
        // Heuristic: If it starts with http/https but not our own origin (roughly)
        // Actually, the simplest check is if it doesn't look like a relative upload path and is absolute.
        // But if it points to our backend (localhost:5000), we DO want to fetch securely.
        // So we should only skip if it's definitely 3rd party public image.
        // For now, let's assume anything starting with http that isn't localhost is external.
        const isExternal = imageUrl.startsWith('http') && !imageUrl.includes('localhost') && !imageUrl.includes('127.0.0.1');
        if (isExternal) {
            setSecureUrl(imageUrl);
            return;
        }

        // 4. Fetch secure image
        let isActive = true;
        let objectUrl: string | null = null;

        const fetchImage = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                // Append leading slash if missing for relative paths
                const fetchUrl = imageUrl.startsWith('/') || imageUrl.startsWith('http')
                    ? imageUrl
                    : `/${imageUrl}`;

                const response = await fetch(fetchUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
                }

                const blob = await response.blob();
                if (isActive) {
                    objectUrl = URL.createObjectURL(blob);
                    setSecureUrl(objectUrl);
                }
            } catch (err: any) {
                if (isActive) {
                    console.error("Error fetching secure image:", err);
                    setError(err);
                    // Fallback: try showing the original URL in case it works (e.g. if auth wasn't actually required or if it's cached)
                    // But if it failed with 403, it won't work.
                    // Let's explicitly set partial secureUrl or just null
                    setSecureUrl(null);
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchImage();

        // Cleanup function
        return () => {
            isActive = false;
            // Revoke the object URL to avoid memory leaks
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };

    }, [imageUrl]);

    return { secureUrl, loading, error };
}
