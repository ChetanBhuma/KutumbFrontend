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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface District {
    id: string;
    code: string;
    name: string;
    rangeId: string;
    rangeName?: string;
    rangeCode?: string;
    area: string;
    population: number;
    headquarters: string;
    isActive: boolean;
    policeStationCount: number;
    citizenCount: number;
}

interface Range {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
}

export default function DistrictsPage() {

    const [showModal, setShowModal] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
    const [viewingDistrict, setViewingDistrict] = useState<District | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRange, setFilterRange] = useState<string>('all');
    const [districtToDelete, setDistrictToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        rangeId: '',
        area: '',
        population: 0,
        headquarters: '',
        isActive: true,
    });

    // Fetch ranges dynamically
    const fetchRanges = useCallback(() => apiClient.get('/ranges') as Promise<{ data: Range[] }>, []);
    const { data: rangesResult } = useApiQuery<Range[]>(fetchRanges, { refetchOnMount: true });
    const ranges = rangesResult || [];

    const fetchDistricts = useCallback(() => apiClient.get('/districts', {
        params: { rangeId: filterRange !== 'all' ? filterRange : undefined }
    }) as Promise<{ data: District[] }>, [filterRange]);

    const { data: districtsResult, loading, refetch } = useApiQuery<District[]>(
        fetchDistricts,
        { refetchOnMount: true }
    );

    const districts = districtsResult || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingDistrict) {
                await apiClient.put(`/districts/${editingDistrict.id}`, formData);
            } else {
                await apiClient.post('/districts', formData);
            }

            refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving district:', error);
            alert('Error saving district');
        }
    };

    const handleEdit = (district: District) => {
        setEditingDistrict(district);
        setFormData({
            code: district.code,
            name: district.name,
            rangeId: district.rangeId,
            area: district.area,
            population: district.population,
            headquarters: district.headquarters,
            isActive: district.isActive,
        });
        setShowModal(true);
    };

    const handleView = (district: District) => {
        setViewingDistrict(district);
        setViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!districtToDelete) return;

        try {
            await apiClient.delete(`/districts/${districtToDelete}`);
            refetch();
            setDistrictToDelete(null);
        } catch (error) {
            console.error('Error deleting district:', error);
            alert('Error deleting district');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDistrict(null);
        setFormData({
            code: '',
            name: '',
            rangeId: '',
            area: '',
            population: 0,
            headquarters: '',
            isActive: true,
        });
    };

    const filteredDistricts = districts.filter(district =>
        district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        district.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Districts Master</h1>
                <p className="text-gray-600">Manage geographical districts</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600">Total Districts</div>
                    <div className="text-2xl font-bold">{districts.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600">Active</div>
                    <div className="text-2xl font-bold text-green-600">
                        {districts.filter(d => d.isActive).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                    <div className="text-sm text-gray-600">Ranges</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {ranges.filter(r => r.isActive).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600">Police Stations</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {districts.reduce((sum, d) => sum + (d.policeStationCount || 0), 0)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                    <div className="text-sm text-gray-600">Total Population</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {(districts.reduce((sum, d) => sum + (d.population || 0), 0) / 1000000).toFixed(1)}M
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search districts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="w-48">
                        <Select value={filterRange} onValueChange={setFilterRange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Ranges" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ranges</SelectItem>
                                {ranges.map(range => (
                                    <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add District
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Range</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Population</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Headquarters</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stations</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">Loading districts...</td>
                                </tr>
                            ) : filteredDistricts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        No districts found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredDistricts.map((district) => (
                                    <tr key={district.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{district.code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{district.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {district.rangeName || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{district.area}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{(district.population / 1000).toFixed(0)}K</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{district.headquarters}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{district.policeStationCount || 0}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <Badge variant={district.isActive ? "default" : "destructive"} className={district.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                                                {district.isActive ? 'Active' : 'Inactive'}
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
                                                                onClick={() => handleView(district)}
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
                                                                onClick={() => handleEdit(district)}
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit District</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDistrictToDelete(district.id)}
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete District</p>
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
            </div>

            {/* View Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>District Details</DialogTitle>
                    </DialogHeader>
                    {viewingDistrict && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">District Code</h4>
                                    <p className="text-base font-semibold">{viewingDistrict.code}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <Badge variant={viewingDistrict.isActive ? "default" : "secondary"} className="mt-1">
                                        {viewingDistrict.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">District Name</h4>
                                <p className="text-lg font-medium">{viewingDistrict.name}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Parent Range</h4>
                                <p className="text-base font-medium text-blue-700">{viewingDistrict.rangeName || 'N/A'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Headquarters</h4>
                                    <p className="text-sm">{viewingDistrict.headquarters}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Area</h4>
                                    <p className="text-sm">{viewingDistrict.area} sq km</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Population</h4>
                                    <p className="text-sm">{viewingDistrict.population.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-md">
                                        <span className="text-xs text-indigo-600 uppercase font-bold">Police Stations</span>
                                        <p className="text-2xl font-bold text-indigo-700">{viewingDistrict.policeStationCount || 0}</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-md">
                                        <span className="text-xs text-purple-600 uppercase font-bold">Citizens</span>
                                        <p className="text-2xl font-bold text-purple-700">{viewingDistrict.citizenCount || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingDistrict ? 'Edit District' : 'Add District'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Code*</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g., NDIST01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Name*</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Central Delhi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Range*</label>
                                    <Select
                                        value={formData.rangeId}
                                        onValueChange={(val) => setFormData({ ...formData, rangeId: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ranges.map(range => (
                                                <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Area (sq km)*</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        placeholder="e.g., 25.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Population*</label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.population}
                                        onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) })}
                                        placeholder="e.g., 500000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Headquarters*</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.headquarters}
                                        onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                                        placeholder="e.g., Connaught Place"
                                    />
                                </div>

                                <div className="col-span-2">
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
                                    {editingDistrict ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!districtToDelete} onOpenChange={(open) => !open && setDistrictToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the district
                            and remove it from our servers.
                            {districtToDelete && filteredDistricts.find(d => d.id === districtToDelete)?.policeStationCount ? (
                                <div className="mt-2 text-red-600 font-semibold">
                                    Warning: This district has {filteredDistricts.find(d => d.id === districtToDelete)?.policeStationCount} associated police stations. Delete might fail.
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
                            Delete District
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
