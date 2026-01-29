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

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await apiClient.getMyDocuments();
            if (response.success) {
                setDocuments(response.data.documents);
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
                setDocuments([response.data.document, ...documents]);
                setUploadOpen(false);
                setSelectedFile(null);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <ListSkeleton />;
    }

    return (
        <ProtectedRoute permissionCode="documents.read.own">
            <div className="space-y-6 min-h-[80vh]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
                        <p className="text-muted-foreground">Manage your identification and medical records.</p>
                    </div>
                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                                    <Button type="submit" disabled={uploading || !selectedFile}>
                                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Upload'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.length > 0 ? (
                        documents.map((doc) => (
                            <Card key={doc.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium truncate max-w-[150px]" title={doc.fileName}>{doc.documentType}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                            <FileText className="mb-4 h-10 w-10 text-slate-300" />
                            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
