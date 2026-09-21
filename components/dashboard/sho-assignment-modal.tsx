'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import {
    Sheet,
    SheetContent,
    SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import {
    Calendar as CalendarIcon,
    Loader2,
    ShieldCheck,
    UserCheck,
    AlertCircle,
    User,
    Building2,
    CheckCircle2,
    Clock,
    Sun,
    Sunset,
    Moon,
    Check,
    FileText,
    Send
} from 'lucide-react';
import { toast } from 'sonner';

export interface AssignModalItem {
    type: 'VERIFICATION' | 'REVISIT';
    id: string; // verificationRequestId or visitRequestId
    citizenId: string;
    citizenName: string;
    mobileNumber?: string;
    policeStationId?: string;
    policeStationName?: string;
    beatId?: string;
    defaultDate?: string;
    visitType?: string;
    notes?: string;
    age?: number | string;
    gender?: string;
    dateOfBirth?: string | Date;
}

interface Officer {
    id: string;
    name: string;
    rank?: string;
    badgeNumber?: string;
    policeStationId?: string;
    beatId?: string;
    Beat?: { name: string; code?: string };
    beatName?: string;
    _count?: { Visit: number };
}

interface SHOAssignmentModalProps {
    item: AssignModalItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const TIME_SLOTS = [
    {
        id: "morning",
        label: "Morning",
        timeRange: "09:00 AM – 12:00 PM",
        defaultHour: 10,
        defaultMinute: 0,
        icon: Sun,
        desc: "Ideal for morning check"
    },
    {
        id: "afternoon",
        label: "Afternoon",
        timeRange: "12:00 PM – 03:00 PM",
        defaultHour: 13,
        defaultMinute: 30,
        icon: Sunset,
        desc: "Post-lunch check-in"
    },
    {
        id: "evening",
        label: "Evening",
        timeRange: "03:00 PM – 06:00 PM",
        defaultHour: 16,
        defaultMinute: 30,
        icon: Moon,
        desc: "Evening safety visit"
    }
];

const QUICK_INSTRUCTIONS = [
    "Verify permanent address & ID proof",
    "Check physical wellbeing & living condition",
    "Meet emergency contact / caregiver",
    "Assist with Delhi Police Senior Citizen Card"
];

export function SHOAssignmentModal({ item, open, onOpenChange, onSuccess }: SHOAssignmentModalProps) {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [loadingOfficers, setLoadingOfficers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [selectedOfficerId, setSelectedOfficerId] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const [selectedSlotId, setSelectedSlotId] = useState<string>("morning");
    const [customTime, setCustomTime] = useState<string>("10:00");
    const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
    const [visitType, setVisitType] = useState('Verification');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (open && item) {
            setError('');
            setSelectedOfficerId('');
            const targetDate = item.defaultDate ? new Date(item.defaultDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
            setSelectedDate(targetDate);
            setSelectedSlotId("morning");
            setIsCustomTime(false);
            setVisitType(item.type === 'VERIFICATION' ? 'Verification' : item.visitType || 'Follow-up');
            setNotes(item.notes || '');

            fetchStationOfficers(item.policeStationId, item.beatId);
        }
    }, [open, item]);

    const fetchStationOfficers = async (policeStationId?: string, citizenBeatId?: string) => {
        try {
            setLoadingOfficers(true);
            const params: any = { limit: 100, isActive: true, hasBeat: true };
            if (policeStationId) {
                params.policeStationId = policeStationId;
            }
            const res: any = await apiClient.get('/officers', { params });
            const raw = res?.data || res;
            const items: Officer[] = Array.isArray(raw)
                ? raw
                : (raw?.officers || raw?.items || raw?.data?.items || raw?.data || []);

            // Strictly filter for beat-assigned officers
            const beatAssignedOfficers = items.filter((o: any) => {
                return !!(o.beatId && (o.Beat?.name || o.beatName || o.beat));
            });

            // Sort so matching citizen beat officer appears at the top
            const sorted = [...beatAssignedOfficers].sort((a, b) => {
                if (citizenBeatId) {
                    if (a.beatId === citizenBeatId && b.beatId !== citizenBeatId) return -1;
                    if (b.beatId === citizenBeatId && a.beatId !== citizenBeatId) return 1;
                }
                return (a.name || '').localeCompare(b.name || '');
            });

            setOfficers(sorted);

            if (sorted.length > 0) {
                const exactMatch = citizenBeatId ? sorted.find(o => o.beatId === citizenBeatId) : null;
                if (exactMatch) {
                    setSelectedOfficerId(exactMatch.id);
                } else {
                    setSelectedOfficerId(sorted[0].id);
                }
            }
        } catch (err: any) {
            console.error('Failed to load station officers', err);
            setError('Could not load station officers. Please try again.');
        } finally {
            setLoadingOfficers(false);
        }
    };

    const calculateFinalScheduledDate = (): Date | undefined => {
        if (!selectedDate) return undefined;

        let targetDate = new Date(selectedDate);
        if (isCustomTime && customTime) {
            const [hours, minutes] = customTime.split(":").map(Number);
            targetDate = setHours(setMinutes(targetDate, minutes || 0), hours || 10);
        } else {
            const slot = TIME_SLOTS.find(s => s.id === selectedSlotId) || TIME_SLOTS[0];
            targetDate = setHours(setMinutes(targetDate, slot.defaultMinute), slot.defaultHour);
        }
        return targetDate;
    };

    const getSlotLabel = (): string => {
        if (isCustomTime) {
            return `Custom Time (${customTime})`;
        }
        const slot = TIME_SLOTS.find(s => s.id === selectedSlotId);
        return slot ? `${slot.label} (${slot.timeRange})` : "Morning";
    };

    const handleQuickInstruction = (inst: string) => {
        if (!notes) {
            setNotes(inst);
        } else if (!notes.includes(inst)) {
            setNotes(`${notes}; ${inst}`);
        }
    };

    const handleAssign = async () => {
        if (!item) return;

        const finalDate = calculateFinalScheduledDate();

        if (!selectedOfficerId) {
            setError('Please select an officer for assignment.');
            return;
        }

        if (!finalDate) {
            setError('Please select a visit date and time.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const slotInfo = getSlotLabel();
            const fullNotes = notes
                ? `[Time Slot: ${slotInfo}] ${notes}`
                : `[Time Slot: ${slotInfo}] Police station assigned field visit`;

            if (item.type === 'VERIFICATION') {
                // Call verification assignment API
                const res: any = await apiClient.assignVerificationRequest(item.id, {
                    officerId: selectedOfficerId,
                    scheduledDate: finalDate.toISOString(),
                    notes: fullNotes
                });

                if (res.success) {
                    toast.success(`Officer assigned successfully for verification of ${item.citizenName}`);
                    onSuccess();
                    onOpenChange(false);
                } else {
                    setError(res.message || 'Failed to assign officer');
                }
            } else {
                // Call visit scheduling API for revisit / visit request
                const res: any = await apiClient.createVisit({
                    seniorCitizenId: item.citizenId,
                    officerId: selectedOfficerId,
                    scheduledDate: finalDate.toISOString(),
                    visitType: visitType || 'Follow-up',
                    policeStationId: item.policeStationId,
                    notes: fullNotes
                });

                if (res.success) {
                    // Mark visit request as Scheduled
                    if (item.id) {
                        try {
                            await apiClient.updateVisitRequest(item.id, 'Scheduled');
                        } catch (e) {
                            console.warn('Could not update visit request status', e);
                        }
                    }
                    toast.success(`Visit assigned successfully for ${item.citizenName}`);
                    onSuccess();
                    onOpenChange(false);
                } else {
                    setError(res.message || 'Failed to schedule visit');
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || err?.message || 'Assignment failed. Please check officer station mapping.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg flex flex-col justify-between p-0 bg-white border-l border-slate-300 shadow-2xl">
                {/* Solid High-Contrast Header */}
                <div className="p-5 sm:p-6 border-b border-indigo-900 bg-indigo-950 text-white shadow-md">
                    <SheetTitle className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {item?.type === 'VERIFICATION' ? 'Assign Beat Officer for Verification' : 'Assign Beat Officer for Visit'}
                    </SheetTitle>

                    {/* Solid Citizen Context Card */}
                    {item && (() => {
                        const calculatedAge = (item.age !== undefined && item.age !== null && item.age !== '')
                            ? item.age
                            : item.dateOfBirth
                            ? Math.floor((Date.now() - new Date(item.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                            : null;

                        return (
                            <div className="mt-4 p-3 rounded-lg bg-indigo-900 border border-indigo-700 flex items-center justify-between gap-2 text-xs shadow-inner">
                                <div className="flex items-center gap-2 min-w-0">
                                    <User className="h-4 w-4 text-indigo-300 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="font-bold text-white truncate text-sm block">{item.citizenName || "Applicant"}</span>
                                        {item.mobileNumber && (
                                            <span className="text-[11px] text-indigo-200 font-mono">{item.mobileNumber}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 text-white bg-indigo-800 border border-indigo-600 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs">
                                    <CalendarIcon className="h-3.5 w-3.5 text-indigo-300" />
                                    <span>Age: {calculatedAge ? `${calculatedAge} yrs` : 'N/A'}</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Form Body with Solid Backgrounds */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-100/90">
                    {error && (
                        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900">
                            <AlertCircle className="h-4 w-4 text-rose-600" />
                            <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* 1. Visit Type Solid Card */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">
                                    {item?.type === 'VERIFICATION' ? 'Physical Verification Visit' : `${visitType} Duty`}
                                </p>
                                <p className="text-[11px] text-slate-600 font-medium">
                                    {item?.type === 'VERIFICATION'
                                        ? 'Mandatory police check before registration approval'
                                        : 'Assigned senior citizen wellness check'}
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5">
                            {item?.type === 'VERIFICATION' ? 'Required' : 'Priority'}
                        </Badge>
                    </div>

                    {/* Visit Type Selector for Re-visits */}
                    {item?.type === 'REVISIT' && (
                        <div className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-sm space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Visit Purpose / Type</label>
                            <Select value={visitType} onValueChange={setVisitType}>
                                <SelectTrigger className="w-full text-xs h-9 border-slate-300 bg-white font-bold text-slate-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-50 bg-white border-slate-300">
                                    <SelectItem value="Follow-up">Regular Follow-up Visit</SelectItem>
                                    <SelectItem value="Verification">Verification Visit</SelectItem>
                                    <SelectItem value="Routine">Routine Welfare Check</SelectItem>
                                    <SelectItem value="Emergency">Emergency Visit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* 2. Date & Time Selection Solid Card */}
                    <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-indigo-700" />
                                Visit Date & Time Slot
                            </label>
                            {selectedDate && (
                                <Badge className="text-[11px] bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold px-2 py-0.5">
                                    {format(selectedDate, "dd MMM")} • {isCustomTime ? customTime : TIME_SLOTS.find(s => s.id === selectedSlotId)?.label}
                                </Badge>
                            )}
                        </div>

                        {/* Date Picker Button */}
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-700">Select Date</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-semibold text-xs h-10 border-slate-300 bg-white hover:bg-slate-50 text-slate-900 shadow-xs",
                                            !selectedDate && "text-slate-500"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-indigo-600" />
                                        {selectedDate ? (
                                            <span className="font-bold text-slate-900 text-xs">
                                                {format(selectedDate, "EEEE, dd MMMM yyyy")}
                                            </span>
                                        ) : (
                                            <span>Pick a scheduled date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-50 shadow-2xl border-slate-300 bg-white" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        className="bg-white"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Slots Grid with Solid Colors */}
                        <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-700">Choose Convenient Window</span>
                            <div className="grid grid-cols-3 gap-2">
                                {TIME_SLOTS.map((slot) => {
                                    const Icon = slot.icon;
                                    const isSelected = !isCustomTime && selectedSlotId === slot.id;
                                    return (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            onClick={() => {
                                                setIsCustomTime(false);
                                                setSelectedSlotId(slot.id);
                                            }}
                                            className={cn(
                                                "flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-150 relative select-none",
                                                isSelected
                                                    ? "bg-indigo-700 text-white border-indigo-800 shadow-md ring-2 ring-indigo-500"
                                                    : "bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full mb-1">
                                                <Icon className={cn("h-4 w-4", isSelected ? "text-white" : "text-indigo-700")} />
                                                {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                                            </div>
                                            <span className="text-xs font-bold leading-tight">{slot.label}</span>
                                            <span className={cn("text-[10px] mt-0.5 leading-tight font-semibold", isSelected ? "text-indigo-100" : "text-slate-600")}>
                                                {slot.timeRange.replace(" – ", "-")}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Time Toggle */}
                            <div className="pt-2 flex items-center justify-between text-xs">
                                <button
                                    type="button"
                                    onClick={() => setIsCustomTime(!isCustomTime)}
                                    className="text-xs text-indigo-700 hover:text-indigo-900 font-bold underline underline-offset-2"
                                >
                                    {isCustomTime ? "← Use standard time window" : "+ Set custom exact time"}
                                </button>

                                {isCustomTime && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-slate-700 font-bold">Exact Time:</span>
                                        <Input
                                            type="time"
                                            value={customTime}
                                            onChange={(e) => setCustomTime(e.target.value)}
                                            className="h-8 w-28 text-xs bg-white border-slate-300 font-bold font-mono text-slate-900"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Assign Beat Officer Solid Card */}
                    <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <UserCheck className="h-4 w-4 text-indigo-700" />
                                Assign Beat Officer
                            </label>
                            {loadingOfficers && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-700" />}
                        </div>

                        <Select value={selectedOfficerId} onValueChange={(val) => { setSelectedOfficerId(val); setError(''); }}>
                            <SelectTrigger className="w-full text-xs h-10 border-slate-300 bg-white shadow-xs font-bold text-slate-900">
                                <SelectValue placeholder={loadingOfficers ? "Loading station beat officers..." : "Choose beat officer..."} />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 z-50 bg-white border-slate-300 shadow-xl">
                                {officers.map((officer) => {
                                    const isCitizenBeat = item?.beatId && officer.beatId === item.beatId;
                                    const beatName = officer.Beat?.name || officer.beatName || "Assigned Beat";
                                    return (
                                        <SelectItem key={officer.id} value={officer.id} className="text-xs py-2.5 hover:bg-slate-100">
                                            <div className="flex items-center justify-between gap-3 w-full">
                                                <span className="font-bold text-slate-900">
                                                    {officer.name} <span className="font-medium text-slate-600">({officer.rank || 'Beat Officer'})</span>
                                                </span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {officer.badgeNumber && (
                                                        <span className="text-[10px] font-mono font-bold text-slate-600">
                                                            #{officer.badgeNumber}
                                                        </span>
                                                    )}
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[10px] px-2 py-0.5 font-bold",
                                                            isCitizenBeat
                                                                ? "bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs"
                                                                : "bg-slate-100 text-slate-800 border-slate-300"
                                                        )}
                                                    >
                                                        {isCitizenBeat ? `★ Beat: ${beatName}` : `Beat: ${beatName}`}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    );
                                })}

                                {!loadingOfficers && officers.length === 0 && (
                                    <SelectItem value="none" disabled className="text-slate-500 font-medium">
                                        No beat-assigned officers found for this police station
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>

                        <p className="text-[11px] text-slate-600 font-medium">
                            Only officers assigned to a beat in this police station can be assigned verification duties.
                        </p>
                    </div>

                    {/* 4. Instructions for Officer Solid Card */}
                    <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-sm space-y-2.5">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-slate-600" />
                            Officer Instructions (Optional)
                        </label>

                        <Textarea
                            placeholder="Add specific guidance or verification notes for the beat officer..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="text-xs resize-none border-slate-300 bg-white font-medium text-slate-900 shadow-xs focus:border-indigo-600"
                        />

                        {/* Quick Suggestion Solid Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {QUICK_INSTRUCTIONS.map((inst, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleQuickInstruction(inst)}
                                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-800 hover:text-indigo-950 font-semibold transition-colors border border-slate-300"
                                >
                                    + {inst}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Solid Action Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-300 bg-white flex items-center justify-between gap-3 shadow-xl">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAssign}
                        disabled={submitting || !selectedDate || !selectedOfficerId}
                        className="text-xs font-bold px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white shadow-md hover:shadow-lg gap-2"
                    >
                        {submitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        Confirm Assignment & Send to App
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
