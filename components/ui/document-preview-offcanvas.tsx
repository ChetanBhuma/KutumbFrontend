'use client';

import React, { useState, useEffect } from 'react';
import { useDocumentPreview } from '@/contexts/document-preview-context';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Image as ImageIcon,
    Download,
    ExternalLink,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    RefreshCw,
    X,
    AlertCircle,
    Loader2
} from 'lucide-react';

export function DocumentPreviewOffcanvas() {
    const {
        isOpen,
        isLoading,
        title,
        fileName,
        fileUrl,
        blobUrl,
        fileType,
        error,
        closePreview,
        openPreview
    } = useDocumentPreview();

    // Image viewer state
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    // Reset view controls on open or file change
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setRotation(0);
        }
    }, [isOpen, blobUrl]);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => {
        setZoom(1);
        setRotation(0);
    };
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

    const handleDownload = () => {
        if (!blobUrl) return;
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleOpenInNewTab = () => {
        if (blobUrl) {
            window.open(blobUrl, '_blank');
        } else if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    };

    const handleRetry = () => {
        if (fileUrl) {
            openPreview({ url: fileUrl, title, fileName });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && closePreview()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-none md:w-[50vw] md:max-w-[50vw] p-0 flex flex-col h-full bg-slate-900 border-l border-slate-800 shadow-2xl z-50 overflow-hidden"
            >
                {/* Accessible Hidden/Visible Header */}
                <SheetHeader className="p-4 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur shrink-0 flex flex-row items-center justify-between gap-3 space-y-0 text-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                            {fileType === 'pdf' ? (
                                <FileText className="h-5 w-5" />
                            ) : fileType === 'image' ? (
                                <ImageIcon className="h-5 w-5" />
                            ) : (
                                <FileText className="h-5 w-5" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <SheetTitle className="text-base font-semibold text-slate-100 truncate">
                                    {title}
                                </SheetTitle>
                                <Badge
                                    variant="outline"
                                    className="uppercase text-[10px] tracking-wider font-semibold border-slate-700 bg-slate-800/60 text-slate-300"
                                >
                                    {fileType}
                                </Badge>
                            </div>
                            <SheetDescription className="text-xs text-slate-400 truncate max-w-sm">
                                {fileName}
                            </SheetDescription>
                        </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {fileType === 'image' && !isLoading && !error && (
                            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomOut}
                                    title="Zoom Out"
                                    className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700"
                                >
                                    <ZoomOut className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetZoom}
                                    title="Reset"
                                    className="h-7 px-2 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-700"
                                >
                                    {Math.round(zoom * 100)}%
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomIn}
                                    title="Zoom In"
                                    className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700"
                                >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRotate}
                                    title="Rotate 90°"
                                    className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700"
                                >
                                    <RotateCw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}

                        {blobUrl && (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDownload}
                                    title="Download Document"
                                    className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleOpenInNewTab}
                                    title="Open in New Tab"
                                    className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={closePreview}
                            title="Close"
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 border border-slate-800"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                {/* Offcanvas Content Viewport */}
                <div className="flex-1 w-full h-[calc(100vh-65px)] relative overflow-auto bg-slate-950 flex items-center justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-8 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm font-medium text-slate-300">Loading document...</p>
                            <p className="text-xs text-slate-500">Retrieving authenticated preview</p>
                        </div>
                    ) : error ? (
                        <div className="max-w-md p-6 bg-slate-900 border border-rose-900/50 rounded-xl text-center space-y-4 m-4">
                            <div className="w-12 h-12 bg-rose-950/80 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-800/50">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-rose-300">Failed to Load Document</h4>
                                <p className="text-xs text-slate-400 mt-1">{error}</p>
                            </div>
                            <div className="flex justify-center gap-2 pt-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleRetry}
                                    className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                                </Button>
                                {fileUrl && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleOpenInNewTab}
                                        className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" /> Try Direct Link
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : blobUrl ? (
                        fileType === 'pdf' ? (
                            <iframe
                                src={`${blobUrl}#toolbar=1&navpanes=0`}
                                title={title}
                                className="w-full h-full border-0 bg-slate-900"
                            />
                        ) : fileType === 'image' ? (
                            <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                                <img
                                    src={blobUrl}
                                    alt={title}
                                    style={{
                                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                        transition: 'transform 0.15s ease-out',
                                        maxHeight: zoom === 1 ? '90%' : 'none',
                                        maxWidth: zoom === 1 ? '90%' : 'none',
                                    }}
                                    className="object-contain shadow-2xl rounded-md select-none"
                                />
                            </div>
                        ) : (
                            <div className="max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 m-4">
                                <div className="w-14 h-14 bg-blue-950 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-800/40">
                                    <FileText className="h-7 w-7" />
                                </div>
                                <div>
                                    <h4 className="text-base font-semibold text-slate-200">{fileName}</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        This file format cannot be directly displayed in the previewer.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleDownload}
                                    className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
                                >
                                    <Download className="h-4 w-4" /> Download File
                                </Button>
                            </div>
                        )
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    );
}
