"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { OfficerBoard } from "@/components/roster/officer-board"
import apiClient from "@/lib/api-client"
import { BeatOfficer } from "@/types/roster"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function RosterPage() {
    const { user } = useAuth()
    const { toast } = useToast()

    const [officers, setOfficers] = useState<BeatOfficer[]>([])
    const [beats, setBeats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch initial data
    const fetchData = useCallback(async () => {
        if (!user) return // Prevent fetching if user is logged out

        try {
            setLoading(true)

            // Fetch Officers
            // Note: Assuming getOfficers supports filtering or returns all active ones
            const officersRes = await apiClient.getOfficers({ limit: 1000, isActive: true })

            // Fetch Beats
            // If user is SHO, fetch for their police station. Otherwise fetch all or handle scope.
            // For now fetching all beats for the station if available, or just all beats.
            // Filter by user's scope if needed.
            const beatsRes = await apiClient.getBeats({
                policeStationId: user?.policeStationId // Filter by user's station if applicable
            })

            if (officersRes.success) {
                // Fix: paginatedQuery returns { items: [], pagination: {} }
                // Access .items from the data object
                // @ts-ignore - Backend types might not perfectly match paginated response structure yet
                const officerList = officersRes.data.items || officersRes.data.data || []
                setOfficers(officerList)
            }

            if (beatsRes.success) {
                setBeats(beatsRes.data || [])
            }

        } catch (error) {
            console.error("Failed to fetch roster data", error)
            toast({
                title: "Error",
                description: "Failed to load roster data. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [user, toast])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleOfficerMove = async (officerId: string, toBeatId: string | null) => {
        try {
            // Optimistic update
            const originalOfficers = [...officers]
            setOfficers(prev => prev.map(o => {
                if (o.id === officerId) {
                    return { ...o, beatId: toBeatId }
                }
                return o
            }))

            // Call API
            // Use assignOfficerToBeat for simple roster moves within the same station
            await apiClient.assignOfficerToBeat(officerId, toBeatId)

            toast({
                title: "Success",
                description: toBeatId ? "Officer assigned to beat" : "Officer unassigned",
            })

            // Refresh to sync stats/counts
            fetchData()

        } catch (error) {
            console.error("Failed to move officer", error)
            toast({
                title: "Error",
                description: "Failed to update assignment.",
                variant: "destructive"
            })
            // Revert optimistic update
            fetchData()
        }
    }

    return (
        <DashboardLayout title="Duty Roster" description="Manage officer beat assignments">
            <div className="h-full space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Officer Assignments</h1>
                        <p className="text-muted-foreground">Drag and drop officers to assign them to beats.</p>
                    </div>
                    {/* Add controls/filters here if needed */}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <OfficerBoard
                        officers={officers}
                        beats={beats}
                        onOfficerClick={() => { }}
                        onOfficerMove={handleOfficerMove}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}
