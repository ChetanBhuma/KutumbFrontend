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
    const [totalCitizens, setTotalCitizens] = useState<number>(0)
    const [loading, setLoading] = useState(true)

    // Fetch initial data
    const fetchData = useCallback(async () => {
        if (!user) return // Prevent fetching if user is logged out

        try {
            setLoading(true)

            // Fetch Officers
            const officersRes = await apiClient.getOfficers({ limit: 1000, isActive: true })

            // Fetch Beats
            const queryParams: any = {};
            if (user?.policeStationId && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
                queryParams.policeStationId = user.policeStationId;
            }

            const beatsRes = await apiClient.getBeats(queryParams);

            // Fetch Dashboard Stats for jurisdiction citizen count
            const statsRes = await apiClient.getDashboardStats();
            if (statsRes.success && statsRes.data?.citizens?.total !== undefined) {
                setTotalCitizens(statsRes.data.citizens.total);
            }

            if (officersRes.success) {
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
                        totalCitizensCount={totalCitizens}
                        onOfficerClick={() => { }}
                        onOfficerMove={handleOfficerMove}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}
