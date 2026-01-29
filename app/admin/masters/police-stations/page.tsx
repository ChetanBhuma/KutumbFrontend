'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Building2, Users, Eye } from 'lucide-react';
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
}

interface SubDivision {
    id: string;
    code: string;
    name: string;
    districtId: string;
}

interface PoliceStation {
    id: string;
    code: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    rangeId: string;
    rangeName: string;
    rangeCode: string;
    districtId: string;
    districtName: string;
    districtCode: string;
    subDivisionId: string;
    subDivisionName: string;
    subDivisionCode: string;
    isActive: boolean;
    beatCount: number;
    citizenCount: number;
}

export default function PoliceStationsPage() {
    const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
    const [ranges, setRanges] = useState<Range[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [subDivisions, setSubDivisions] = useState<SubDivision[]>([]);

    // Filtered lists for cascading
    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
    const [filteredSubDivisions, setFilteredSubDivisions] = useState<SubDivision[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter states
    const [selectedRange, setSelectedRange] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedSubDivision, setSelectedSubDivision] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<PoliceStation | null>(null);
    const [viewingStation, setViewingStation] = useState<PoliceStation | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        latitude: '',
        longitude: '',
        rangeId: '',
        districtId: '',
        subDivisionId: '',
        isActive: true,
    });

    useEffect(() => {
        fetchRanges();
        fetchDistricts();
        fetchSubDivisions();
        fetchPoliceStations();
    }, []);

    // Filter districts when range changes (for filters)
    useEffect(() => {
        if (selectedRange) {
            const filtered = districts.filter(d => d.rangeId === selectedRange);
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts(districts);
        }
    }, [selectedRange, districts]);

    // Filter sub-divisions when district changes (for filters)
    useEffect(() => {
        if (selectedDistrict) {
            const filtered = subDivisions.filter(sd => sd.districtId === selectedDistrict);
            setFilteredSubDivisions(filtered);
        } else if (selectedRange) {
            const rangeDistricts = districts.filter(d => d.rangeId === selectedRange);
            const districtIds = rangeDistricts.map(d => d.id);
            const filtered = subDivisions.filter(sd => districtIds.includes(sd.districtId));
            setFilteredSubDivisions(filtered);
        } else {
            setFilteredSubDivisions(subDivisions);
        }
    }, [selectedDistrict, selectedRange, subDivisions, districts]);

    // Cascading for form
    const [formFilteredDistricts, setFormFilteredDistricts] = useState<District[]>([]);
    const [formFilteredSubDivisions, setFormFilteredSubDivisions] = useState<SubDivision[]>([]);

    useEffect(() => {
        if (formData.rangeId) {
            const filtered = districts.filter(d => d.rangeId === formData.rangeId);
            setFormFilteredDistricts(filtered);
        } else {
            setFormFilteredDistricts(districts);
        }
    }, [formData.rangeId, districts]);

    useEffect(() => {
        if (formData.districtId) {
            const filtered = subDivisions.filter(sd => sd.districtId === formData.districtId);
            setFormFilteredSubDivisions(filtered);
        } else {
            setFormFilteredSubDivisions([]);
        }
    }, [formData.districtId, subDivisions]);

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
            const response = await apiClient.get<{ success: boolean; data: SubDivision[] }>('/sub-divisions');
            if (response.success) {
                setSubDivisions(response.data);
                setFilteredSubDivisions(response.data);
            }
        } catch (error) {
            console.error('Error fetching sub-divisions:', error);
        }
    };

    const fetchPoliceStations = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedRange) params.append('rangeId', selectedRange);
            if (selectedDistrict) params.append('districtId', selectedDistrict);
            if (selectedSubDivision) params.append('subDivisionId', selectedSubDivision);

            const response = await apiClient.get<{ success: boolean; data: PoliceStation[] }>(`/police-stations?${params}`);
            if (response.success) {
                setPoliceStations(response.data);
            }
        } catch (error) {
            console.error('Error fetching police stations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPoliceStations();
    }, [selectedRange, selectedDistrict, selectedSubDivision]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
            };

            if (editingStation) {
                await apiClient.put(`/police-stations/${editingStation.id}`, payload);
            } else {
                await apiClient.post('/police-stations', payload);
            }
            fetchPoliceStations();
            closeModal();
        } catch (error: any) {
            console.error('Error saving police station:', error);
            alert(error.response?.data?.message || 'Failed to save police station');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this police station?')) return;

        try {
            await apiClient.delete(`/police-stations/${id}`);
            fetchPoliceStations();
        } catch (error: any) {
            console.error('Error deleting police station:', error);
            alert(error.response?.data?.message || 'Failed to delete police station');
        }
    };

    const openModal = (station?: PoliceStation) => {
        if (station) {
            setEditingStation(station);
            setFormData({
                code: station.code,
                name: station.name,
                address: station.address,
                phone: station.phone || '',
                email: station.email || '',
                latitude: station.latitude?.toString() || '',
                longitude: station.longitude?.toString() || '',
                rangeId: station.rangeId,
                districtId: station.districtId,
                subDivisionId: station.subDivisionId,
                isActive: station.isActive,
            });
        } else {
            setEditingStation(null);
            setFormData({
                code: '',
                name: '',
                address: '',
                phone: '',
                email: '',
                latitude: '',
                longitude: '',
                rangeId: '',
                districtId: '',
                subDivisionId: '',
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleView = (station: PoliceStation) => {
        setViewingStation(station);
        setViewModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStation(null);
        setFormData({
            code: '',
            name: '',
            address: '',
            phone: '',
            email: '',
            latitude: '',
            longitude: '',
            rangeId: '',
            districtId: '',
            subDivisionId: '',
            isActive: true,
        });
    };

    const filteredStations = policeStations.filter(ps =>
        ps.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: policeStations.length,
        active: policeStations.filter(ps => ps.isActive).length,
        beats: policeStations.reduce((sum, ps) => sum + ps.beatCount, 0),
        citizens: policeStations.reduce((sum, ps) => sum + ps.citizenCount, 0),
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Police Station Master</h1>
                <p className="text-gray-600">Manage police stations and their jurisdictions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Stations</p>
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
                            <p className="text-sm text-gray-600">Total Beats</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.beats}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Citizens</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.citizens}</p>
                        </div>
                        <Users className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Range Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Range
                        </label>
                        <select
                            value={selectedRange}
                            onChange={(e) => {
                                setSelectedRange(e.target.value);
                                setSelectedDistrict('');
                                setSelectedSubDivision('');
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
                            onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setSelectedSubDivision('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Districts</option>
                            {filteredDistricts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SubDivision Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Sub-Division
                        </label>
                        <select
                            value={selectedSubDivision}
                            onChange={(e) => setSelectedSubDivision(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Sub-Divisions</option>
                            {filteredSubDivisions.map((subDiv) => (
                                <option key={subDiv.id} value={subDiv.id}>
                                    {subDiv.name}
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
                                placeholder="Search stations..."
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
                            Add Station
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
                                    Sub-Division
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    District
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Range
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Beats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredStations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        No police stations found
                                    </td>
                                </tr>
                            ) : (
                                filteredStations.map((station) => (
                                    <tr key={station.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {station.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {station.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {station.subDivisionName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {station.districtName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {station.rangeName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {station.beatCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={station.isActive ? "default" : "destructive"} className={station.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                                                {station.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <TooltipProvider>
                                                <div className="flex justify-start gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleView(station)}
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
                                                                onClick={() => openModal(station)}
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit Station</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(station.id)}
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete Station</p>
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
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Police Station Details</DialogTitle>
                    </DialogHeader>
                    {viewingStation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">PC Code</h4>
                                    <p className="text-base font-semibold">{viewingStation.code}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <Badge variant={viewingStation.isActive ? "default" : "secondary"} className="mt-1">
                                        {viewingStation.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                                <p className="text-lg font-medium">{viewingStation.name}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                                <p className="text-sm text-gray-700">{viewingStation.address}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                                    <p className="text-sm">{viewingStation.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                    <p className="text-sm truncate">{viewingStation.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Coordinates</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Lat: {viewingStation.latitude || 'N/A'}<br />
                                        Lng: {viewingStation.longitude || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t mt-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Jurisdiction</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sub-Division:</span>
                                        <span className="font-medium">{viewingStation.subDivisionName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">District:</span>
                                        <span className="font-medium">{viewingStation.districtName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Range:</span>
                                        <span className="font-medium">{viewingStation.rangeName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-md">
                                        <span className="text-xs text-indigo-600 uppercase font-bold">Beats</span>
                                        <p className="text-2xl font-bold text-indigo-700">{viewingStation.beatCount || 0}</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-md">
                                        <span className="text-xs text-purple-600 uppercase font-bold">Citizens</span>
                                        <p className="text-2xl font-bold text-purple-700">{viewingStation.citizenCount || 0}</p>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingStation ? 'Edit Police Station' : 'Add New Police Station'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                        placeholder="e.g., PS_CONNAUGHT_PLACE"
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
                                        placeholder="e.g., PS Connaught Place"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Full address of the police station"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contact number"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Email address"
                                    />
                                </div>
                            </div>

                            {/* Cascading Dropdowns */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Range *
                                    </label>
                                    <select
                                        required
                                        value={formData.rangeId}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                rangeId: e.target.value,
                                                districtId: '',
                                                subDivisionId: ''
                                            });
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

                                {/* District */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        District *
                                    </label>
                                    <select
                                        required
                                        value={formData.districtId}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                districtId: e.target.value,
                                                subDivisionId: ''
                                            });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formData.rangeId}
                                    >
                                        <option value="">Select District</option>
                                        {formFilteredDistricts.map((district) => (
                                            <option key={district.id} value={district.id}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.rangeId && (
                                        <p className="text-xs text-gray-500 mt-1">Select a range first</p>
                                    )}
                                </div>

                                {/* SubDivision */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sub-Division *
                                    </label>
                                    <select
                                        required
                                        value={formData.subDivisionId}
                                        onChange={(e) => setFormData({ ...formData, subDivisionId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formData.districtId}
                                    >
                                        <option value="">Select Sub-Division</option>
                                        {formFilteredSubDivisions.map((subDiv) => (
                                            <option key={subDiv.id} value={subDiv.id}>
                                                {subDiv.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.districtId && (
                                        <p className="text-xs text-gray-500 mt-1">Select a district first</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Latitude */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 28.6139"
                                    />
                                </div>

                                {/* Longitude */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 77.2090"
                                    />
                                </div>
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
                                    {editingStation ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
