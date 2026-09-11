'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Siren,
  Phone,
  MapPin,
  BatteryMedium,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Loader2,
  Send,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface SHOSosTabProps {
  alerts?: any[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function SHOSosTab({ alerts: propAlerts, loading: propLoading, onRefresh }: SHOSosTabProps) {
  const router = useRouter();
  const [internalAlerts, setInternalAlerts] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [actionType, setActionType] = useState<'RESPOND' | 'RESOLVE' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchAlerts = useCallback(async () => {
    if (propAlerts !== undefined) return;
    try {
      setInternalLoading(true);
      const res: any = await apiClient.get('/sos');
      const items = res?.data?.items || res?.data?.alerts || (Array.isArray(res?.data) ? res.data : []) || [];
      setInternalAlerts(items);
    } catch (err) {
      console.error('Failed to fetch SOS alerts', err);
    } finally {
      setInternalLoading(false);
    }
  }, [propAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const rawAlerts = propAlerts !== undefined ? propAlerts : internalAlerts;
  const alerts = Array.isArray(rawAlerts) ? rawAlerts : [];
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const respondedAlerts = alerts.filter(a => a.status === 'Responded');
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved' || a.status === 'False Alarm' || a.status === 'FalseAlarm');

  const filteredAlerts = filterStatus === 'ALL'
    ? (activeAlerts.length > 0 || respondedAlerts.length > 0 ? [...activeAlerts, ...respondedAlerts] : alerts)
    : filterStatus === 'Active'
    ? activeAlerts
    : filterStatus === 'Responded'
    ? respondedAlerts
    : resolvedAlerts;

  const handleOpenActionModal = (alert: any, type: 'RESPOND' | 'RESOLVE') => {
    setSelectedAlert(alert);
    setActionType(type);
    setActionNotes(type === 'RESOLVE' ? 'Resolved on site by beat officer team.' : 'Dispatched beat officer team to location.');
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
    setActionType(null);
    setActionNotes('');
  };

  const handleSubmitStatusUpdate = async () => {
    if (!selectedAlert || !actionType) return;
    try {
      setSubmitting(true);
      const targetStatus = actionType === 'RESPOND' ? 'Responded' : 'Resolved';

      const res: any = await apiClient.patch(`/sos/${selectedAlert.id}/status`, {
        status: targetStatus,
        notes: actionNotes
      });

      if (res.success || res.data) {
        toast.success(
          actionType === 'RESPOND'
            ? 'SOS Alert acknowledged and response recorded.'
            : 'SOS Incident marked as resolved.'
        );
        handleCloseModal();
        fetchAlerts();
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message || 'Failed to update SOS status.');
      }
    } catch (error: any) {
      console.error('Failed to update SOS alert', error);
      toast.error(error.message || 'Error updating alert status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        <span className="font-medium">Loading emergency SOS alerts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {activeAlerts.length > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${activeAlerts.length > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            </span>
            <h3 className="text-base font-bold text-slate-900">Live Emergency SOS Alerts</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Emergency panic button alerts triggered by senior citizens in this police station area.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/sos')}
            className="text-xs h-8 font-semibold gap-1.5 border-slate-300 ml-1"
          >
            <Maximize2 className="h-3.5 w-3.5 text-slate-600" />
            <span>Full SOS Screen</span>
          </Button>
        </div>
      </div>

      {/* Sub-Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <Button
          size="sm"
          variant={filterStatus === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('ALL')}
          className="text-xs h-8"
        >
          All Active & Ongoing ({activeAlerts.length + respondedAlerts.length})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === 'Active' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('Active')}
          className="text-xs h-8 gap-1.5"
        >
          <Siren className="h-3.5 w-3.5 text-red-600" />
          Active ({activeAlerts.length})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === 'Responded' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('Responded')}
          className="text-xs h-8 gap-1.5"
        >
          <Radio className="h-3.5 w-3.5 text-amber-600" />
          Officer Sent ({respondedAlerts.length})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === 'Resolved' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('Resolved')}
          className="text-xs h-8 gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Resolved ({resolvedAlerts.length})
        </Button>
      </div>

      {/* Active Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 text-base">No emergency alerts in this filter!</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            All registered senior citizens in your jurisdiction are safe. Emergency SOS alerts will appear here immediately.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/sos')}
            className="mt-4 text-xs font-semibold gap-1.5"
          >
            <Siren className="h-3.5 w-3.5 text-red-600" />
            Open Full SOS Monitoring Hub
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert: any) => {
              const citizen = alert.SeniorCitizen || alert.seniorCitizen;
              const isActive = alert.status === 'Active';
              const mapsUrl = alert.latitude && alert.longitude
                ? `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`
                : null;

              return (
                <Card
                  key={alert.id}
                  className={`border-2 shadow-md transition-all ${
                    isActive
                      ? 'border-red-500 bg-red-50/10 hover:shadow-red-100'
                      : 'border-amber-400 bg-amber-50/10'
                  }`}
                >
                  <CardHeader className="pb-2.5 pt-3.5 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-white'}`}>
                          <Siren className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold text-slate-900">
                            {citizen?.fullName || 'Senior Citizen in Distress'}
                          </CardTitle>
                          <CardDescription className="text-xs font-mono font-medium text-slate-600">
                            {citizen?.mobileNumber || 'No phone'}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={isActive ? 'destructive' : 'outline'}
                        className={`text-[11px] font-bold ${!isActive ? 'bg-amber-100 text-amber-900 border-amber-300' : ''}`}
                      >
                        {alert.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 pb-4 pt-1 space-y-3">
                    {/* Location Info */}
                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-2">
                          {alert.address || citizen?.permanentAddress || 'GPS Location Tagged'}
                        </span>
                      </div>
                      {alert.latitude && alert.longitude && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="font-mono text-slate-500">
                            {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                          </span>
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-semibold flex items-center gap-1 hover:underline"
                            >
                              <span>Open in Maps</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata Ribbon */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Triggered: {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                      </div>
                      {alert.batteryLevel !== null && alert.batteryLevel !== undefined && (
                        <div className="flex items-center gap-1">
                          <BatteryMedium className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold">{alert.batteryLevel}% Battery</span>
                        </div>
                      )}
                      {citizen?.Beat?.name && (
                        <span className="font-semibold text-primary">
                          Beat: {citizen.Beat.name}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {isActive && (
                        <Button
                          size="sm"
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow"
                          onClick={() => handleOpenActionModal(alert, 'RESPOND')}
                        >
                          <Radio className="h-3.5 w-3.5" />
                          Send Officer to Help
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={isActive ? 'outline' : 'default'}
                        className={`flex-1 font-bold text-xs gap-1.5 shadow-sm ${!isActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-300'}`}
                        onClick={() => handleOpenActionModal(alert, 'RESOLVE')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark as Resolved & Safe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              {actionType === 'RESPOND' ? (
                <>
                  <Radio className="h-5 w-5 text-amber-600" />
                  <span>Send Officer / Acknowledge SOS Alert</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Mark Citizen as Safe & Close Alert</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === 'RESPOND'
                ? 'Confirm that a beat constable or police team has been sent to help the senior citizen.'
                : 'Confirm the senior citizen is safe and resolve this emergency alert.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-semibold">Incident Details</Label>
              <div className="mt-1 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-800">
                  {selectedAlert?.SeniorCitizen?.fullName || 'Senior Citizen'}
                </div>
                <div className="text-slate-600">
                  {selectedAlert?.address || selectedAlert?.SeniorCitizen?.permanentAddress || 'Jurisdiction Location'}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs font-semibold">
                Action / Resolution Notes
              </Label>
              <Textarea
                id="notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter dispatch details, responding officer name, or resolution summary..."
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
              onClick={handleSubmitStatusUpdate}
              disabled={submitting}
              className={`text-xs font-bold gap-1.5 ${
                actionType === 'RESPOND' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {actionType === 'RESPOND' ? 'Record Dispatch' : 'Complete Resolution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
