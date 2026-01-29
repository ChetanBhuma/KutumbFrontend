'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Building2, Globe, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
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
}

interface District {
    id: string;
    code: string;
    name: string;
    rangeId: string;
    rangeName: string;
}

interface SubDivision {
    id: string;
    code: string;
    name: string;
    districtId: string;
    districtName: string;
    districtCode: string;
    rangeId: string;
    rangeName: string;
    rangeCode: string;
    area: string;
    population: number;
    headquarters: string;
    isActive: boolean;
    policeStationCount: number;
    citizenCount: number;
}

export default function SubDivisionsPage() {
    const [subDivisions, setSubDivisions] = useState<SubDivision[]>([]);
    const [ranges, setRanges] = useState<Range[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRange, setSelectedRange] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingSubDivision, setEditingSubDivision] = useState<SubDivision | null>(null);
    const [viewingSubDivision, setViewingSubDivision] = useState<SubDivision | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        rangeId: '',
        districtId: '',
        area: '',
        population: 0,
        headquarters: '',
        isActive: true,
    });

    useEffect(() => {
        fetchRanges();
        fetchDistricts();
        fetchSubDivisions();
    }, []);

    useEffect(() => {
        // Filter districts when range changes
        if (selectedRange) {
            const filtered = districts.filter(d => d.rangeId === selectedRange);
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts(districts);
        }
    }, [selectedRange, districts]);

    useEffect(() => {
        // Filter districts for form when formData.rangeId changes
        if (formData.rangeId) {
            const filtered = districts.filter(d => d.rangeId === formData.rangeId);
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts(districts);
        }
    }, [formData.rangeId, districts]);

    const fetchRanges = async () => {
        try {
            const response = await apiClient.get<{ success: boolean; data: Range[] }>('/ranges');
            if (response.success) {
                setRanges(response.data);
            }
        } catch (error) {
            console.error('Error fetching ranges:', error);
        }
    };

    const fetchDistricts = async () => {
        try {
            const response = await apiClient.get<{ success: boolean; data: District[] }>('/districts');
            if (response.success) {
                setDistricts(response.data);
                setFilteredDistricts(response.data);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchSubDivisions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedRange) params.append('rangeId', selectedRange);
            if (selectedDistrict) params.append('districtId', selectedDistrict);

            const response = await apiClient.get<{ success: boolean; data: SubDivision[] }>(`/sub-divisions?${params}`);
            if (response.success) {
                setSubDivisions(response.data);
            }
        } catch (error) {
            console.error('Error fetching sub-divisions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubDivisions();
    }, [selectedRange, selectedDistrict]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingSubDivision) {
                await apiClient.put(`/sub-divisions/${editingSubDivision.id}`, formData);
            } else {
                await apiClient.post('/sub-divisions', formData);
            }
            fetchSubDivisions();
            closeModal();
        } catch (error: any) {
            console.error('Error saving sub-division:', error);
            alert(error.response?.data?.message || 'Failed to save sub-division');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sub-division?')) return;

        try {
            await apiClient.delete(`/sub-divisions/${id}`);
            fetchSubDivisions();
        } catch (error: any) {
            console.error('Error deleting sub-division:', error);
            alert(error.response?.data?.message || 'Failed to delete sub-division');
        }
    };

    const openModal = (subDivision?: SubDivision) => {
        if (subDivision) {
            setEditingSubDivision(subDivision);
            setFormData({
                code: subDivision.code,
                name: subDivision.name,
                rangeId: subDivision.rangeId,
                districtId: subDivision.districtId,
                area: subDivision.area || '',
                population: subDivision.population || 0,
                headquarters: subDivision.headquarters || '',
                isActive: subDivision.isActive,
            });
        } else {
            setEditingSubDivision(null);
            setFormData({
                code: '',
                name: '',
                rangeId: '',
                districtId: '',
                area: '',
                population: 0,
                headquarters: '',
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleView = (subDivision: SubDivision) => {
        setViewingSubDivision(subDivision);
        setViewModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSubDivision(null);
        setFormData({
            code: '',
            name: '',
            rangeId: '',
            districtId: '',
            area: '',
            population: 0,
            headquarters: '',
            isActive: true,
        });
    };

    const filteredSubDivisions = subDivisions.filter(sd =>
        sd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sd.districtName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: subDivisions.length,
        active: subDivisions.filter(sd => sd.isActive).length,
        policeStations: subDivisions.reduce((sum, sd) => sum + sd.policeStationCount, 0),
        citizens: subDivisions.reduce((sum, sd) => sum + sd.citizenCount, 0),
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Sub-Division Master</h1>
                <p className="text-gray-600">Manage administrative sub-divisions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Sub-Divisions</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Police Stations</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.policeStations}</p>
                        </div>
                        <Globe className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Citizens</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.citizens}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Range Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Range
                        </label>
                        <select
                            value={selectedRange}
                            onChange={(e) => {
                                setSelectedRange(e.target.value);
                                setSelectedDistrict(''); // Reset district when range changes
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Ranges</option>
                            {ranges.map((range) => (
                                <option key={range.id} value={range.id}>
                                    {range.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* District Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by District
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedRange && filteredDistricts.length === 0}
                        >
                            <option value="">All Districts</option>
                            {filteredDistricts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search sub-divisions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Add Button */}
                    <div className="flex items-end">
                        <button
                            onClick={() => openModal()}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Sub-Division
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    District
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Range
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Police Stations
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredSubDivisions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        No sub-divisions found
                                    </td>
                                </tr>
                            ) : (
                                filteredSubDivisions.map((subDiv) => (
                                    <tr key={subDiv.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {subDiv.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {subDiv.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {subDiv.districtName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {subDiv.rangeName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {subDiv.policeStationCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={subDiv.isActive ? "default" : "destructive"} className={subDiv.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                                                {subDiv.isActive ? 'Active' : 'Inactive'}
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
                                                                onClick={() => handleView(subDiv)}
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
                                                                onClick={() => openModal(subDiv)}
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit Sub-Division</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(subDiv.id)}
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete Sub-Division</p>
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
                        <DialogTitle>Sub-Division Details</DialogTitle>
                    </DialogHeader>
                    {viewingSubDivision && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Sub-Division Code</h4>
                                    <p className="text-base font-semibold">{viewingSubDivision.code}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <Badge variant={viewingSubDivision.isActive ? "default" : "secondary"} className="mt-1">
                                        {viewingSubDivision.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Sub-Division Name</h4>
                                <p className="text-lg font-medium">{viewingSubDivision.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">District</h4>
                                    <p className="text-sm font-medium text-blue-700">{viewingSubDivision.districtName || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Range</h4>
                                    <p className="text-sm font-medium text-blue-700">{viewingSubDivision.rangeName || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Headquarters</h4>
                                    <p className="text-sm">{viewingSubDivision.headquarters}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Area</h4>
                                    <p className="text-sm">{viewingSubDivision.area} sq km</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Population</h4>
                                    <p className="text-sm">{viewingSubDivision.population?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-md">
                                        <span className="text-xs text-indigo-600 uppercase font-bold">Police Stations</span>
                                        <p className="text-2xl font-bold text-indigo-700">{viewingSubDivision.policeStationCount || 0}</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-md">
                                        <span className="text-xs text-purple-600 uppercase font-bold">Citizens</span>
                                        <p className="text-2xl font-bold text-purple-700">{viewingSubDivision.citizenCount || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSubDivision ? 'Edit Sub-Division' : 'Add New Sub-Division'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Code *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., ASHOK_VIHAR"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Ashok Vihar"
                                />
                            </div>

                            {/* Range (Cascading) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Range *
                                </label>
                                <select
                                    required
                                    value={formData.rangeId}
                                    onChange={(e) => {
                                        setFormData({ ...formData, rangeId: e.target.value, districtId: '' });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Range</option>
                                    {ranges.map((range) => (
                                        <option key={range.id} value={range.id}>
                                            {range.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* District (Cascading) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    District *
                                </label>
                                <select
                                    required
                                    value={formData.districtId}
                                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={!formData.rangeId}
                                >
                                    <option value="">Select District</option>
                                    {filteredDistricts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                                {!formData.rangeId && (
                                    <p className="text-xs text-gray-500 mt-1">Select a range first</p>
                                )}
                            </div>

                            {/* Headquarters */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Headquarters
                                </label>
                                <input
                                    type="text"
                                    value={formData.headquarters}
                                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Ashok Vihar"
                                />
                            </div>

                            {/* Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Area (sq km)
                                </label>
                                <input
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 12.5"
                                />
                            </div>

                            {/* Population */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Population
                                </label>
                                <input
                                    type="number"
                                    value={formData.population}
                                    onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 50000"
                                />
                            </div>

                            {/* Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                    Active
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingSubDivision ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
