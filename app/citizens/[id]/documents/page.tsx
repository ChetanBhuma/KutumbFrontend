'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import FileUpload from '@/components/FileUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CitizenDocumentsPage() {
    const params = useParams();
    const [citizen, setCitizen] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchCitizen();
            fetchDocuments();
        }
    }, [params.id]);

    const fetchCitizen = async () => {
        try {
            const response = await apiClient.getCitizenById(params.id as string);
            if (response.success) {
                setCitizen(response.data.citizen);
            }
        } catch (error) {
            console.error('Failed to fetch citizen:', error);
        }
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/citizens/${params.id}/documents`) as any;
            if (response.success) {
                setDocuments(response.data.documents || []);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadComplete = (result: any) => {
        alert('Document uploaded successfully!');
        fetchDocuments();
    };

    const handleDelete = async (docId: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                await apiClient.delete(`/citizens/${params.id}/documents/${docId}`);
                setDocuments(documents.filter(d => d.id !== docId));
                alert('Document deleted successfully');
            } catch (error) {
                console.error('Failed to delete document:', error);
                alert('Failed to delete document');
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    return (
        <ProtectedRoute permissionCode="citizens.read">
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Document Management</h1>
                    <p className="text-gray-600">
                        {citizen?.fullName} - {citizen?.mobileNumber}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Section */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Upload Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">📷 Profile Photo</h4>
                                <FileUpload
                                    folder={`citizens/${params.id}/photos`}
                                    accept="image/jpeg,image/png,image/jpg"
                                    maxSizeMB={2}
                                    label="Upload Photo"
                                    onUploadComplete={handleUploadComplete}
                                />
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">🆔 Aadhaar Card</h4>
                                <FileUpload
                                    folder={`citizens/${params.id}/documents`}
                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                    maxSizeMB={5}
                                    label="Upload Aadhaar"
                                    onUploadComplete={handleUploadComplete}
                                />
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">📄 Other Documents</h4>
                                <FileUpload
                                    folder={`citizens/${params.id}/documents`}
                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                    maxSizeMB={5}
                                    label="Upload Document"
                                    onUploadComplete={handleUploadComplete}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
                                <Badge>{documents.length} files</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No documents uploaded yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            {/* Preview */}
                                            <div className="w-16 h-16 bg-white rounded flex items-center justify-center">
                                                {doc.filename.endsWith('.pdf') ? (
                                                    <span className="text-3xl">📄</span>
                                                ) : (
                                                    <span className="text-3xl">🖼️</span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-sm">{doc.type}</p>
                                                    <Badge variant="outline" className="text-xs">{doc.filename}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    {formatFileSize(doc.size)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => window.open(doc.url, '_blank')}>
                                                    👁️ View
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDelete(doc.id)}>
                                                    🗑️ Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Digital ID Card */}
                {citizen?.digitalCardIssued && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Digital ID Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg max-w-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                                        {citizen.photoUrl ? (
                                            <img src={citizen.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl text-blue-600">{citizen.fullName.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xl">{citizen.fullName}</p>
                                        <p className="text-sm opacity-90">{citizen.age} years • {citizen.gender}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Card Number:</span>
                                        <span className="font-mono font-bold">{citizen.digitalCardNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Issue Date:</span>
                                        <span>{new Date(citizen.digitalCardIssueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Police Station:</span>
                                        <span>{citizen.policeStation?.name}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white border-opacity-30 text-xs opacity-75">
                                    <p>Delhi Police - Senior Citizen Care</p>
                                    <p>Emergency: Dial 100</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button variant="outline">📥 Download Digital Card</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
