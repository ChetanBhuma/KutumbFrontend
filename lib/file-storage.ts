// File upload and storage service
import axios from 'axios';
import { resolveApiBaseUrl } from './api-base';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResult {
    success: boolean;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    message?: string;
}

class FileStorageService {
    private baseURL = resolveApiBaseUrl();

    // Validate file before upload
    validateFile(file: File, options: {
        maxSizeMB?: number;
        allowedTypes?: string[];
    } = {}): { valid: boolean; error?: string } {
        const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'] } = options;

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
            };
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`
            };
        }

        return { valid: true };
    }

    // Upload file with progress tracking
    async uploadFile(
        file: File,
        folder: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResult> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const response = await axios.post(`${this.baseURL}/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress({
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage,
                        });
                    }
                },
            });

            if (response.data.success) {
                return {
                    success: true,
                    fileUrl: response.data.data.url,
                    fileName: response.data.data.filename,
                    fileSize: response.data.data.size,
                    fileType: response.data.data.mimetype,
                };
            }

            return {
                success: false,
                message: response.data.message || 'Upload failed',
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Upload failed',
            };
        }
    }

    // Upload multiple files
    async uploadMultipleFiles(
        files: File[],
        folder: string,
        onProgress?: (fileIndex: number, progress: UploadProgress) => void
    ): Promise<UploadResult[]> {
        const results: UploadResult[] = [];

        for (let i = 0; i < files.length; i++) {
            const result = await this.uploadFile(files[i], folder, (progress) => {
                if (onProgress) {
                    onProgress(i, progress);
                }
            });
            results.push(result);
        }

        return results;
    }

    // Delete file
    async deleteFile(fileUrl: string): Promise<boolean> {
        try {
            const response = await axios.delete(`${this.baseURL}/files/delete`, {
                data: { fileUrl },
            });
            return response.data.success;
        } catch (error) {
            console.error('Delete file error:', error);
            return false;
        }
    }

    // Get file URL (for displaying)
    getFileUrl(filePath: string): string {
        if (filePath.startsWith('http')) {
            return filePath;
        }
        const normalizedPath = filePath.replace(/^\/+/, '');
        return `${this.baseURL}/files/${normalizedPath}`;
    }

    // Generate thumbnail for image
    async generateThumbnail(file: File, maxWidth: number = 200): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const ratio = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * ratio;

                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Convert file to base64
    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Format file size
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Get file extension
    getFileExtension(filename: string): string {
        return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
    }

    // Check if file is image
    isImage(file: File): boolean {
        return file.type.startsWith('image/');
    }

    // Check if file is PDF
    isPDF(file: File): boolean {
        return file.type === 'application/pdf';
    }
}

export const fileStorageService = new FileStorageService();
export default fileStorageService;
