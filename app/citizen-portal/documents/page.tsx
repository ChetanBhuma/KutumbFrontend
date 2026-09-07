'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Upload, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ListSkeleton } from '../components/ListSkeleton';

export default function CitizenDocumentsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('ID Proof');

    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await apiClient.getMyDocuments();
            if (response.success) {
                // Ensure client-side deduplication by ID and fileUrl
                const seen = new Set<string>();
                const uniqueDocs = (response.data.documents || []).filter((doc: any) => {
                    const key = doc.id || `${doc.documentType}_${doc.fileUrl}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setDocuments(uniqueDocs);
            }
        } catch (err) {
            console.error('Failed to load documents', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load documents. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('documentType', docType);

        try {
            const response = await apiClient.uploadMyDocument(formData);
            if (response.success) {
                toast({ title: 'Upload Successful', description: 'Document has been added.' });
                setUploadOpen(false);
                setSelectedFile(null);
                // Refresh list from server to get accurate database state
                fetchDocuments();
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId: string, docName: string) => {
        if (!confirm(`Are you sure you want to delete "${docName}"?`)) return;

        setDeletingId(docId);
        try {
            const res = await apiClient.deleteMyDocument(docId);
            if (res.success) {
                setDocuments(prev => prev.filter(d => d.id !== docId));
                toast({ title: 'Document Deleted', description: 'The document has been removed.' });
            }
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Delete Failed',
                description: err?.response?.data?.message || 'Could not delete document.'
            });
        } finally {
            setDeletingId(null);
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes || isNaN(bytes)) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getDocTypeBadgeStyle = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'profilephoto':
            case 'profile photo':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'id proof':
            case 'identityproof':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'address proof':
            case 'addressproof':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'medical record':
            case 'medicalrecord':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const formatDocTypeLabel = (type: string) => {
        switch (type) {
            case 'ProfilePhoto':
                return 'Profile Photo';
            case 'AddressProof':
                return 'Address Proof';
            case 'IdentityProof':
                return 'ID Proof';
            default:
                return type || 'Document';
        }
    };

    if (loading) {
        return <ListSkeleton />;
    }

    return (
        <ProtectedRoute permissionCode="documents.read.own">
            <div className="space-y-6 min-h-[80vh]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Documents</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">Manage your identification and records.</p>
                    </div>
                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto text-xs sm:text-sm bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white hover:opacity-95">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Upload Document</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4 pt-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-2">
                                    <Label>Document Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                    >
                                        <option value="ID Proof">ID Proof (Aadhaar/Voter ID)</option>
                                        <option value="Medical Record">Medical Record</option>
                                        <option value="Address Proof">Address Proof</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>File</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <p className="text-xs text-muted-foreground">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={uploading || !selectedFile} className="bg-[#0F52BA] text-white">
                                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Upload'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.length > 0 ? (
                        documents.map((doc) => {
                            const displayName = doc.documentName || doc.fileName || formatDocTypeLabel(doc.documentType);
                            const uploadDate = doc.uploadedAt || doc.createdAt;
                            const isDeleting = deletingId === doc.id;

                            return (
                                <Card key={doc.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="rounded-xl bg-blue-50 p-2.5 text-[#0F52BA] shrink-0 border border-blue-100">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-sm text-slate-900 truncate" title={displayName}>
                                                        {displayName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getDocTypeBadgeStyle(doc.documentType)}`}>
                                                            {formatDocTypeLabel(doc.documentType)}
                                                        </span>
                                                        {doc.fileSize && (
                                                            <span className="text-[11px] text-slate-500 font-mono">
                                                                {formatFileSize(doc.fileSize)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                                        {uploadDate ? new Date(uploadDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently added'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="View Document"
                                                    className="h-8 w-8 text-slate-600 hover:text-[#0F52BA] hover:bg-blue-50"
                                                    onClick={() => apiClient.viewDocument(doc.fileUrl)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Delete Document"
                                                    disabled={isDeleting}
                                                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    onClick={() => handleDelete(doc.id, displayName)}
                                                >
                                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-rose-500" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                                <FileText className="h-6 w-6" />
                            </div>
                            <p className="font-semibold text-slate-700 text-base">No documents uploaded yet</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">Upload your identity proof, address proof, or medical records for fast verification and access.</p>
                            <Button
                                onClick={() => setUploadOpen(true)}
                                size="sm"
                                className="mt-4 bg-[#0F52BA] text-white hover:bg-[#0F52BA]/90"
                            >
                                <Upload className="mr-2 h-4 w-4" /> Upload Now
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
