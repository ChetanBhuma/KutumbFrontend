"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, setHours, setMinutes } from "date-fns"
import {
    Calendar as CalendarIcon,
    Loader2,
    UserCheck,
    ShieldCheck,
    MapPin,
    Clock,
    FileText,
    Sun,
    Sunset,
    Moon,
    Check,
    User,
    CheckCircle2,
    Building2,
    Send
} from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

interface VisitSchedulerProps {
    registrationId: string
    citizenId?: string | null
    policeStationId?: string
    beatId?: string
    policeStationName?: string
    citizenName?: string
    onScheduled: () => void
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
]

const QUICK_INSTRUCTIONS = [
    "Verify permanent address & ID proof",
    "Check physical wellbeing & living condition",
    "Meet emergency contact / caregiver",
    "Assist with Delhi Police Senior Citizen Card"
]

export function VisitScheduler({
    registrationId,
    citizenId,
    policeStationId,
    beatId,
    policeStationName,
    citizenName,
    onScheduled
}: VisitSchedulerProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingOfficers, setLoadingOfficers] = useState(false)
    const [officers, setOfficers] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(Date.now() + 24 * 60 * 60 * 1000))
    const [selectedSlotId, setSelectedSlotId] = useState<string>("morning")
    const [customTime, setCustomTime] = useState<string>("10:00")
    const [isCustomTime, setIsCustomTime] = useState<boolean>(false)
    const [selectedOfficer, setSelectedOfficer] = useState<string>()
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (open) {
            loadOfficers()
        }
    }, [open, policeStationId, beatId])

    const loadOfficers = async () => {
        try {
            setLoadingOfficers(true)
            const params: any = { isActive: 'true', hasBeat: 'true', limit: 100 }
            if (policeStationId) params.policeStationId = policeStationId

            const res: any = await apiClient.get("/officers", { params })
            const raw = res?.data || res
            const items = Array.isArray(raw)
                ? raw
                : (raw?.items || raw?.data?.items || raw?.data || [])

            // Filter strictly for beat-assigned officers
            const beatAssignedOfficers = items.filter((o: any) => {
                return !!(o.beatId && (o.Beat?.name || o.beatName || o.beat))
            })

            // Sort so matching citizen beat officer appears at the top
            const sorted = [...beatAssignedOfficers].sort((a, b) => {
                if (beatId) {
                    if (a.beatId === beatId && b.beatId !== beatId) return -1
                    if (b.beatId === beatId && a.beatId !== beatId) return 1
                }
                return (a.name || "").localeCompare(b.name || "")
            })

            setOfficers(sorted)

            if (sorted.length > 0) {
                const exactMatch = beatId ? sorted.find(o => o.beatId === beatId) : null
                if (exactMatch) {
                    setSelectedOfficer(exactMatch.id)
                } else if (!selectedOfficer) {
                    setSelectedOfficer(sorted[0].id)
                }
            }
        } catch (e) {
            console.error("Failed to load officers", e)
            setOfficers([])
        } finally {
            setLoadingOfficers(false)
        }
    }

    const calculateFinalScheduledDate = (): Date | undefined => {
        if (!selectedDate) return undefined

        let targetDate = new Date(selectedDate)
        if (isCustomTime && customTime) {
            const [hours, minutes] = customTime.split(":").map(Number)
            targetDate = setHours(setMinutes(targetDate, minutes || 0), hours || 10)
        } else {
            const slot = TIME_SLOTS.find(s => s.id === selectedSlotId) || TIME_SLOTS[0]
            targetDate = setHours(setMinutes(targetDate, slot.defaultMinute), slot.defaultHour)
        }
        return targetDate
    }

    const getSlotLabel = (): string => {
        if (isCustomTime) {
            return `Custom Time (${customTime})`
        }
        const slot = TIME_SLOTS.find(s => s.id === selectedSlotId)
        return slot ? `${slot.label} (${slot.timeRange})` : "Morning"
    }

    const handleQuickInstruction = (inst: string) => {
        if (!notes) {
            setNotes(inst)
        } else if (!notes.includes(inst)) {
            setNotes(`${notes}; ${inst}`)
        }
    }

    const handleSchedule = async () => {
        const finalDate = calculateFinalScheduledDate()

        if (!finalDate || !selectedOfficer || !citizenId) {
            toast({
                title: "Incomplete Schedule Form",
                description: "Please choose a visit date, time slot, and assigned beat officer.",
                variant: "destructive"
            })
            return
        }

        try {
            setLoading(true)
            const slotInfo = getSlotLabel()
            const fullNotes = notes
                ? `[Time Slot: ${slotInfo}] ${notes}`
                : `[Time Slot: ${slotInfo}] Registration physical verification visit`

            await apiClient.post("/visits", {
                seniorCitizenId: citizenId,
                officerId: selectedOfficer,
                scheduledDate: finalDate.toISOString(),
                visitType: "Verification",
                policeStationId: policeStationId,
                notes: fullNotes
            })

            toast({
                title: "Visit Scheduled & Assigned",
                description: `Verification visit assigned for ${format(finalDate, "PPP")} (${slotInfo}).`
            })

            setOpen(false)
            onScheduled()
        } catch (error: any) {
            console.error(error)
            toast({
                title: "Scheduling Failed",
                description: error.response?.data?.message || "Could not schedule the visit. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (!citizenId) {
        return (
            <Button
                variant="outline"
                disabled
                title="Citizen record not created yet"
                className="opacity-60 cursor-not-allowed"
            >
                Schedule Visit
            </Button>
        )
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
                <CalendarIcon className="h-4 w-4" />
                <span>Schedule Verification Visit</span>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg flex flex-col justify-between p-0 bg-white border-l border-slate-300 shadow-2xl">
                    {/* Solid High-Contrast Header */}
                    <div className="p-5 sm:p-6 border-b border-indigo-900 bg-indigo-950 text-white shadow-md">
                        <SheetTitle className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Schedule Verification Visit
                        </SheetTitle>

                        {/* Solid Citizen Context Card */}
                        {(citizenName || policeStationName) && (
                            <div className="mt-4 p-3 rounded-lg bg-indigo-900 border border-indigo-700 flex items-center justify-between gap-2 text-xs shadow-inner">
                                <div className="flex items-center gap-2 min-w-0">
                                    <User className="h-4 w-4 text-indigo-300 shrink-0" />
                                    <span className="font-bold text-white truncate text-sm">{citizenName || "Applicant"}</span>
                                </div>
                                {policeStationName && (
                                    <div className="flex items-center gap-1.5 shrink-0 text-white bg-indigo-800 border border-indigo-600 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs">
                                        <Building2 className="h-3.5 w-3.5 text-indigo-300" />
                                        <span>PS: {policeStationName}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Body with Solid Backgrounds */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-100/90">
                        {/* 1. Visit Type Solid Card */}
                        <div className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Physical Verification Visit</p>
                                    <p className="text-[11px] text-slate-600 font-medium">Mandatory police check before registration approval</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5">
                                Required
                            </Badge>
                        </div>

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
                                        const Icon = slot.icon
                                        const isSelected = !isCustomTime && selectedSlotId === slot.id
                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomTime(false)
                                                    setSelectedSlotId(slot.id)
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
                                        )
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

                            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                                <SelectTrigger className="w-full text-xs h-10 border-slate-300 bg-white shadow-xs font-bold text-slate-900">
                                    <SelectValue placeholder={loadingOfficers ? "Loading station beat officers..." : "Choose beat officer..."} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 z-50 bg-white border-slate-300 shadow-xl">
                                    {officers.map((officer: any) => {
                                        const isCitizenBeat = beatId && officer.beatId === beatId
                                        const beatName = officer.Beat?.name || officer.beatName || "Assigned Beat"
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
                                        )
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
                            onClick={() => setOpen(false)}
                            className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSchedule}
                            disabled={loading || !selectedDate || !selectedOfficer}
                            className="text-xs font-bold px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white shadow-md hover:shadow-lg gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            Assign Duty & Send to App
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
