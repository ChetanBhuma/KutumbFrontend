'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  HeartHandshake,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  FileText,
  Activity
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface SHOServiceRequestTabProps {
  requests?: any[];
  officers?: any[];
  policeStationId?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export function SHOServiceRequestTab({
  requests: propRequests,
  officers: propOfficers,
  policeStationId,
  loading: propLoading,
  onRefresh
}: SHOServiceRequestTabProps) {
  const [internalRequests, setInternalRequests] = useState<any[]>([]);
  const [internalOfficers, setInternalOfficers] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [assignedOfficerId, setAssignedOfficerId] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [modalMode, setModalMode] = useState<'ASSIGN' | 'STATUS' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (propRequests && propOfficers) return;
    try {
      setInternalLoading(true);
      const [reqRes, offRes]: any = await Promise.all([
        apiClient.get('/service-requests', { params: policeStationId ? { policeStationId } : {} }),
        apiClient.get('/officers', { params: policeStationId ? { policeStationId } : {} })
      ]);

      const fetchedReqs = reqRes?.data?.requests || reqRes?.data?.items || (Array.isArray(reqRes?.data) ? reqRes.data : []) || [];
      const fetchedOffs = offRes?.data?.officers || offRes?.data?.items || (Array.isArray(offRes?.data) ? offRes.data : []) || [];

      setInternalRequests(fetchedReqs);
      setInternalOfficers(fetchedOffs);
    } catch (err) {
      console.error('Failed to load service requests', err);
    } finally {
      setInternalLoading(false);
    }
  }, [policeStationId, propRequests, propOfficers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const requests = propRequests || internalRequests;
  const officers = propOfficers || internalOfficers;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (filterType !== 'ALL' && req.serviceType?.toUpperCase() !== filterType) return false;
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAssignModal = (req: any) => {
    setSelectedRequest(req);
    setAssignedOfficerId(req.assignedTo || '');
    setModalMode('ASSIGN');
  };

  const handleOpenStatusModal = (req: any) => {
    setSelectedRequest(req);
    setUpdateStatus(req.status || 'In_Progress');
    setResolutionNote(req.resolution || '');
    setModalMode('STATUS');
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setModalMode(null);
    setAssignedOfficerId('');
    setUpdateStatus('');
    setResolutionNote('');
  };

  const handleAssignOfficer = async () => {
    if (!selectedRequest || !assignedOfficerId) return;
    try {
      setSubmitting(true);
      const res: any = await apiClient.patch(`/service-requests/${selectedRequest.id}/assign`, {
        assignedTo: assignedOfficerId
      });

      if (res.success || res.data) {
        toast.success('Service request delegated to beat officer.');
        handleCloseModal();
        fetchData();
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message || 'Failed to assign officer.');
      }
    } catch (error: any) {
      console.error('Failed to assign service request', error);
      toast.error(error.message || 'Error occurred while assigning officer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !updateStatus) return;
    try {
      setSubmitting(true);
      const res: any = await apiClient.patch(`/service-requests/${selectedRequest.id}/status`, {
        status: updateStatus,
        resolution: resolutionNote
      });

      if (res.success || res.data) {
        toast.success('Service request status updated successfully.');
        handleCloseModal();
        fetchData();
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message || 'Failed to update request status.');
      }
    } catch (error: any) {
      console.error('Failed to update request status', error);
      toast.error(error.message || 'Error updating service request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="font-medium">Loading citizen help requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Sub-Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Senior Citizen Help & Service Requests</h3>
          <p className="text-xs text-muted-foreground">
            Help requests logged by senior citizens for medical assistance, police verification, documents, and safety.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Request Types</SelectItem>
              <SelectItem value="HEALTH">Health / Medical</SelectItem>
              <SelectItem value="EMERGENCY">Emergency Help</SelectItem>
              <SelectItem value="WELFARE">Welfare / Support</SelectItem>
              <SelectItem value="DOCUMENTATION">Documents & ID</SelectItem>
              <SelectItem value="SAFETY">Safety Concern</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In_Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 text-base">No pending help requests in this view!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Help requests submitted by senior citizens via the portal or helpline will appear here for officer assignment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow>
                <TableHead>Citizen / Contact</TableHead>
                <TableHead>Help Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Beat Officer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req: any) => {
                const sc = req.SeniorCitizen || req.seniorCitizen;
                const assignedOfficer = officers.find(o => o.id === req.assignedTo);

                return (
                  <TableRow key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900">{sc?.fullName || 'Senior Citizen'}</div>
                      <div className="text-xs text-muted-foreground font-mono">{sc?.mobileNumber || 'No phone'}</div>
                      {sc?.permanentAddress && (
                        <span className="text-[11px] text-slate-600 truncate max-w-xs block mt-0.5">
                          {sc.permanentAddress}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold text-xs bg-slate-50">
                        {req.serviceType || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-slate-700">
                      <p className="line-clamp-2">{req.description || 'Assistance requested by citizen'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.priority === 'Urgent' || req.priority === 'High'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-[11px] font-bold"
                      >
                        {req.priority || 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          req.status === 'Resolved' || req.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : req.status === 'In_Progress'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }
                      >
                        {req.status?.replace('_', ' ') || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignedOfficer ? (
                        <div>
                          <span className="font-bold text-slate-800 block">{assignedOfficer.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({assignedOfficer.badgeNumber})</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 font-medium italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold gap-1"
                          onClick={() => handleOpenAssignModal(req)}
                        >
                          <UserCheck className="h-3 w-3" />
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs font-semibold gap-1"
                          onClick={() => handleOpenStatusModal(req)}
                        >
                          <Activity className="h-3 w-3" />
                          Status
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assign Modal */}
      <Dialog open={modalMode === 'ASSIGN'} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>Assign Beat Officer for Help Request</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign a beat officer from this police station to help the senior citizen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Citizen Help Request</Label>
              <div className="mt-1 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-800">{selectedRequest?.SeniorCitizen?.fullName}</div>
                <div className="text-slate-600">{selectedRequest?.description}</div>
              </div>
            </div>

            <div>
              <Label htmlFor="officer-select" className="text-xs font-semibold">
                Select Beat Officer
              </Label>
              <Select value={assignedOfficerId} onValueChange={setAssignedOfficerId}>
                <SelectTrigger id="officer-select" className="mt-1.5 text-xs">
                  <SelectValue placeholder="Choose beat officer..." />
                </SelectTrigger>
                <SelectContent>
                  {officers.map((off) => (
                    <SelectItem key={off.id} value={off.id}>
                      {off.name} ({off.badgeNumber}) - {off.Beat?.name || 'Reserve'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button size="sm" variant="ghost" onClick={handleCloseModal} disabled={submitting} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAssignOfficer}
              disabled={submitting || !assignedOfficerId}
              className="text-xs font-bold gap-1.5 bg-primary"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Confirm Officer Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Modal */}
      <Dialog open={modalMode === 'STATUS'} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Update Help Request Status</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update resolution progress for this citizen help request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="status-select" className="text-xs font-semibold">
                Status
              </Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger id="status-select" className="mt-1.5 text-xs">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In_Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved & Completed</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resolution" className="text-xs font-semibold">
                Resolution / Progress Notes
              </Label>
              <Textarea
                id="resolution"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Enter actions taken or resolution details..."
                className="text-xs mt-1 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button size="sm" variant="ghost" onClick={handleCloseModal} disabled={submitting} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateStatus}
              disabled={submitting}
              className="text-xs font-bold gap-1.5 bg-primary"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
