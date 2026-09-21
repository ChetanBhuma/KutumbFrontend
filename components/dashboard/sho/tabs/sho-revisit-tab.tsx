'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, UserCheck, AlertTriangle, CheckCircle, Loader2, Users, HeartPulse, User } from 'lucide-react';
import { AssignModalItem } from '@/components/dashboard/sho-assignment-modal';

interface SHORevisitTabProps {
  visitRequests: any[];
  loading: boolean;
  policeStationId?: string;
  onOpenAssignModal: (item: AssignModalItem) => void;
  onRefresh: () => void;
}

export function SHORevisitTab({
  visitRequests,
  loading,
  policeStationId,
  onOpenAssignModal,
  onRefresh
}: SHORevisitTabProps) {
  const [filterType, setFilterType] = useState<string>('ALL');

  const citizenRequests = visitRequests.filter(v => v.type === 'CITIZEN_REQUEST' || (!v.type && v.preferredDate));
  const periodicRevisits = visitRequests.filter(v => v.type === 'PERIODIC_REVISIT' || (!v.type && !v.preferredDate));
  const highRiskItems = visitRequests.filter(v => {
    const sc = v.SeniorCitizen || v.seniorCitizen;
    const vuln = v.vulnerabilityLevel || sc?.vulnerabilityLevel;
    return vuln === 'Critical' || vuln === 'High';
  });

  const filteredItems = filterType === 'ALL'
    ? visitRequests
    : filterType === 'CITIZEN'
    ? citizenRequests
    : filterType === 'PERIODIC'
    ? periodicRevisits
    : highRiskItems;

  const handleOpenAssign = (req: any) => {
    const sc = req.SeniorCitizen || req.seniorCitizen;
    const citizenId = sc?.id || req.seniorCitizenId || req.citizenId;
    const citizenName = sc?.fullName || req.citizenName || 'Senior Citizen';
    const mobileNumber = sc?.mobileNumber || req.mobileNumber;
    const psId = sc?.policeStationId || req.policeStationId || policeStationId;
    const psName = sc?.PoliceStation?.name || req.policeStationName;

    onOpenAssignModal({
      type: 'REVISIT',
      id: req.requestId || req.id,
      citizenId,
      citizenName,
      mobileNumber,
      policeStationId: psId,
      policeStationName: psName,
      beatId: sc?.beatId || sc?.Beat?.id || req.beatId,
      defaultDate: req.preferredDate || req.requestedDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      visitType: req.type === 'CITIZEN_REQUEST' ? (req.visitType || 'Routine') : 'Follow-up',
      notes: req.notes || req.dueReason,
      age: sc?.age ?? req.age,
      gender: sc?.gender ?? req.gender,
      dateOfBirth: sc?.dateOfBirth ?? req.dateOfBirth
    });
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="font-medium">Loading follow-up visits and citizen requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Senior Citizen Follow-up Visits & Requests Queue</h3>
        <p className="text-xs text-muted-foreground">
          Senior citizens due for regular safety check-up visits by beat officers and requested visits.
        </p>
      </div>

      {/* Sub-Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filterType === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterType('ALL')}
            className="text-xs h-8"
          >
            All Due ({visitRequests.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === 'HIGH_RISK' ? 'default' : 'outline'}
            onClick={() => setFilterType('HIGH_RISK')}
            className="text-xs h-8 gap-1.5"
          >
            <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
            High Attention ({highRiskItems.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === 'PERIODIC' ? 'default' : 'outline'}
            onClick={() => setFilterType('PERIODIC')}
            className="text-xs h-8 gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            Regular Follow-ups ({periodicRevisits.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === 'CITIZEN' ? 'default' : 'outline'}
            onClick={() => setFilterType('CITIZEN')}
            className="text-xs h-8 gap-1.5"
          >
            <User className="h-3.5 w-3.5" />
            Citizen Requests ({citizenRequests.length})
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 text-base">All follow-up visits in this filter are up to date!</p>
          <p className="text-xs text-muted-foreground mt-1">
            No pending citizen requests or overdue follow-up visits in this category.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow>
                <TableHead>Citizen Details</TableHead>
                <TableHead>Visit Type</TableHead>
                <TableHead>Visit Due Status</TableHead>
                <TableHead>Attention Level</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((req: any) => {
                const sc = req.SeniorCitizen || req.seniorCitizen;
                const citizenName = sc?.fullName || req.citizenName || 'Senior Citizen';
                const mobileNumber = sc?.mobileNumber || req.mobileNumber;
                const address = sc?.permanentAddress || req.address;
                const vulnLevel = req.vulnerabilityLevel || sc?.vulnerabilityLevel || 'Medium';
                const isCitizenReq = req.type === 'CITIZEN_REQUEST' || !!req.preferredDate;
                const daysOverdue = req.daysOverdue ?? 0;

                return (
                  <TableRow key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900">{citizenName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{mobileNumber || 'No phone'}</div>
                      {address && (
                        <span className="text-[11px] text-slate-500 truncate max-w-xs block mt-0.5">
                          {address}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isCitizenReq ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs font-semibold">
                          Citizen Request
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs font-semibold">
                          Regular Follow-up
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {daysOverdue > 0 ? (
                        <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-[11px]">
                          {daysOverdue}d Overdue
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800 text-[11px] font-semibold">
                          Due for Visit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          vulnLevel === 'Critical' || vulnLevel === 'High'
                            ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold'
                            : vulnLevel === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }
                      >
                        {vulnLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="gap-1.5 shadow-sm font-semibold text-xs"
                        onClick={() => handleOpenAssign(req)}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Assign Officer
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

