"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, User } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

interface VisitSchedulerProps {
    registrationId: string
    citizenId?: string | null
    policeStationId?: string
    beatId?: string
    onScheduled: () => void
}

export function VisitScheduler({ registrationId, citizenId, policeStationId, beatId, onScheduled }: VisitSchedulerProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [officers, setOfficers] = useState<{ id: string; name: string; rank: string }[]>([])
    const [selectedDate, setSelectedDate] = useState<Date>()
    const [selectedOfficer, setSelectedOfficer] = useState<string>()
    const [visitType, setVisitType] = useState("Verification")

    useEffect(() => {
        if (open) {
            loadOfficers()
        }
    }, [open, policeStationId, beatId])

    const loadOfficers = async () => {
        try {
            const params: any = { isActive: 'true' }
            if (policeStationId) params.policeStationId = policeStationId
            if (beatId) params.beatId = beatId

            const res = await apiClient.get<any>("/officers", { params })
            if (res.data?.data) {
                setOfficers(res.data.data)
            } else if (Array.isArray(res.data)) {
                setOfficers(res.data)
            }
        } catch (e) {
            console.error("Failed to load officers", e)
        }
    }

    const handleSchedule = async () => {
        if (!selectedDate || !selectedOfficer || !citizenId) return

        try {
            setLoading(true)
            await apiClient.post("/visits", {
                seniorCitizenId: citizenId,
                officerId: selectedOfficer,
                scheduledDate: selectedDate.toISOString(),
                visitType: visitType,
                policeStationId: policeStationId
            })

            toast({
                title: "Visit Scheduled",
                description: `Verification visit scheduled for ${format(selectedDate, "PPP")}`
            })

            setOpen(false)
            onScheduled()
        } catch (error) {
            console.error(error)
            toast({
                title: "Scheduling Failed",
                description: "Could not schedule the visit. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    // If no citizenId, we can't schedule a visit properly yet (backend constraints usually)
    // But for approving registrations, we usually need the citizen Record created first.
    if (!citizenId) {
        return (
            <Button variant="outline" disabled title="Citizen record not created yet">Schedule Visit</Button>
        )
    }

    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>Schedule Visit</Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Schedule Verification Visit</DialogTitle>
                        <DialogDescription>
                            Assign an officer to verify this citizen's details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Visit Type</label>
                            <Select value={visitType} onValueChange={setVisitType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Verification">Verification</SelectItem>
                                    <SelectItem value="Routine">Routine Check-up</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assign Officer</label>
                            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Officer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {officers.map((officer) => (
                                        <SelectItem key={officer.id} value={officer.id}>
                                            {officer.name} ({officer.rank})
                                        </SelectItem>
                                    ))}
                                    {officers.length === 0 && (
                                        <SelectItem value="none" disabled>No officers in this beat</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSchedule} disabled={loading || !selectedDate || !selectedOfficer}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Schedule Visit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
