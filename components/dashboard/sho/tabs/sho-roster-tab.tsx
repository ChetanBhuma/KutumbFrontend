'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Users,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Phone,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Building2,
  UserCheck
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface SHORosterTabProps {
  beats?: any[];
  officers?: any[];
  policeStationId?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export function SHORosterTab({
  beats: propBeats,
  officers: propOfficers,
  policeStationId,
  loading: propLoading,
  onRefresh
}: SHORosterTabProps) {
  const [internalBeats, setInternalBeats] = useState<any[]>([]);
  const [internalOfficers, setInternalOfficers] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const [assigningOfficer, setAssigningOfficer] = useState<any>(null);
  const [selectedBeatId, setSelectedBeatId] = useState<string>('reserve');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (propBeats && propOfficers) return;
    try {
      setInternalLoading(true);
      const [beatsRes, officersRes]: any = await Promise.all([
        apiClient.get('/beats', { params: policeStationId ? { policeStationId } : {} }),
        apiClient.get('/officers', { params: policeStationId ? { policeStationId } : {} })
      ]);

      const fetchedBeats = beatsRes?.data?.beats || (Array.isArray(beatsRes?.data) ? beatsRes.data : []) || [];
      const fetchedOfficers = officersRes?.data?.officers || officersRes?.data?.items || (Array.isArray(officersRes?.data) ? officersRes.data : []) || [];

      setInternalBeats(fetchedBeats);
      setInternalOfficers(fetchedOfficers);
    } catch (err) {
      console.error('Failed to load roster data', err);
    } finally {
      setInternalLoading(false);
    }
  }, [policeStationId, propBeats, propOfficers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rawBeats = propBeats || internalBeats;
  const rawOfficers = propOfficers || internalOfficers;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  // Strictly scope beats and officers to the current Police Station
  const stationBeats = rawBeats.filter(b => !policeStationId || b.policeStationId === policeStationId);
  const stationOfficers = rawOfficers.filter(o => !policeStationId || o.policeStationId === policeStationId);

  // Group officers by assignment status
  const assignedOfficers = stationOfficers.filter(o => !!o.beatId);
  const unassignedOfficers = stationOfficers.filter(o => !o.beatId);

  // Map of Beat ID -> Beat object for fast lookups
  const beatsMap = new Map<string, any>(stationBeats.map(b => [b.id, b]));

  const handleOpenAssignModal = (officer: any) => {
    setAssigningOfficer(officer);
    setSelectedBeatId(officer.beatId || 'reserve');
  };

  const handleCloseModal = () => {
    setAssigningOfficer(null);
    setSelectedBeatId('reserve');
  };

  const handleAssignBeat = async () => {
    if (!assigningOfficer) return;
    try {
      setSubmitting(true);
      const isReserve = !selectedBeatId || selectedBeatId === 'reserve' || selectedBeatId === 'none';
      const res: any = await apiClient.post(`/officers/${assigningOfficer.id}/assign-beat`, {
        beatId: isReserve ? null : selectedBeatId
      });

      if (res.success || res.data) {
        const pisNo = assigningOfficer.pisNumber || assigningOfficer.badgeNumber || 'N/A';
        toast.success(
          !isReserve
            ? `Officer ${assigningOfficer.name} (PIS: ${pisNo}) assigned to beat successfully.`
            : `Officer ${assigningOfficer.name} (PIS: ${pisNo}) moved to PS reserve pool.`
        );
        handleCloseModal();
        fetchData();
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message || 'Failed to update beat assignment.');
      }
    } catch (error: any) {
      console.error('Failed to assign beat', error);
      toast.error(error.message || 'Error occurred during beat assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && stationBeats.length === 0 && stationOfficers.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="font-medium">Loading station beat duty roster...</span>
      </div>
    );
  }

  const currentOfficerAssignedBeat = assigningOfficer?.beatId
    ? beatsMap.get(assigningOfficer.beatId) || assigningOfficer.Beat
    : null;

  return (
    <div className="space-y-6">
      {/* Top Roster Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Beat Area & Officer Duty List
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor police station beat areas, review assigned officers, and allocate available reserve staff.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 font-bold">
            {stationBeats.length} Station Beats
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">
            {assignedOfficers.length} Assigned Officers
          </Badge>
          <Badge variant="secondary" className="font-bold">
            {unassignedOfficers.length} Reserve Officers
          </Badge>
        </div>
      </div>

      {/* 3-Column Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ============================================================ */}
        {/* COLUMN 1 (LEFT): Police Station All Beats                   */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Station Beats ({stationBeats.length})</span>
            </h4>
            <Badge className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 font-bold shadow-2xs">
              All PS Beats
            </Badge>
          </div>

          {stationBeats.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600">
              <MapPin className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <span className="font-bold block">No Beats Found</span>
              <span>No beat areas are currently configured for this Police Station.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {stationBeats.map((beat) => {
                const assignedOnBeat = stationOfficers.filter(o => o.beatId === beat.id);
                const isManned = assignedOnBeat.length > 0;
                return (
                  <Card
                    key={beat.id}
                    className="overflow-hidden border border-blue-200/80 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-b from-blue-50/40 via-white to-white"
                  >
                    {/* Top Vibrant Header Banner */}
                    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-md bg-white/15 text-cyan-300 backdrop-blur-xs border border-white/20 shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-white truncate tracking-wide">
                          {beat.name}
                        </span>
                      </div>
                      <Badge className="bg-white/20 hover:bg-white/25 text-white border-white/30 font-mono text-[10px] font-bold shrink-0 px-2 py-0.5 shadow-2xs backdrop-blur-xs">
                        {beat.code}
                      </Badge>
                    </div>

                    <CardContent className="p-3.5 pt-3 space-y-2.5">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {beat.exactLocation || beat.description || 'Police Station Beat Area'}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-blue-100">
                        <div className="flex items-center gap-1.5 font-bold text-blue-950 bg-blue-50 px-2 py-1 rounded-md border border-blue-200/70">
                          <Users className="h-3 w-3 text-blue-600" />
                          <span>{beat._count?.SeniorCitizen || 0} Seniors</span>
                        </div>
                        {isManned ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 shadow-2xs">
                            {assignedOnBeat.length} Officer{assignedOnBeat.length > 1 ? 's' : ''} Active
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2 py-0.5 shadow-2xs animate-pulse">
                            Vacant Beat
                          </Badge>
                        )}
                      </div>

                      {/* Compact List of Officers on this Beat */}
                      {isManned && (
                        <div className="pt-1.5 flex flex-wrap gap-1.5">
                          {assignedOnBeat.map(o => (
                            <span
                              key={o.id}
                              className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-950 px-2 py-0.5 rounded-md border border-blue-200 font-semibold"
                            >
                              <UserCheck className="h-3 w-3 text-emerald-600" />
                              {o.name}
                              <span className="font-mono text-[9px] text-slate-500">({o.pisNumber || o.badgeNumber || 'PIS'})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* COLUMN 2 (MIDDLE): Assigned Officers & Their Assigned Beat  */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Assigned Beat Officers ({assignedOfficers.length})</span>
            </h4>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
              Active Beat Duty
            </Badge>
          </div>

          {assignedOfficers.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600">
              <Users className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <span className="font-bold block">No Assigned Officers</span>
              <span>No officers from this police station are currently assigned to a beat.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {assignedOfficers.map((officer) => {
                const assignedBeat = beatsMap.get(officer.beatId) || officer.Beat;
                const pisNo = officer.pisNumber || officer.badgeNumber || 'N/A';
                return (
                  <Card key={officer.id} className="border-slate-200 bg-white shadow-2xs hover:border-emerald-400/60 transition-colors">
                    <CardHeader className="p-3 pb-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xs font-bold text-slate-900">
                            {officer.name}
                          </CardTitle>
                          <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                            <span className="font-semibold text-slate-700">PIS No:</span> {pisNo}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {officer.rank || 'Constable'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 space-y-2.5">
                      {officer.mobileNumber && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{officer.mobileNumber}</span>
                        </div>
                      )}

                      {/* Prominent Assigned Beat Tag */}
                      <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-blue-600 block uppercase font-bold tracking-wider">Assigned Beat</span>
                            <span className="font-bold text-slate-900 truncate">
                              {assignedBeat ? `${assignedBeat.name} (${assignedBeat.code})` : 'Beat Assigned'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border-slate-200 gap-1.5"
                        onClick={() => handleOpenAssignModal(officer)}
                      >
                        <RefreshCw className="h-3 w-3 text-blue-600" />
                        Reassign / Change Beat
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* COLUMN 3 (RIGHT): Unassigned / Reserve Officers Pool        */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>Reserve Officers ({unassignedOfficers.length})</span>
            </h4>
            <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-800 border-indigo-200">
              PS Reserve Pool
            </Badge>
          </div>

          {unassignedOfficers.length === 0 ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block">Full Deployment!</span>
              <span>All active officers of this police station are currently assigned to beat duties.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {unassignedOfficers.map((officer) => {
                const pisNo = officer.pisNumber || officer.badgeNumber || 'N/A';
                return (
                  <Card key={officer.id} className="border-indigo-100 bg-indigo-50/20 shadow-2xs">
                    <CardHeader className="p-3 pb-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xs font-bold text-slate-900">
                            {officer.name}
                          </CardTitle>
                          <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                            <span className="font-semibold text-slate-700">PIS No:</span> {pisNo}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {officer.rank || 'Constable'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 space-y-2.5">
                      {officer.mobileNumber && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{officer.mobileNumber}</span>
                        </div>
                      )}

                      <div className="text-[11px] text-indigo-800 bg-indigo-50/80 px-2 py-1 rounded border border-indigo-100 font-medium flex items-center justify-between">
                        <span>Status: PS Reserve</span>
                        <span>Available</span>
                      </div>

                      <Button
                        size="sm"
                        className="w-full h-7 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                        onClick={() => handleOpenAssignModal(officer)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Assign to Beat
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* Assign / Reassign Beat Duty Right-Side Offcanvas (Sheet)     */}
      {/* ============================================================ */}
      <Sheet open={!!assigningOfficer} onOpenChange={(open) => !open && handleCloseModal()}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col bg-white border-l border-slate-200 z-50">
          {/* Header with Signature Theme Gradient */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 sm:p-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-white backdrop-blur-xs border border-white/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold text-white tracking-tight">
                  Assign / Reassign Beat Duty
                </SheetTitle>
                <SheetDescription className="text-sm text-indigo-100 font-medium mt-0.5">
                  Allocate beat duty for police station personnel
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Form Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/70">
            {/* Officer Profile Card (Moved out of header) */}
            {assigningOfficer && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                      {assigningOfficer.name?.charAt(0) || 'O'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate text-base block">
                        {assigningOfficer.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono block mt-0.5">
                        PIS No: {assigningOfficer.pisNumber || assigningOfficer.badgeNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200 text-xs font-bold shrink-0 px-3 py-1">
                    {assigningOfficer.rank || 'Constable'}
                  </Badge>
                </div>
                {assigningOfficer.mobileNumber && (
                  <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="font-mono font-medium">{assigningOfficer.mobileNumber}</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Assignment Status Notice */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
                Current Deployment Status
              </span>
              {currentOfficerAssignedBeat ? (
                <div className="flex items-center gap-2.5 text-blue-950 font-semibold text-sm">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>Assigned to: {currentOfficerAssignedBeat.name} ({currentOfficerAssignedBeat.code})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>Currently in Police Station Reserve Pool</span>
                </div>
              )}
            </div>

            {/* Beat Selection Solid Card */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <Label htmlFor="beat-select" className="text-sm font-bold text-slate-900 block">
                Assign Beat Area ({stationBeats.length} Station Beat{stationBeats.length > 1 ? 's' : ''} available)
              </Label>
              <Select value={selectedBeatId} onValueChange={setSelectedBeatId}>
                <SelectTrigger id="beat-select" className="w-full text-sm h-10 bg-white border-slate-300 font-medium text-slate-900">
                  <SelectValue placeholder="Choose a beat or keep in reserve..." />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border-slate-300 max-h-64">
                  <SelectItem value="reserve" className="font-semibold text-indigo-700 text-sm">
                    -- Keep in Police Station Reserve (Available) --
                  </SelectItem>
                  {stationBeats.filter((b) => b && b.id).map((b) => {
                    const countOfficers = stationOfficers.filter(o => o.beatId === b.id).length;
                    return (
                      <SelectItem key={b.id} value={b.id} className="text-sm py-2">
                        {b.name} ({b.code}) • {countOfficers} Officer(s) • {b._count?.SeniorCitizen || 0} Seniors
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select a target beat area within this Police Station to deploy this officer, or retain them in the reserve pool for emergency coverage.
              </p>
            </div>
          </div>

          {/* Fixed Footer with Action Buttons */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <Button
              size="default"
              variant="outline"
              onClick={handleCloseModal}
              disabled={submitting}
              className="text-sm font-semibold h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              size="default"
              onClick={handleAssignBeat}
              disabled={submitting}
              className="text-sm font-bold gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save Beat Assignment
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

