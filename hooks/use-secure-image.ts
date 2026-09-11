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
                const token = typeof window !== 'undefined'
                    ? (localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('citizenToken'))
                    : null;

                // Normalize backslashes from Windows paths
                const normalizedPath = imageUrl.replace(/\\/g, '/');
                const fetchUrl = normalizedPath.startsWith('/') || normalizedPath.startsWith('http')
                    ? normalizedPath
                    : `/${normalizedPath}`;

                const headers: Record<string, string> = {};
                if (token && token !== 'null' && token !== 'undefined') {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(fetchUrl, {
                    headers,
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (isActive) {
                        setError(new Error(`Image status: ${response.status}`));
                        setSecureUrl(null);
                    }
                    return;
                }

                const blob = await response.blob();
                if (isActive) {
                    objectUrl = URL.createObjectURL(blob);
                    setSecureUrl(objectUrl);
                }
            } catch (err: any) {
                if (isActive) {
                    setError(err);
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

