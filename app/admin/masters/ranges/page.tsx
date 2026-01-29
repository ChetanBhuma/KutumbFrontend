'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { Pencil, Trash2, Plus, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface Range {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    districtCount?: number;
    policeStationCount?: number;
}

export default function RangesPage() {
    const [showModal, setShowModal] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingRange, setEditingRange] = useState<Range | null>(null);
    const [viewingRange, setViewingRange] = useState<Range | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rangeToDelete, setRangeToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        isActive: true,
    });

    const fetchRanges = useCallback(() => apiClient.get('/ranges') as Promise<{ data: Range[] }>, []);

    const { data: rangesData, loading, refetch } = useApiQuery<Range[]>(
        fetchRanges,
        { refetchOnMount: true }
    );

    const ranges = rangesData || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingRange) {
                await apiClient.put(`/ranges/${editingRange.id}`, formData);
            } else {
                await apiClient.post('/ranges', formData);
            }

            refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving range:', error);
            alert('Error saving range');
        }
    };

    const handleEdit = (range: Range) => {
        setEditingRange(range);
        setFormData({
            code: range.code,
            name: range.name,
            isActive: range.isActive,
        });
        setShowModal(true);
    };

    const handleView = (range: Range) => {
        setViewingRange(range);
        setViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!rangeToDelete) return;

        try {
            await apiClient.delete(`/ranges/${rangeToDelete}`);
            refetch();
            setRangeToDelete(null);
        } catch (error: any) {
            console.error('Error deleting range:', error);
            alert(error.response?.data?.message || 'Error deleting range');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRange(null);
        setFormData({
            code: '',
            name: '',
            isActive: true,
        });
    };

    const filteredRanges = ranges.filter(range =>
        range.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        range.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Ranges Master</h1>
                <p className="text-gray-600">Manage police ranges (highest jurisdiction level)</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600">Total Ranges</div>
                    <div className="text-2xl font-bold">{ranges.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600">Active</div>
                    <div className="text-2xl font-bold text-green-600">
                        {ranges.filter(r => r.isActive).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                    <div className="text-sm text-gray-600">Total Districts</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {ranges.reduce((sum, r) => sum + (r.districtCount || 0), 0)}
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search ranges by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Range
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden border">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Districts</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading ranges...</td>
                            </tr>
                        ) : filteredRanges.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No ranges found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredRanges.map((range) => (
                                <tr key={range.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{range.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{range.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {range.districtCount || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <Badge variant={range.isActive ? "default" : "destructive"} className={range.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                                            {range.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleView(range)}
                                                            className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View Details</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(range)}
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Edit Range</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setRangeToDelete(range.id)}
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Delete Range</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Range Details</DialogTitle>
                    </DialogHeader>
                    {viewingRange && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Range Code</h4>
                                    <p className="text-base font-semibold">{viewingRange.code}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <Badge variant={viewingRange.isActive ? "default" : "secondary"} className="mt-1">
                                        {viewingRange.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Range Name</h4>
                                <p className="text-lg font-medium">{viewingRange.name}</p>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-3 rounded-md">
                                        <span className="text-xs text-blue-600 uppercase font-bold">Districts</span>
                                        <p className="text-2xl font-bold text-blue-700">{viewingRange.districtCount || 0}</p>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-md">
                                        <span className="text-xs text-indigo-600 uppercase font-bold">Police Stations</span>
                                        <p className="text-2xl font-bold text-indigo-700">{viewingRange.policeStationCount || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit/Create Modal - Could be upgraded to Dialog component too, but keeping simple modal for now to focus on actions */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingRange ? 'Edit Range' : 'Add Range'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Code*</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., CENTRAL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Name*</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Central Range"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {editingRange ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!rangeToDelete} onOpenChange={(open) => !open && setRangeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the range
                            and remove it from our servers.
                            {rangeToDelete && filteredRanges.find(r => r.id === rangeToDelete)?.districtCount ? (
                                <div className="mt-2 text-red-600 font-semibold">
                                    Warning: This range has {filteredRanges.find(r => r.id === rangeToDelete)?.districtCount} associated districts. Delete might fail.
                                </div>
                            ) : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete Range
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
