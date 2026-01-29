'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { usePaginatedQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { MapPin, Phone, Navigation, User, Clock, FileText, Eye } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExportButton } from '@/components/ui/export-button';

interface VisitRecord {
  id: string;
  SeniorCitizen?: {
    id: string;
    fullName: string;
    mobileNumber: string;
    permanentAddress: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
  };
  officer?: {
    id: string;
    name: string;
  };
  scheduledDate: string;
  visitType: 'Routine' | 'Emergency' | 'Follow-up' | 'Verification';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'SCHEDULED' | 'IN PROGRESS' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  duration?: number;
  createdAt: string;
  startedAt?: string;
  completedDate?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  riskScore?: number;
  photoUrl?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type VisitAction = 'complete' | 'cancel' | 'reschedule' | 'start';

const getCoordinates = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error obtaining location', error);
        resolve(null);
      }
    );
  });
};

export default function VisitsPage() {
  const router = useRouter();
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  const [actionVisit, setActionVisit] = useState<VisitRecord | null>(null);
  const [actionType, setActionType] = useState<VisitAction | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionDuration, setActionDuration] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [autoScheduleLoading, setAutoScheduleLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    visitType: 'all'
  });
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN PROGRESS':
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const {
    data: visits,
    loading,
    error,
    pagination,
    page,
    setPage,
    limit,
    refetch
  } = usePaginatedQuery<VisitRecord>(
    useCallback(async (page, limit) => {
      const params: any = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.visitType !== 'all') params.visitType = filters.visitType;
      if (dateFilter) {
        params.startDate = format(dateFilter, 'yyyy-MM-dd');
        params.endDate = format(dateFilter, 'yyyy-MM-dd');
      }
      return apiClient.getVisits(params);
    }, [filters, dateFilter])
  );

  const executeStartVisit = async (visit: VisitRecord) => {
    try {
      setActionType('start'); // Used for loading state
      const coords = await getCoordinates();
      await apiClient.startVisit(visit.id, coords || undefined);
      await refetch();
      // Update selected visit state if it's the one we just started
      if (selectedVisit && selectedVisit.id === visit.id) {
        const updated = { ...selectedVisit, status: 'In Progress' as const };
        setSelectedVisit(updated);
      }
      setActionType(null); // Clear loading state
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start visit. Ensure you are within range.');
      setActionType(null);
    }
  };

  const executeAction = async () => {
    if (!actionVisit || !actionType) return;
    try {
      setActionLoading(true);
      if (actionType === 'complete') {
        const coords = await getCoordinates();
        await apiClient.completeVisit(actionVisit.id, {
          notes: actionNotes,
          duration: actionDuration ? Number(actionDuration) : undefined,
          gpsLatitude: coords?.latitude,
          gpsLongitude: coords?.longitude
        });
      } else if (actionType === 'cancel') {
        await apiClient.cancelVisit(actionVisit.id, actionNotes);
      } else if (actionType === 'reschedule') {
        if (!actionNotes) {
          alert('Please select a date and time');
          setActionLoading(false);
          return;
        }
        // actionNotes from datetime-local input is 'YYYY-MM-DDTHH:mm'
        const dateObj = new Date(actionNotes);
        if (isNaN(dateObj.getTime())) {
          alert('Invalid date selected');
          setActionLoading(false);
          return;
        }
        await apiClient.updateVisit(actionVisit.id, {
          scheduledDate: dateObj.toISOString(),
        });
      }
      await refetch();
      setActionVisit(null);
      setActionType(null);
      setActionNotes('');
      setActionDuration('');
      // Close sheet if open and matches
      if (selectedVisit && selectedVisit.id === actionVisit.id) {
        setSelectedVisit(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoSchedule = async () => {
    try {
      setAutoScheduleLoading(true);
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 7);
      await apiClient.autoScheduleVisits({
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
      });
      await refetch();
      alert('Auto-schedule completed for the next 7 days');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Auto-schedule failed');
    } finally {
      setAutoScheduleLoading(false);
    }
  };

  const renderActionDialog = () => {
    if (!actionVisit || !actionType) return null;
    const isComplete = actionType === 'complete';
    const isReschedule = actionType === 'reschedule';
    return (
      <Dialog
        open={!!actionVisit}
        onOpenChange={(open) => {
          if (!open) {
            setActionVisit(null);
            setActionType(null);
            setActionNotes('');
            setActionDuration('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isComplete ? 'Complete Visit' : isReschedule ? 'Reschedule Visit' : 'Cancel Visit'}
            </DialogTitle>
            <DialogDescription>
              {actionVisit.SeniorCitizen?.fullName} · {format(new Date(actionVisit.scheduledDate), 'PPpp')}
            </DialogDescription>
          </DialogHeader>
          {isComplete && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Completion Notes</label>
              <Textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} placeholder="Summary, concerns, next steps" />
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input type="number" value={actionDuration} onChange={(e) => setActionDuration(e.target.value)} placeholder="e.g. 45" />
            </div>
          )}
          {actionType === 'cancel' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Cancellation Reason</label>
              <Textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} placeholder="Reason for cancellation" />
            </div>
          )}
          {isReschedule && (
            <div className="space-y-3">
              <label className="text-sm font-medium">New Scheduled Date & Time</label>
              <Input
                type="datetime-local"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionVisit(null)}>
              Close
            </Button>
            <Button onClick={executeAction} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <ProtectedRoute permissionCode="visits.read">
      <DashboardLayout
        title="Visit Management"
        description="Track, schedule, and complete home visits for registered senior citizens"
        currentPath="/visits"
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search citizen, officer, or phone"
                value={filters.search}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, search: e.target.value }));
                }}
                className="max-w-sm"
              />
              <Select
                value={filters.status}
                onValueChange={(value) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, status: value }));
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.visitType}
                onValueChange={(value) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, visitType: value }));
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Verification">Verification</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-[220px] justify-start text-left font-normal', !dateFilter && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, 'PPP') : 'Filter by date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => {
                      setDateFilter(date);
                      setPage(1);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-wrap gap-2">
              <ExportButton
                type="visits"
                filters={{
                  search: filters.search,
                  status: filters.status === 'all' ? undefined : filters.status,
                  visitType: filters.visitType === 'all' ? undefined : filters.visitType,
                  startDate: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
                  endDate: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined
                }}
              />
              <Button variant="outline" onClick={handleAutoSchedule} disabled={autoScheduleLoading}>
                {autoScheduleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '🤖 Auto-Schedule'}
              </Button>
              <Button onClick={() => router.push('/visits/schedule')}>+ Schedule Visit</Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Scheduled Visits</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Citizen</TableHead>
                      <TableHead>Officer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : visits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No visits match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visits.map((visit: VisitRecord) => (
                        <TableRow key={visit.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{visit.SeniorCitizen?.fullName ?? 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">{visit.SeniorCitizen?.mobileNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>{visit.officer?.name ?? 'Unassigned'}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{format(new Date(visit.scheduledDate), 'PPpp')}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(visit.scheduledDate), { addSuffix: true })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{visit.visitType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusStyles(visit.status)}>{visit.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(visit.createdAt), { addSuffix: true })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedVisit(visit)}>
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>

                              {['Scheduled', 'SCHEDULED', 'In Progress', 'IN PROGRESS', 'IN_PROGRESS'].includes(visit.status) && (
                                <Button size="sm" variant="outline" onClick={() => { setActionVisit(visit); setActionType('reschedule'); }}>
                                  Reschedule
                                </Button>
                              )}
                              {['Scheduled', 'SCHEDULED', 'In Progress', 'IN PROGRESS', 'IN_PROGRESS'].includes(visit.status) && (
                                <Button size="sm" variant="destructive" onClick={() => { setActionVisit(visit); setActionType('cancel'); }}>
                                  Cancel
                                </Button>
                              )}
                            </>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} visits
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {renderActionDialog()}

        {/* Permission request dialog/overlay could be handled by browser, but we can add a loading state */}
        {(actionLoading || actionType === 'start') && (
          <Dialog open={true}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Please wait</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {actionType === 'start' ? 'Acquiring location to start visit...' : 'Processing...'}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}

        <Sheet open={!!selectedVisit} onOpenChange={(open) => !open && setSelectedVisit(null)}>
          <SheetContent className="sm:max-w-xl overflow-y-auto p-6">
            {selectedVisit && (
              <>
                <SheetHeader>
                  <SheetTitle>Visit Details</SheetTitle>
                  <SheetDescription>
                    {selectedVisit.visitType} Visit · {format(new Date(selectedVisit.scheduledDate), 'PPpp')}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Citizen Profile */}
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedVisit.SeniorCitizen?.fullName?.charAt(0) ?? 'SC'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{selectedVisit.SeniorCitizen?.fullName}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{selectedVisit.SeniorCitizen?.mobileNumber}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{selectedVisit.SeniorCitizen?.permanentAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Officer */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                      <Badge className={getStatusStyles(selectedVisit.status)}>{selectedVisit.status}</Badge>
                      {selectedVisit.duration && (
                        <p className="text-xs text-muted-foreground mt-1">Duration: {selectedVisit.duration} mins</p>
                      )}
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Assigned Officer</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedVisit.officer?.name ?? 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Scheduled</p>
                      <p className="font-medium">{format(new Date(selectedVisit.scheduledDate), 'PPpp')}</p>
                    </div>
                    {selectedVisit.startedAt && (
                      <div>
                        <p className="text-muted-foreground">Started</p>
                        <p className="font-medium">{format(new Date(selectedVisit.startedAt), 'PPpp')}</p>
                      </div>
                    )}
                    {selectedVisit.completedDate && (
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">{format(new Date(selectedVisit.completedDate), 'PPpp')}</p>
                      </div>
                    )}
                    {selectedVisit.riskScore !== undefined && selectedVisit.riskScore !== null && (
                      <div>
                        <p className="text-muted-foreground">Risk Score</p>
                        <p className={cn("font-medium", (selectedVisit.riskScore || 0) > 70 ? "text-red-600" : "text-green-600")}>
                          {selectedVisit.riskScore} / 100
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Map Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Location Context
                    </h4>
                    <div className="h-[250px] w-full rounded-lg overflow-hidden border shadow-sm relative">
                      {(selectedVisit.SeniorCitizen?.gpsLatitude || selectedVisit.gpsLatitude) ? (
                        <MapComponent
                          center={{
                            lat: selectedVisit.gpsLatitude || selectedVisit.SeniorCitizen?.gpsLatitude || 28.6139,
                            lng: selectedVisit.gpsLongitude || selectedVisit.SeniorCitizen?.gpsLongitude || 77.2090
                          }}
                          zoom={14}
                          markers={[
                            ...(selectedVisit.SeniorCitizen?.gpsLatitude ? [{
                              position: { lat: selectedVisit.SeniorCitizen.gpsLatitude, lng: selectedVisit.SeniorCitizen.gpsLongitude! },
                              title: 'Citizen Home'
                            }] : []),
                            ...(selectedVisit.gpsLatitude ? [{
                              position: { lat: selectedVisit.gpsLatitude, lng: selectedVisit.gpsLongitude! },
                              title: 'Visit Location'
                            }] : [])
                          ]}
                          height="100%"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                          <div className="text-center p-4">
                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No GPS coordinates available</p>
                            <p className="text-xs mt-1">{selectedVisit.SeniorCitizen?.permanentAddress}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Citizen Home</div>
                      {selectedVisit.gpsLatitude && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Visit Location</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                    <Button className="w-full gap-2" variant="outline" asChild>
                      <a href={`tel:${selectedVisit.SeniorCitizen?.mobileNumber}`}>
                        <Phone className="h-4 w-4" /> Call Citizen
                      </a>
                    </Button>
                    <Button className="w-full gap-2" asChild>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVisit.SeniorCitizen?.gpsLatitude || encodeURIComponent(selectedVisit.SeniorCitizen?.permanentAddress || '')},${selectedVisit.SeniorCitizen?.gpsLongitude || ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="h-4 w-4" /> Get Directions
                      </a>
                    </Button>
                  </div>

                  {/* Notes if any */}
                  {selectedVisit.notes && (
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                      <p className="font-bold mb-1 flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Notes
                      </p>
                      {selectedVisit.notes}
                    </div>
                  )}
                </div>

                <SheetFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
                  {/* Actions removed as per requirement: only View, Reschedule, Cancel allowed */}
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

