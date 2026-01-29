'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, CheckCircle2, AlertCircle, XCircle, Timer } from 'lucide-react';
import { format } from 'date-fns';

interface CitizenOption {
  id: string;
  fullName: string;
  mobileNumber: string;
}

interface OfficerOption {
  id: string;
  name: string;
  rank?: string;
}

interface Visit {
  id: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  visitType: string;
  notes?: string;
  officer?: {
    name: string;
    rank?: string;
  };
}

export default function ScheduleVisitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citizenIdParam = searchParams.get('citizenId');

  const { user, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    seniorCitizenId: citizenIdParam || '',
    officerId: '',
    scheduledDate: '',
    visitType: 'Routine',
    notes: '',
  });

  const fetchCitizens = useCallback(() => apiClient.getCitizens({ limit: 100 }), []);

  // Fetch officers manually
  const fetchOfficers = useCallback(async () => {
    // API returns { success: true, data: { items: [...], pagination: ... } }
    const response = await apiClient.get('/officers', { params: { isActive: true, hasBeat: true } }) as any;
    if (response.success && response.data?.items) {
      return { data: response.data.items };
    }
    return { data: [] };
  }, []);

  const fetchVisits = useCallback(() => {
    if (!formData.seniorCitizenId) return Promise.resolve({ data: { items: [] } }); // Return items: [] to match expected struct
    return apiClient.getVisits({ citizenId: formData.seniorCitizenId, limit: 20 });
  }, [formData.seniorCitizenId]);

  // CitizenController: returns { data: { citizens: [...] } }
  // useApiQuery unwraps 'data', so we get { citizens: [...] }
  // CitizenController: returns { data: { citizens: [...] } }
  // useApiQuery unwraps 'data', so we get { citizens: [...] }
  const { data: citizensData } = useApiQuery<{ citizens: CitizenOption[] }>(fetchCitizens, {
    refetchOnMount: true,
    enabled: !!user && user.role !== 'CITIZEN'
  });

  // OfficerController: returns { data: { items: [...] } }
  // Our fetchOfficers returns { data: [...] } (we manually unwrapped items)
  // useApiQuery unwraps 'data', so we get [...] (array)
  const { data: officersData } = useApiQuery<OfficerOption[]>(fetchOfficers, {
    refetchOnMount: true,
    enabled: !!user && user.role !== 'CITIZEN'
  });

  // VisitController: returns { data: { items: [...] } }
  // useApiQuery unwraps 'data', so we get { items: [...] }
  const { data: visitsData, loading: visitsLoading, refetch: refetchVisits } = useApiQuery<{ items: Visit[] }>(fetchVisits, {
    refetchOnMount: true,
    enabled: !!formData.seniorCitizenId
  });

  // Correctly map based on controller response structure
  const citizens = citizensData?.citizens || [];
  const officers = officersData || [];
  const visits = visitsData?.items || [];



  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.seniorCitizenId || !formData.officerId || !formData.scheduledDate) {
      setError('All required fields must be filled');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await apiClient.createVisit(formData);
      // Refresh visits and clear form (except citizen if selected)
      refetchVisits();
      setFormData(prev => ({
        ...prev,
        scheduledDate: '',
        notes: '',
        visitType: 'Routine'
      }));
    } catch (err: any) {
      console.error('Failed to schedule visit', err);
      setError(err.response?.data?.message || 'Unable to schedule visit');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      scheduled: visits.filter(v => v.status === 'Scheduled').length,
      inProgress: visits.filter(v => v.status === 'In Progress').length,
      completed: visits.filter(v => v.status === 'Completed').length,
      cancelled: visits.filter(v => v.status === 'Cancelled').length,
    };
  }, [visits]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'Scheduled': return <Calendar className="w-4 h-4" />;
      case 'In Progress': return <Timer className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <ProtectedRoute permissionCode="visits.schedule">
      <DashboardLayout
        title="Schedule Visit"
        description="Manage visit schedules and view history"
        currentPath="/visits/schedule"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Schedule Form */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>New Visit</CardTitle>
                <CardDescription>Schedule a new engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senior Citizen</Label>
                    <Select
                      value={formData.seniorCitizenId}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, seniorCitizenId: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select citizen" />
                      </SelectTrigger>
                      <SelectContent>
                        {citizens.map((citizen) => (
                          <SelectItem key={citizen.id} value={citizen.id}>
                            {citizen.fullName} · {citizen.mobileNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Officer</Label>
                    <Select
                      value={formData.officerId}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, officerId: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select officer" />
                      </SelectTrigger>
                      <SelectContent>
                        {officers.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id}>
                            {officer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Visit Type</Label>
                    <Select
                      value={formData.visitType}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, visitType: val as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Routine">Routine</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any specific instructions..."
                      className="h-24"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Scheduling...' : 'Schedule Visit'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Timeline & History */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Scheduled</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cancelled</div>
                </CardContent>
              </Card>
            </div>

            {/* Visit Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Visit Timeline</CardTitle>
                <CardDescription>Recent visits and scheduled engagements</CardDescription>
              </CardHeader>
              <CardContent>
                {visitsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading visits...</div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No visits found for this citizen.</div>
                ) : (
                  <div className="relative space-y-8 pl-2">
                    {visits.slice(0, 5).map((visit, index) => (
                      <div key={visit.id} className="relative flex gap-6 group">
                        {/* Timeline Line */}
                        {index !== visits.slice(0, 5).length - 1 && (
                          <div className="absolute left-[19px] top-8 bottom-[-32px] w-px bg-border group-last:hidden" />
                        )}

                        {/* Icon */}
                        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border ${getStatusColor(visit.status)} bg-white`}>
                          {getStatusIcon(visit.status)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-foreground">
                              {format(new Date(visit.scheduledDate), 'dd MMM yyyy, hh:mm a')}
                            </div>
                            <Badge variant="outline" className={getStatusColor(visit.status)}>
                              {visit.status}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium text-foreground/80">
                            {visit.visitType} · {visit.officer?.name}
                          </div>
                          {visit.notes && (
                            <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {visit.notes}
                            </div>
                          )}
                          {visit.completedDate && (
                            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed on {format(new Date(visit.completedDate), 'dd MMM yyyy, hh:mm a')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visit Management Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Visit Management</CardTitle>
                    <CardDescription>Update visit outcomes or manage scheduling</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/visits')}>
                    View all visits
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Officer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {format(new Date(visit.scheduledDate), 'dd MMM yyyy')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(visit.scheduledDate), 'hh:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{visit.officer?.name}</span>
                              <span className="text-xs text-muted-foreground">{visit.officer?.rank || 'Officer'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{visit.visitType}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(visit.status)}>
                              {visit.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <Clock className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {visits.length === 0 && !visitsLoading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                            No visits found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
