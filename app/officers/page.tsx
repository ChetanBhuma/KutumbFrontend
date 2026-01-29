'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { usePaginatedQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Phone, MapPin, Users } from 'lucide-react';

interface Officer {
    id: string;
    name: string;
    rank: string;
    badgeNumber: string;
    mobileNumber: string;
    email?: string;
    policeStationId?: string;
    districtId?: string;
    beatId?: string;
    isActive: boolean;
    PoliceStation?: {
        id: string;
        name: string;
        code: string;
    };
    District?: {
        id: string;
        name: string;
    };
    Beat?: {
        id: string;
        name: string;
        code: string;
    };
}

export default function OfficersPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [policeStationFilter, setPoliceStationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('true');

    const [districts, setDistricts] = useState<any[]>([]);
    const [policeStations, setPoliceStations] = useState<any[]>([]);
    const [filteredPoliceStations, setFilteredPoliceStations] = useState<any[]>([]);

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const [districtsRes, policeStationsRes] = await Promise.all([
                    apiClient.getDistricts(),
                    apiClient.getPoliceStations()
                ]);

                if ((districtsRes as any).success) {
                    setDistricts((districtsRes as any).data.districts || (districtsRes as any).data || []);
                }

                if ((policeStationsRes as any).success) {
                    setPoliceStations((policeStationsRes as any).data.policeStations || (policeStationsRes as any).data || []);
                    setFilteredPoliceStations((policeStationsRes as any).data.policeStations || (policeStationsRes as any).data || []);
                }
            } catch (error) {
                console.error('Failed to fetch masters:', error);
            }
        };
        fetchMasters();
    }, []);

    useEffect(() => {
        if (districtFilter) {
            const filtered = policeStations.filter(ps => ps.districtId === districtFilter);
            setFilteredPoliceStations(filtered);
            if (policeStationFilter && !filtered.find(ps => ps.id === policeStationFilter)) {
                setPoliceStationFilter('');
            }
        } else {
            setFilteredPoliceStations(policeStations);
        }
    }, [districtFilter, policeStations, policeStationFilter]);

    const queryFn = useCallback((page: number, limit: number) => apiClient.getOfficers({
        page,
        limit,
        search: search || undefined,
        districtId: districtFilter || undefined,
        policeStationId: policeStationFilter || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
    }), [search, districtFilter, policeStationFilter, statusFilter]);

    const {
        data: officers,
        loading,
        error,
        pagination,
        page,
        setPage
    } = usePaginatedQuery<Officer>(
        queryFn,
        1,
        20
    );

    const getRankColor = (rank: string) => {
        switch (rank.toLowerCase()) {
            case 'inspector':
            case 'sub-inspector':
                return 'bg-blue-100 text-blue-800';
            case 'head constable':
                return 'bg-purple-100 text-purple-800';
            case 'constable':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderTable = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading officers...</p>
                </div>
            );
        }

        if (officers.length === 0) {
            return (
                <Card>
                    <CardContent className="text-center py-12">
                        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No officers found</p>
                        <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Badge Number</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Police Station</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Beat</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {officers.map((officer: Officer) => (
                            <TableRow key={officer.id} className="text-sm">
                                <TableCell className="font-medium font-mono">{officer.badgeNumber}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        {officer.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getRankColor(officer.rank)}>
                                        {officer.rank}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-xs">
                                            <Phone className="h-3 w-3" />
                                            {officer.mobileNumber}
                                        </div>
                                        {officer.email && (
                                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                {officer.email}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-gray-500" />
                                        {officer.PoliceStation?.name || 'Not Assigned'}
                                    </div>
                                </TableCell>
                                <TableCell>{officer.District?.name || '-'}</TableCell>
                                <TableCell>
                                    {officer.Beat ? (
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-gray-500" />
                                            {officer.Beat.name}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge className={officer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                        {officer.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => router.push(`/officers/${officer.id}`)}>
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        );
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} officers
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Previous
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                        <span className="text-sm">Page {page} of {pagination.totalPages}</span>
                    </div>
                    <Button variant="outline" disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <ProtectedRoute permissionCode="officers.read">
            <DashboardLayout title="Officers" description="Manage officer assignments and records" currentPath="/officers">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Officers</h1>
                        <p className="text-muted-foreground">Overview of all officers across Delhi Police jurisdiction</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.push('/users')}>+ Add Officer</Button>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <Input
                            placeholder="Search by name, badge, phone..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />

                        <Select
                            value={districtFilter || 'all'}
                            onValueChange={(value) => {
                                setDistrictFilter(value === 'all' ? '' : value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="District" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {districts.map((district) => (
                                    <SelectItem key={district.id} value={district.id}>
                                        {district.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={policeStationFilter || 'all'}
                            onValueChange={(value) => {
                                setPoliceStationFilter(value === 'all' ? '' : value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Police Station" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Police Stations</SelectItem>
                                {filteredPoliceStations.map((ps) => (
                                    <SelectItem key={ps.id} value={ps.id}>
                                        {ps.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setDistrictFilter('');
                                setPoliceStationFilter('');
                                setStatusFilter('true');
                                setPage(1);
                            }}
                        >
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>

                {renderTable()}
                {renderPagination()}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
