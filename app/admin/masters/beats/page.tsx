'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Users, Building, Eye } from 'lucide-react';
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
    subDivisionId: string;
}

interface Beat {
    id: string;
    code: string;
    name: string;
    beatNumber?: string;
    exactLocation?: string;
    landArea?: string;
    description?: string;
    policeStationId: string;
    policeStationName: string;
    policeStationCode: string;
    subDivisionId?: string;
    subDivisionName: string;
    subDivisionCode: string;
    districtId?: string;
    districtName: string;
    districtCode: string;
    rangeId?: string;
    rangeName: string;
    rangeCode: string;
    isActive: boolean;
    officerCount: number;
    citizenCount: number;
}

export default function BeatsPage() {
    const [beats, setBeats] = useState<Beat[]>([]);
    const [ranges, setRanges] = useState<Range[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [subDivisions, setSubDivisions] = useState<SubDivision[]>([]);
    const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);

    // Filtered lists for cascading
    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
    const [filteredSubDivisions, setFilteredSubDivisions] = useState<SubDivision[]>([]);
    const [filteredPoliceStations, setFilteredPoliceStations] = useState<PoliceStation[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter states
    const [selectedRange, setSelectedRange] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedSubDivision, setSelectedSubDivision] = useState<string>('');
    const [selectedPoliceStation, setSelectedPoliceStation] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
    const [viewingBeat, setViewingBeat] = useState<Beat | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        beatNumber: '',
        policeStationId: '',
        exactLocation: '',
        landArea: '',
        description: '',
        isActive: true,
    });

    // Form cascading
    const [formFilteredDistricts, setFormFilteredDistricts] = useState<District[]>([]);
    const [formFilteredSubDivisions, setFormFilteredSubDivisions] = useState<SubDivision[]>([]);
    const [formFilteredPoliceStations, setFormFilteredPoliceStations] = useState<PoliceStation[]>([]);
    const [formRangeId, setFormRangeId] = useState('');
    const [formDistrictId, setFormDistrictId] = useState('');
    const [formSubDivisionId, setFormSubDivisionId] = useState('');

    useEffect(() => {
        fetchRanges();
        fetchDistricts();
        fetchSubDivisions();
        fetchPoliceStations();
        fetchBeats();
    }, []);

    // Filter cascading for page filters
    useEffect(() => {
        if (selectedRange) {
            const filtered = districts.filter(d => d.rangeId === selectedRange);
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts(districts);
        }
    }, [selectedRange, districts]);

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

    useEffect(() => {
        if (selectedSubDivision) {
            const filtered = policeStations.filter(ps => ps.subDivisionId === selectedSubDivision);
            setFilteredPoliceStations(filtered);
        } else if (selectedDistrict) {
            const districtSubDivs = subDivisions.filter(sd => sd.districtId === selectedDistrict);
            const subDivIds = districtSubDivs.map(sd => sd.id);
            const filtered = policeStations.filter(ps => subDivIds.includes(ps.subDivisionId));
            setFilteredPoliceStations(filtered);
        } else {
            setFilteredPoliceStations(policeStations);
        }
    }, [selectedSubDivision, selectedDistrict, policeStations, subDivisions]);

    // Form cascading
    useEffect(() => {
        if (formRangeId) {
            const filtered = districts.filter(d => d.rangeId === formRangeId);
            setFormFilteredDistricts(filtered);
        } else {
            setFormFilteredDistricts([]);
        }
    }, [formRangeId, districts]);

    useEffect(() => {
        if (formDistrictId) {
            const filtered = subDivisions.filter(sd => sd.districtId === formDistrictId);
            setFormFilteredSubDivisions(filtered);
        } else {
            setFormFilteredSubDivisions([]);
        }
    }, [formDistrictId, subDivisions]);

    useEffect(() => {
        if (formSubDivisionId) {
            const filtered = policeStations.filter(ps => ps.subDivisionId === formSubDivisionId);
            setFormFilteredPoliceStations(filtered);
        } else {
            setFormFilteredPoliceStations([]);
        }
    }, [formSubDivisionId, policeStations]);

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
            }
        } catch (error) {
            console.error('Error fetching sub-divisions:', error);
        }
    };

    const fetchPoliceStations = async () => {
        try {
            const response = await apiClient.get<{ success: boolean; data: PoliceStation[] }>('/police-stations');
            if (response.success) {
                setPoliceStations(response.data);
            }
        } catch (error) {
            console.error('Error fetching police stations:', error);
        }
    };

    const fetchBeats = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedRange) params.append('rangeId', selectedRange);
            if (selectedDistrict) params.append('districtId', selectedDistrict);
            if (selectedSubDivision) params.append('subDivisionId', selectedSubDivision);
            if (selectedPoliceStation) params.append('policeStationId', selectedPoliceStation);

            const response = await apiClient.get<{ success: boolean; data: Beat[] }>(`/beats?${params}`);
            if (response.success) {
                setBeats(response.data);
            }
        } catch (error) {
            console.error('Error fetching beats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBeats();
    }, [selectedRange, selectedDistrict, selectedSubDivision, selectedPoliceStation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingBeat) {
                await apiClient.put(`/beats/${editingBeat.id}`, formData);
            } else {
                await apiClient.post('/beats', formData);
            }
            fetchBeats();
            closeModal();
        } catch (error: any) {
            console.error('Error saving beat:', error);
            alert(error.response?.data?.message || 'Failed to save beat');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this beat?')) return;

        try {
            await apiClient.delete(`/beats/${id}`);
            fetchBeats();
        } catch (error: any) {
            console.error('Error deleting beat:', error);
            alert(error.response?.data?.message || 'Failed to delete beat');
        }
    };

    const openModal = (beat?: Beat) => {
        if (beat) {
            setEditingBeat(beat);

            // Find the hierarchy for this beat
            const ps = policeStations.find(p => p.id === beat.policeStationId);
            const sd = ps ? subDivisions.find(s => s.id === ps.subDivisionId) : null;
            const d = sd ? districts.find(di => di.id === sd.districtId) : null;
            const r = d ? ranges.find(ra => ra.id === d.rangeId) : null;

            setFormRangeId(r?.id || '');
            setFormDistrictId(d?.id || '');
            setFormSubDivisionId(sd?.id || '');

            setFormData({
                code: beat.code,
                name: beat.name,
                beatNumber: beat.beatNumber || '',
                policeStationId: beat.policeStationId,
                exactLocation: beat.exactLocation || '',
                landArea: beat.landArea || '',
                description: beat.description || '',
                isActive: beat.isActive,
            });
        } else {
            setEditingBeat(null);
            setFormRangeId('');
            setFormDistrictId('');
            setFormSubDivisionId('');
            setFormData({
                code: '',
                name: '',
                beatNumber: '',
                policeStationId: '',
                exactLocation: '',
                landArea: '',
                description: '',
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleView = (beat: Beat) => {
        setViewingBeat(beat);
        setViewModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBeat(null);
        setFormRangeId('');
        setFormDistrictId('');
        setFormSubDivisionId('');
        setFormData({
            code: '',
            name: '',
            beatNumber: '',
            policeStationId: '',
            exactLocation: '',
            landArea: '',
            description: '',
            isActive: true,
        });
    };

    const filteredBeats = beats.filter(beat =>
        beat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (beat.beatNumber && beat.beatNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: beats.length,
        active: beats.filter(b => b.isActive).length,
        officers: beats.reduce((sum, b) => sum + b.officerCount, 0),
        citizens: beats.reduce((sum, b) => sum + b.citizenCount, 0),
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Beat Master</h1>
                <p className="text-gray-600">Manage beats and their assignments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Beats</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-500" />
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
                            <p className="text-sm text-gray-600">Officers</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.officers}</p>
                        </div>
                        <Building className="w-8 h-8 text-purple-500" />
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
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Range Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Range
                        </label>
                        <select
                            value={selectedRange}
                            onChange={(e) => {
                                setSelectedRange(e.target.value);
                                setSelectedDistrict('');
                                setSelectedSubDivision('');
                                setSelectedPoliceStation('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All</option>
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
                            District
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setSelectedSubDivision('');
                                setSelectedPoliceStation('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All</option>
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
                            Sub-Division
                        </label>
                        <select
                            value={selectedSubDivision}
                            onChange={(e) => {
                                setSelectedSubDivision(e.target.value);
                                setSelectedPoliceStation('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All</option>
                            {filteredSubDivisions.map((subDiv) => (
                                <option key={subDiv.id} value={subDiv.id}>
                                    {subDiv.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Police Station Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Police Station
                        </label>
                        <select
                            value={selectedPoliceStation}
                            onChange={(e) => setSelectedPoliceStation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All</option>
                            {filteredPoliceStations.map((ps) => (
                                <option key={ps.id} value={ps.id}>
                                    {ps.name}
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
                                placeholder="Search..."
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
                            Add Beat
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
                                    Beat #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Police Station
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    District
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Officers
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Citizens
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
                                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredBeats.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                        No beats found
                                    </td>
                                </tr>
                            ) : (
                                filteredBeats.map((beat) => (
                                    <tr key={beat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {beat.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {beat.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {beat.beatNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {beat.policeStationName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {beat.districtName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {beat.officerCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {beat.citizenCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={beat.isActive ? "default" : "destructive"} className={beat.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                                                {beat.isActive ? 'Active' : 'Inactive'}
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
                                                                onClick={() => handleView(beat)}
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
                                                                onClick={() => openModal(beat)}
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit Beat</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(beat.id)}
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete Beat</p>
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
                        <DialogTitle>Beat Details</DialogTitle>
                    </DialogHeader>
                    {viewingBeat && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Beat Code</h4>
                                    <p className="text-base font-semibold">{viewingBeat.code}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Statistic</h4>
                                    <Badge variant={viewingBeat.isActive ? "default" : "secondary"} className="mt-1">
                                        {viewingBeat.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Beat Name</h4>
                                <p className="text-lg font-medium">{viewingBeat.name}</p>
                                {viewingBeat.beatNumber && (
                                    <p className="text-sm text-gray-500">No: {viewingBeat.beatNumber}</p>
                                )}
                            </div>

                            <div className="border-t pt-2 mt-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Jurisdiction</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Police Station:</span>
                                        <span className="font-medium">{viewingBeat.policeStationName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sub-Division:</span>
                                        <span className="font-medium">{viewingBeat.subDivisionName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">District:</span>
                                        <span className="font-medium">{viewingBeat.districtName}</span>
                                    </div>
                                </div>
                            </div>

                            {(viewingBeat.exactLocation || viewingBeat.landArea || viewingBeat.description) && (
                                <div className="border-t pt-2">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Info</h4>
                                    {viewingBeat.exactLocation && (
                                        <div className="mb-2">
                                            <span className="text-xs text-gray-500 block">Location:</span>
                                            <p className="text-sm">{viewingBeat.exactLocation}</p>
                                        </div>
                                    )}
                                    {viewingBeat.landArea && (
                                        <div className="mb-2">
                                            <span className="text-xs text-gray-500 block">Area:</span>
                                            <p className="text-sm">{viewingBeat.landArea} sq km</p>
                                        </div>
                                    )}
                                    {viewingBeat.description && (
                                        <div>
                                            <span className="text-xs text-gray-500 block">Description:</span>
                                            <p className="text-sm text-gray-600">{viewingBeat.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-md">
                                        <span className="text-xs text-indigo-600 uppercase font-bold">Officers</span>
                                        <p className="text-2xl font-bold text-indigo-700">{viewingBeat.officerCount || 0}</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-md">
                                        <span className="text-xs text-purple-600 uppercase font-bold">Citizens</span>
                                        <p className="text-2xl font-bold text-purple-700">{viewingBeat.citizenCount || 0}</p>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingBeat ? 'Edit Beat' : 'Add New Beat'}
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
                                        placeholder="e.g., BEAT_001"
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
                                        placeholder="e.g., Beat 1"
                                    />
                                </div>

                                {/* Beat Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Beat Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.beatNumber}
                                        onChange={(e) => setFormData({ ...formData, beatNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., B-001"
                                    />
                                </div>

                                {/* Land Area */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Land Area (sq km)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.landArea}
                                        onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 2.5"
                                    />
                                </div>
                            </div>

                            {/* Exact Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exact Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.exactLocation}
                                    onChange={(e) => setFormData({ ...formData, exactLocation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Detailed location description"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Additional details about the beat"
                                />
                            </div>

                            {/* Cascading Dropdowns */}
                            <div className="grid grid-cols-4 gap-4">
                                {/* Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Range *
                                    </label>
                                    <select
                                        required
                                        value={formRangeId}
                                        onChange={(e) => {
                                            setFormRangeId(e.target.value);
                                            setFormDistrictId('');
                                            setFormSubDivisionId('');
                                            setFormData({ ...formData, policeStationId: '' });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select</option>
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
                                        value={formDistrictId}
                                        onChange={(e) => {
                                            setFormDistrictId(e.target.value);
                                            setFormSubDivisionId('');
                                            setFormData({ ...formData, policeStationId: '' });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formRangeId}
                                    >
                                        <option value="">Select</option>
                                        {formFilteredDistricts.map((district) => (
                                            <option key={district.id} value={district.id}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* SubDivision */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sub-Division *
                                    </label>
                                    <select
                                        required
                                        value={formSubDivisionId}
                                        onChange={(e) => {
                                            setFormSubDivisionId(e.target.value);
                                            setFormData({ ...formData, policeStationId: '' });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formDistrictId}
                                    >
                                        <option value="">Select</option>
                                        {formFilteredSubDivisions.map((subDiv) => (
                                            <option key={subDiv.id} value={subDiv.id}>
                                                {subDiv.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Police Station */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Police Station *
                                    </label>
                                    <select
                                        required
                                        value={formData.policeStationId}
                                        onChange={(e) => setFormData({ ...formData, policeStationId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formSubDivisionId}
                                    >
                                        <option value="">Select</option>
                                        {formFilteredPoliceStations.map((ps) => (
                                            <option key={ps.id} value={ps.id}>
                                                {ps.name}
                                            </option>
                                        ))}
                                    </select>
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
                                    {editingBeat ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
