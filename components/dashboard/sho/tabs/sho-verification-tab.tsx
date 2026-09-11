'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, CheckCircle, Loader2 } from 'lucide-react';
import { AssignModalItem } from '@/components/dashboard/sho-assignment-modal';

interface SHOVerificationTabProps {
  verifications: any[];
  loading: boolean;
  onOpenAssignModal: (item: AssignModalItem) => void;
  onRefresh: () => void;
}

export function SHOVerificationTab({
  verifications,
  loading,
  onOpenAssignModal,
  onRefresh
}: SHOVerificationTabProps) {
  const handleOpenAssign = (req: any) => {
    const sc = req.SeniorCitizen || req.seniorCitizen;
    onOpenAssignModal({
      type: 'VERIFICATION',
      id: req.id,
      citizenId: sc?.id || req.seniorCitizenId,
      citizenName: sc?.fullName || 'Senior Citizen',
      mobileNumber: sc?.mobileNumber,
      policeStationId: sc?.policeStationId,
      policeStationName: sc?.PoliceStation?.name || sc?.policeStationName,
      beatId: sc?.beatId || sc?.Beat?.id || req.beatId,
      defaultDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notes: req.remarks
    });
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="font-medium">Loading pending verification requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 text-base">All verifications are up to date!</p>
          <p className="text-xs text-muted-foreground mt-1">
            New senior citizen registrations and staff verification requests will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow>
                <TableHead>Citizen / Subject</TableHead>
                <TableHead>Verification Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((req: any) => {
                const sc = req.SeniorCitizen || req.seniorCitizen;
                const entityLabel = req.entityType === 'HouseholdHelp'
                  ? 'Servant / Maid'
                  : req.entityType === 'Tenant'
                  ? 'Tenant'
                  : 'Senior Citizen Registration';

                const isAssigned = req.status === 'IN_PROGRESS' || !!req.assignedTo;

                return (
                  <TableRow key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900">{sc?.fullName || 'Senior Citizen'}</div>
                      <div className="text-xs text-muted-foreground font-mono">{sc?.mobileNumber || 'No phone'}</div>
                      {sc?.Beat?.name && (
                        <span className="text-[11px] text-primary font-medium block mt-0.5">
                          Beat: {sc.Beat.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 font-semibold text-xs">
                        {entityLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-slate-700">
                      {sc?.permanentAddress || 'Address on record'}
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
                      {isAssigned ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[11px] font-semibold">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-semibold">
                          Pending Assignment
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isAssigned ? "outline" : "default"}
                        className="gap-1.5 shadow-sm font-semibold text-xs"
                        onClick={() => handleOpenAssign(req)}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {isAssigned ? 'Re-assign' : 'Assign Officer'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
