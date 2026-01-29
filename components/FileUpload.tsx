'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import fileStorageService, { UploadProgress, UploadResult } from '@/lib/file-storage';

interface FileUploadProps {
    onUploadComplete?: (result: UploadResult) => void;
    folder?: string;
    accept?: string;
    maxSizeMB?: number;
    multiple?: boolean;
    showPreview?: boolean;
    label?: string;
}

export default function FileUpload({
    onUploadComplete,
    folder = 'general',
    accept = 'image/jpeg,image/png,image/jpg,application/pdf',
    maxSizeMB = 5,
    multiple = false,
    showPreview = true,
    label = 'Upload File',
}: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');

        // Validate file
        const validation = fileStorageService.validateFile(file, {
            maxSizeMB,
            allowedTypes: accept.split(','),
        });

        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setSelectedFile(file);

        // Generate preview for images
        if (showPreview && fileStorageService.isImage(file)) {
            try {
                const previewUrl = await fileStorageService.generateThumbnail(file, 300);
                setPreview(previewUrl);
            } catch (err) {
                console.error('Failed to generate preview:', err);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');

        try {
            const result = await fileStorageService.uploadFile(
                selectedFile,
                folder,
                (prog) => setProgress(prog)
            );

            if (result.success) {
                onUploadComplete?.(result);
                setSelectedFile(null);
                setPreview('');
                setProgress(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setError(result.message || 'Upload failed');
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview('');
        setProgress(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload-input"
                />
                <label htmlFor="file-upload-input">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                        <span>📁 {label}</span>
                    </Button>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                    Max size: {maxSizeMB}MB • Formats: {accept.split(',').map(t => t.split('/')[1]).join(', ')}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Selected File Preview */}
            {selectedFile && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                            {/* Preview */}
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                            ) : (
                                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                                    {fileStorageService.isPDF(selectedFile) ? (
                                        <span className="text-3xl">📄</span>
                                    ) : (
                                        <span className="text-3xl">📎</span>
                                    )}
                                </div>
                            )}

                            {/* File Info */}
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{selectedFile.name}</p>
                                <p className="text-xs text-gray-600">
                                    {fileStorageService.formatFileSize(selectedFile.size)} • {selectedFile.type}
                                </p>

                                {/* Upload Progress */}
                                {uploading && progress && (
                                    <div className="mt-2">
                                        <Progress value={progress.percentage} className="h-2" />
                                        <p className="text-xs text-gray-600 mt-1">{progress.percentage}% uploaded</p>
                                    </div>
                                )}

                                {/* Actions */}
                                {!uploading && (
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" onClick={handleUpload}>
                                            Upload
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
