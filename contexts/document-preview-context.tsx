'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export interface PreviewOptions {
    url: string;
    title?: string;
    blob?: Blob;
    blobUrl?: string;
    fileType?: 'pdf' | 'image' | 'other';
    fileName?: string;
}

interface DocumentPreviewContextType {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    fileName: string;
    fileUrl: string | null;
    blobUrl: string | null;
    fileType: 'pdf' | 'image' | 'other';
    error: string | null;
    openPreview: (options: PreviewOptions) => Promise<void>;
    closePreview: () => void;
}

const DocumentPreviewContext = createContext<DocumentPreviewContextType | undefined>(undefined);

function detectFileType(url: string, mimeType?: string): 'pdf' | 'image' | 'other' {
    if (mimeType) {
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.startsWith('image/')) return 'image';
    }
    const cleanUrl = url.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.pdf')) return 'pdf';
    if (cleanUrl.endsWith('.png') || cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.webp') || cleanUrl.endsWith('.svg') || cleanUrl.endsWith('.gif')) {
        return 'image';
    }
    if (url.startsWith('data:image/')) return 'image';
    return 'other';
}

function extractFileName(url: string): string {
    try {
        const clean = url.split('?')[0];
        const parts = clean.split('/');
        return parts[parts.length - 1] || 'document';
    } catch {
        return 'document';
    }
}

export function DocumentPreviewProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('Document Preview');
    const [fileName, setFileName] = useState('document');
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'pdf' | 'image' | 'other'>('other');
    const [error, setError] = useState<string | null>(null);
    const [currentObjectUrl, setCurrentObjectUrl] = useState<string | null>(null);

    const cleanupObjectUrl = useCallback(() => {
        if (currentObjectUrl) {
            try {
                URL.revokeObjectURL(currentObjectUrl);
            } catch (e) {
                console.warn('Failed to revoke blob URL', e);
            }
            setCurrentObjectUrl(null);
        }
    }, [currentObjectUrl]);

    const closePreview = useCallback(() => {
        setIsOpen(false);
        setIsLoading(false);
        setError(null);
        // keep blobUrl briefly so exit animation doesn't flash empty
        setTimeout(() => {
            setBlobUrl(null);
            setFileUrl(null);
            cleanupObjectUrl();
        }, 300);
    }, [cleanupObjectUrl]);

    const openPreview = useCallback(async (options: PreviewOptions) => {
        const { url, title: customTitle, blob, blobUrl: directBlobUrl, fileType: forceFileType, fileName: customFileName } = options;
        if (!url && !blob && !directBlobUrl) return;

        cleanupObjectUrl();
        setError(null);
        setIsOpen(true);
        setIsLoading(true);

        const targetTitle = customTitle || 'Document Preview';
        const targetFileName = customFileName || (url ? extractFileName(url) : 'file');
        setTitle(targetTitle);
        setFileName(targetFileName);
        setFileUrl(url || null);

        // If direct blobUrl provided
        if (directBlobUrl) {
            setBlobUrl(directBlobUrl);
            setFileType(forceFileType || detectFileType(targetFileName));
            setIsLoading(false);
            return;
        }

        // If blob object provided
        if (blob) {
            const createdUrl = URL.createObjectURL(blob);
            setCurrentObjectUrl(createdUrl);
            setBlobUrl(createdUrl);
            setFileType(forceFileType || detectFileType(targetFileName, blob.type));
            setIsLoading(false);
            return;
        }

        // If url is already a data: or blob: url
        if (url.startsWith('data:') || url.startsWith('blob:')) {
            setBlobUrl(url);
            setFileType(forceFileType || detectFileType(url));
            setIsLoading(false);
            return;
        }

        // Fetch securely with token if necessary
        try {
            const token = apiClient.getAccessToken();
            let fullUrl = url;

            // Logic to switch to API endpoint for /uploads/ if stored locally
            if (url.includes('/uploads/')) {
                const parts = url.split('/uploads/');
                if (parts.length > 1) {
                    const relativePath = parts[1];
                    const pathSegments = relativePath.split('/');
                    if (pathSegments.length >= 2) {
                        const folder = pathSegments[0];
                        const filename = pathSegments.slice(1).join('/');
                        fullUrl = `${apiClient.getBaseURL()}/files/serve/${folder}/${filename}`;
                    }
                }
            } else if (!url.startsWith('http')) {
                fullUrl = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
            }

            const headers: Record<string, string> = {};
            if (token && (!url.startsWith('http') || fullUrl.includes(window.location.host) || fullUrl.includes(apiClient.getBaseURL()))) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(fullUrl, { headers });
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Access Denied (403): You do not have permission to view this document.');
                }
                if (response.status === 404) {
                    throw new Error('Document not found (404). The file may have been moved or removed.');
                }
                throw new Error(`Failed to load document (${response.status} ${response.statusText})`);
            }

            const contentType = response.headers.get('content-type') || '';
            const fetchedBlob = await response.blob();
            const createdUrl = URL.createObjectURL(fetchedBlob);
            setCurrentObjectUrl(createdUrl);
            setBlobUrl(createdUrl);
            setFileType(forceFileType || detectFileType(url, contentType || fetchedBlob.type));
            setIsLoading(false);
        } catch (err: any) {
            console.error('Failed to load document for preview:', err);
            const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to open document');
            setError(msg);
            setIsLoading(false);
        }
    }, [cleanupObjectUrl]);

    // Global Event Listener for kutumb:open-document-preview
    useEffect(() => {
        const handleCustomEvent = (event: Event) => {
            const customEvent = event as CustomEvent<PreviewOptions>;
            if (customEvent.detail) {
                openPreview(customEvent.detail).catch((err) => {
                    console.error('Unhandled error in openPreview:', err);
                });
            }
        };

        window.addEventListener('kutumb:open-document-preview', handleCustomEvent);
        return () => {
            window.removeEventListener('kutumb:open-document-preview', handleCustomEvent);
        };
    }, [openPreview]);

    return (
        <DocumentPreviewContext.Provider
            value={{
                isOpen,
                isLoading,
                title,
                fileName,
                fileUrl,
                blobUrl,
                fileType,
                error,
                openPreview,
                closePreview
            }}
        >
            {children}
        </DocumentPreviewContext.Provider>
    );
}

export function useDocumentPreview() {
    const context = useContext(DocumentPreviewContext);
    if (!context) {
        throw new Error('useDocumentPreview must be used within a DocumentPreviewProvider');
    }
    return context;
}
