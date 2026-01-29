'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { usePaginatedQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Citizen {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  mobileNumber: string;
  permanentAddress: string;
  vulnerabilityLevel: string;
  idVerificationStatus: string;
  createdAt: string;
}

import { ExportButton } from '@/components/ui/export-button';

export default function CitizensPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [vulnerabilityFilter, setVulnerabilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Use the new usePaginatedQuery hook with useCallback
  const queryFn = useCallback((page: number, limit: number) => apiClient.getCitizens({
    page,
    limit,
    search: search || undefined,
    vulnerabilityLevel: vulnerabilityFilter || undefined,
    verificationStatus: statusFilter || undefined,
  }), [search, vulnerabilityFilter, statusFilter]);

  const {
    data: citizens,
    loading,
    error,
    pagination,
    page,
    setPage
  } = usePaginatedQuery<Citizen>(
    queryFn,
    1,
    20
  );

  const getVulnerabilityColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading citizens...</p>
        </div>
      );
    }

    if (citizens.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No citizens found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age/Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Vulnerability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citizens.map((citizen: Citizen) => (
              <TableRow key={citizen.id} className="text-sm">
                <TableCell className="font-medium">{citizen.fullName}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{citizen.age} yrs</span>
                    <span className="text-muted-foreground">{citizen.gender}</span>
                  </div>
                </TableCell>
                <TableCell>{citizen.mobileNumber}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">{citizen.permanentAddress}</div>
                </TableCell>
                <TableCell>
                  <Badge className={getVulnerabilityColor(citizen.vulnerabilityLevel)}>
                    {citizen.vulnerabilityLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(citizen.idVerificationStatus)}>
                    {citizen.idVerificationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/citizens/${citizen.id}`)}>
                    View
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => router.push(`/citizens/${citizen.id}/edit`)}>
                    Edit
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
          Page {page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute permissionCode="citizens.read">
      <DashboardLayout title="Senior Citizens" description="Manage registrations, statuses, and records" currentPath="/citizens">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Senior Citizens</h1>
            <p className="text-muted-foreground">Overview of registered citizens across Delhi Police jurisdiction</p>
          </div>
          <div className="flex gap-2">
            <ExportButton
              type="citizens"
              filters={{
                search,
                vulnerabilityLevel: vulnerabilityFilter,
                status: statusFilter
              }}
            />
            <Button variant="outline" onClick={() => router.push('/citizens/map')}>
              Map View
            </Button>
            <Button onClick={() => router.push('/citizens/register')}>+ Register Citizen</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name, phone, Aadhaar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Select
              value={vulnerabilityFilter || 'all'}
              onValueChange={(value) => {
                setVulnerabilityFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vulnerability Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) => {
                setStatusFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Verified">Verified (Approved)</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setVulnerabilityFilter('');
                setStatusFilter('');
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
