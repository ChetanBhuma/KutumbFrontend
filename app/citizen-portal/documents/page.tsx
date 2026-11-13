'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Loader2,
    FileText,
    Upload,
    Trash2,
    Eye,
    User,
    Users,
    Fingerprint,
    FileCheck,
    CheckCircle2,
    Clock,
    Phone,
    Shield,
    Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListSkeleton } from '../components/ListSkeleton';

export default function CitizenDocumentsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [householdStaff, setHouseholdStaff] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'citizen' | 'staff'>('all');
    const [error, setError] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('Address Proof');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const [docRes, profileRes] = await Promise.allSettled([
                apiClient.getMyDocuments(),
                apiClient.getMyProfile()
            ]);

            let rawDocs: any[] = [];
            let staffList: any[] = [];

            if (docRes.status === 'fulfilled' && docRes.value?.success) {
                rawDocs = docRes.value.data.documents || [];
                if (docRes.value.data.householdHelp && Array.isArray(docRes.value.data.householdHelp)) {
                    staffList = docRes.value.data.householdHelp;
                }
            }

            if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
                const citizen = profileRes.value.data.citizen;
                if (citizen?.HouseholdHelp && Array.isArray(citizen.HouseholdHelp) && citizen.HouseholdHelp.length > 0) {
                    staffList = citizen.HouseholdHelp;
                }
            }

            // Collect all file URLs associated with household staff members
            const staffUrls = new Set<string>();
            for (const staff of staffList) {
                if (staff.photoUrl) staffUrls.add(staff.photoUrl);
                if (staff.idProofUrl) staffUrls.add(staff.idProofUrl);
                if (staff.signatureUrl) staffUrls.add(staff.signatureUrl);
            }

            const isStaffDocument = (doc: any) => {
                // 1. Matches any file URL belonging to household staff
                if (doc.fileUrl && staffUrls.has(doc.fileUrl)) return true;

                // 2. Type indicates staff documents
                const normType = (doc.documentType || '').replace(/[\s\-_]/g, '').toLowerCase();
                const staffTypes = [
                    'staffphoto',
                    'signature',
                    'staffsignature',
                    'staffdoc',
                    'staffdocument',
                    'staffid',
                    'staffidentityproof',
                    'staffidproof'
                ];
                if (staffTypes.includes(normType)) {
                    return true;
                }

                // 3. Document name indicates servant/staff document
                const normName = (doc.documentName || doc.fileName || '').toLowerCase();
                if (
                    normName.includes('staff') ||
                    normName.includes('servant') ||
                    normName.includes('domestic') ||
                    normName.includes('thumb') ||
                    normName.includes('signature')
                ) {
                    return true;
                }

                return false;
            };

            // Deduplicate citizen documents:
            // For singleton types ('addressproof', 'profilephoto', 'idproof', 'identityproof'),
            // sort by uploadedAt/createdAt descending and KEEP ONLY THE LATEST ONE.
            const seenSingleton = new Set<string>();
            const seenUrls = new Set<string>();
            const uniqueDocs: any[] = [];

            const sortedDocs = [...rawDocs].sort((a, b) => {
                const dateA = new Date(a.uploadedAt || a.createdAt || 0).getTime();
                const dateB = new Date(b.uploadedAt || b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            for (const doc of sortedDocs) {
                // Strictly exclude staff documents (Signature, StaffPhoto, Staff ID) from citizen documents section
                if (isStaffDocument(doc)) {
                    continue;
                }

                if (doc.fileUrl && seenUrls.has(doc.fileUrl)) continue;

                const normType = (doc.documentType || '').replace(/[\s\-_]/g, '').toLowerCase();
                const isSingleton = ['profilephoto', 'addressproof', 'idproof', 'identityproof'].includes(normType);

                if (isSingleton) {
                    if (seenSingleton.has(normType)) {
                        continue; // Skip older duplicates, keep only latest
                    }
                    seenSingleton.add(normType);
                }

                if (doc.fileUrl) seenUrls.add(doc.fileUrl);
                uniqueDocs.push(doc);
            }

            setDocuments(uniqueDocs);
            setHouseholdStaff(staffList);
        } catch (err) {
            console.error('Failed to load documents', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load documents. Please try again.',
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
                toast({ title: 'Upload Successful', description: `${docType} has been updated.` });
                setUploadOpen(false);
                setSelectedFile(null);
                await fetchDocuments();
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
        const norm = (type || '').replace(/[\s\-_]/g, '').toLowerCase();
        switch (norm) {
            case 'profilephoto':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'idproof':
            case 'identityproof':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'addressproof':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'medicalrecord':
            case 'medical':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const formatDocTypeLabel = (type: string) => {
        const norm = (type || '').replace(/[\s\-_]/g, '').toLowerCase();
        switch (norm) {
            case 'profilephoto':
                return 'Profile Photo';
            case 'addressproof':
                return 'Address Proof';
            case 'idproof':
            case 'identityproof':
                return 'ID Proof';
            case 'medicalrecord':
            case 'medical':
                return 'Medical Record';
            default:
                return type || 'Document';
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return 'H';
        return name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'H';
    };

    // Calculate total staff documents count
    const totalStaffDocs = householdStaff.reduce((acc, staff) => {
        let count = 0;
        if (staff.photoUrl) count++;
        if (staff.idProofUrl) count++;
        if (staff.signatureUrl) count++;
        return acc + count;
    }, 0);

    if (loading) {
        return <ListSkeleton />;
    }

    return (
        <ProtectedRoute permissionCode="documents.read.own">
            <div className="space-y-8 min-h-[85vh] pb-12">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/60 p-5 rounded-2xl border border-blue-100/60">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#0F52BA] animate-pulse"></span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F52BA]">Document Repository</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                            My Documents & Records
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            Manage citizen identification proofs, latest residential verification, and household staff documents.
                        </p>
                    </div>

                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto text-xs sm:text-sm bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:opacity-95 text-white shadow-sm font-medium">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Citizen Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 font-bold">Upload Citizen Document</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4 pt-3">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">Document Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F52BA]"
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                    >
                                        <option value="Address Proof">Address Proof (Electricity Bill / Rent Agreement)</option>
                                        <option value="ID Proof">ID Proof (Aadhaar / Voter ID / PAN)</option>
                                        <option value="Medical Record">Medical Record / Health Certificate</option>
                                        <option value="Other">Other Personal Document</option>
                                    </select>
                                    <p className="text-[11px] text-muted-foreground">
                                        Note: If you update Address Proof or ID Proof, only the latest active document is retained.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">Select File</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <p className="text-[11px] text-muted-foreground">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                                <div className="flex justify-end gap-2.5 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setUploadOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm" disabled={uploading || !selectedFile} className="bg-[#0F52BA] text-white hover:bg-[#0F52BA]/90">
                                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Upload Document'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Section Filter Tabs */}
                <div className="flex items-center justify-between border-b pb-3">
                    <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
                        <TabsList className="bg-slate-100 p-1 rounded-xl">
                            <TabsTrigger value="all" className="text-xs sm:text-sm font-medium px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#0F52BA] data-[state=active]:shadow-sm">
                                All Documents ({documents.length + totalStaffDocs})
                            </TabsTrigger>
                            <TabsTrigger value="citizen" className="text-xs sm:text-sm font-medium px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#0F52BA] data-[state=active]:shadow-sm">
                                <User className="h-3.5 w-3.5 mr-1.5 inline" />
                                Citizen ({documents.length})
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="text-xs sm:text-sm font-medium px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#0F52BA] data-[state=active]:shadow-sm">
                                <Users className="h-3.5 w-3.5 mr-1.5 inline" />
                                Household Staff ({totalStaffDocs})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* ======================================================== */}
                {/* SECTION 1: CITIZEN DOCUMENTS                              */}
                {/* ======================================================== */}
                {(activeTab === 'all' || activeTab === 'citizen') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#0F52BA] flex items-center justify-center font-bold">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        Citizen Documents
                                        <Badge variant="outline" className="text-xs font-normal bg-blue-50/50 text-[#0F52BA] border-blue-200">
                                            {documents.length} {documents.length === 1 ? 'Record' : 'Records'}
                                        </Badge>
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Identity proofs, current address verification, and personal medical certificates.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {documents.length > 0 ? (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {documents.map((doc) => {
                                    const displayName = doc.documentName || doc.fileName || formatDocTypeLabel(doc.documentType);
                                    const uploadDate = doc.uploadedAt || doc.createdAt;
                                    const isDeleting = deletingId === doc.id;
                                    const normType = (doc.documentType || '').replace(/[\s\-_]/g, '').toLowerCase();
                                    const isSingleton = ['profilephoto', 'addressproof', 'idproof', 'identityproof'].includes(normType);

                                    return (
                                        <Card key={doc.id || doc.fileUrl} className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white hover:border-blue-200">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 text-[#0F52BA] shrink-0 border border-blue-100">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <p className="font-semibold text-sm text-slate-900 truncate" title={displayName}>
                                                                    {displayName}
                                                                </p>
                                                                {isSingleton && (
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-0.5">
                                                                        <CheckCircle2 className="h-2.5 w-2.5" /> Latest
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getDocTypeBadgeStyle(doc.documentType)}`}>
                                                                    {formatDocTypeLabel(doc.documentType)}
                                                                </span>
                                                                {doc.fileSize > 0 && (
                                                                    <span className="text-[11px] text-slate-500 font-mono">
                                                                        {formatFileSize(doc.fileSize)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {uploadDate ? new Date(uploadDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified Record'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            title="View Document"
                                                            className="h-8 gap-1.5 text-xs text-[#0F52BA] border-blue-200 hover:bg-blue-50 hover:text-[#0F52BA]"
                                                            onClick={() => apiClient.viewDocument(doc.fileUrl, displayName || doc.documentType || 'Citizen Document')}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View
                                                        </Button>

                                                        {doc.id && !doc.isProfileField && !doc.id.startsWith('citizen-') && (
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
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center bg-slate-50/50">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0F52BA] flex items-center justify-center mb-3">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <p className="font-semibold text-slate-700 text-sm">No citizen documents uploaded yet</p>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                    Upload your address proof, identity card, or medical reports for immediate police verification and records.
                                </p>
                                <Button
                                    onClick={() => setUploadOpen(true)}
                                    size="sm"
                                    className="mt-4 bg-[#0F52BA] text-white hover:bg-[#0F52BA]/90 text-xs"
                                >
                                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Document Now
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ======================================================== */}
                {/* SECTION 2: HOUSEHOLD STAFF DOCUMENTS                     */}
                {/* ======================================================== */}
                {(activeTab === 'all' || activeTab === 'staff') && (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        Household Staff Documents
                                        <Badge variant="outline" className="text-xs font-normal bg-amber-50/50 text-amber-800 border-amber-200">
                                            {householdStaff.length} {householdStaff.length === 1 ? 'Staff Member' : 'Staff Members'}
                                        </Badge>
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Verification documents, passport photos, and signatures for domestic helps, cooks, cleaners, and drivers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {householdStaff.length > 0 ? (
                            <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                                {householdStaff.map((staff, idx) => {
                                    const staffRole = staff.domesticHelpType === 'Any Other' && staff.otherStaffType
                                        ? staff.otherStaffType
                                        : (staff.domesticHelpType || staff.staffType || 'Domestic Help');
                                    const jobType = staff.jobType || staff.employmentType || 'Permanent';
                                    const hasAnyDoc = Boolean(staff.photoUrl || staff.idProofUrl || staff.signatureUrl);

                                    return (
                                        <Card key={staff.id || idx} className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white hover:border-amber-200">
                                            <CardContent className="p-5 space-y-4">
                                                {/* Staff Summary Header */}
                                                <div className="flex items-start justify-between gap-3 border-b pb-3.5">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {staff.photoUrl ? (
                                                            <div className="relative group h-12 w-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                                                <img src={staff.photoUrl} alt={staff.name} className="w-full h-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => apiClient.viewDocument(staff.photoUrl, `${staff.name} - Passport Photo`)}
                                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                                    title="View Photo"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 font-bold flex items-center justify-center shrink-0 border border-amber-200 text-sm">
                                                                {getInitials(staff.name)}
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-sm text-slate-900 truncate">
                                                                {staff.name || 'Staff Member'}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                <Badge variant="outline" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200">
                                                                    {staffRole}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-800 border-amber-200">
                                                                    {jobType}
                                                                </Badge>
                                                            </div>
                                                            {staff.mobileNumber && (
                                                                <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                                                                    <Phone className="h-3 w-3 text-slate-400" />
                                                                    {staff.mobileNumber}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] shrink-0 ${
                                                            staff.verificationStatus === 'Verified'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                        }`}
                                                    >
                                                        <Shield className="h-2.5 w-2.5 mr-1" />
                                                        {staff.verificationStatus || 'Not Verified'}
                                                    </Badge>
                                                </div>

                                                {/* Staff Documents Section */}
                                                <div className="space-y-2.5">
                                                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                                        Attached Documents ({[staff.photoUrl, staff.idProofUrl, staff.signatureUrl].filter(Boolean).length}/3)
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                        {/* Document 1: Passport Size Photo */}
                                                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                                                                    <User className="h-3.5 w-3.5" />
                                                                </div>
                                                                <span className="text-[11px] font-semibold text-slate-800 truncate">
                                                                    Passport Photo
                                                                </span>
                                                            </div>
                                                            <div className="mt-2.5">
                                                                {staff.photoUrl ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => apiClient.viewDocument(staff.photoUrl, `${staff.name} - Passport Photo`)}
                                                                        className="w-full h-7 text-[11px] gap-1 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                                                                    >
                                                                        <Eye className="h-3 w-3" /> View Photo
                                                                    </Button>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 italic block py-0.5">
                                                                        Not uploaded
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Document 2: Govt ID Proof */}
                                                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                                                                    <FileCheck className="h-3.5 w-3.5" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <span className="text-[11px] font-semibold text-slate-800 truncate block">
                                                                        {staff.idProofType || 'Govt ID Proof'}
                                                                    </span>
                                                                    {staff.idProofNumber && (
                                                                        <span className="text-[10px] text-slate-500 font-mono truncate block">
                                                                            {staff.idProofNumber}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-2.5">
                                                                {staff.idProofUrl ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => apiClient.viewDocument(staff.idProofUrl, `${staff.name} - ${staff.idProofType || 'Govt ID Proof'}`)}
                                                                        className="w-full h-7 text-[11px] gap-1 bg-white border-blue-200 text-[#0F52BA] hover:bg-blue-50 hover:text-[#0F52BA]"
                                                                    >
                                                                        <Eye className="h-3 w-3" /> View ID
                                                                    </Button>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 italic block py-0.5">
                                                                        Not uploaded
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Document 3: Thumb / Signature */}
                                                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                                                                    <Fingerprint className="h-3.5 w-3.5" />
                                                                </div>
                                                                <span className="text-[11px] font-semibold text-slate-800 truncate">
                                                                    Thumb / Signature
                                                                </span>
                                                            </div>
                                                            <div className="mt-2.5">
                                                                {staff.signatureUrl ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => apiClient.viewDocument(staff.signatureUrl, `${staff.name} - Thumb Impression / Signature`)}
                                                                        className="w-full h-7 text-[11px] gap-1 bg-white border-amber-200 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                                                                    >
                                                                        <Eye className="h-3 w-3" /> View Sign
                                                                    </Button>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 italic block py-0.5">
                                                                        Not uploaded
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center bg-slate-50/50">
                                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                                    <Users className="h-6 w-6" />
                                </div>
                                <p className="font-semibold text-slate-700 text-sm">No household staff registered yet</p>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                    When you register domestic help, cooks, or cleaners, their passport photos, government IDs, and signatures will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
