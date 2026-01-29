"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import apiClient from "@/lib/api-client"

import { VerificationTimeline } from "../components/verification-timeline"
import { DetailView } from "../components/detail-view"
import { VisitScheduler } from "../components/visit-scheduler"

export default function ApprovalDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [remarks, setRemarks] = useState("")
    const [showRejectInput, setShowRejectInput] = useState(false)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const res = await apiClient.get<any>(`/citizen-portal/registrations/${id}/details`)
            setData(res.data)
        } catch (error) {
            console.error("Failed to fetch details", error)
            toast({
                title: "Error",
                description: "Failed to load application details",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [id, toast])

    useEffect(() => {
        if (id) fetchData()
    }, [id, fetchData])

    const handleApprove = async () => {
        try {
            setActionLoading(true)
            await apiClient.updateCitizenRegistrationStatus(id as string, {
                status: "APPROVED",
                remarks: remarks || "Approved by Admin"
            })

            toast({
                title: "Approved",
                description: "Registration application approved successfully"
            })
            router.push("/approvals")
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast({
                    title: "Permission Denied",
                    description: "Your session may be invalid or expired. Please logout and login again.",
                    variant: "destructive"
                });
                // Optional: Redirect to login or force logout
                // router.push('/admin/login');
            } else {
                toast({
                    title: "Action Failed",
                    description: error.response?.data?.message || "Could not approve application",
                    variant: "destructive"
                });
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!remarks) {
            toast({ title: "Remarks Required", description: "Please provide a reason for rejection", variant: "destructive" })
            return
        }

        try {
            setActionLoading(true)
            await apiClient.updateCitizenRegistrationStatus(id as string, {
                status: "REJECTED",
                remarks
            })

            toast({
                title: "Rejected",
                description: "Registration application rejected"
            })
            router.push("/approvals")
        } catch (error: any) {
            toast({
                title: "Action Failed",
                description: error.response?.data?.message || "Could not reject application",
                variant: "destructive"
            })
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Loading..." currentPath="/approvals">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    if (!data) return null

    const { registration, timeline, verificationSummary, reviewGuard } = data
    const isPending = registration.status === 'PENDING_REVIEW'
    const canApprove = reviewGuard?.allowApproval

    return (
        <ProtectedRoute permissionCode="citizens.approve">
            <DashboardLayout title="Review Application" currentPath="/approvals">
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Approvals
                    </Button>

                    <div className="flex gap-2">
                        <VisitScheduler
                            registrationId={registration.id}
                            citizenId={registration.citizenId}
                            policeStationId={registration.citizen?.policeStation?.id}
                            beatId={registration.citizen?.beat?.id}
                            onScheduled={fetchData}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Citizen Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <DetailView registration={registration} />
                    </div>

                    {/* Sidebar - Timeline & Actions */}
                    <div className="space-y-6">
                        <VerificationTimeline timeline={timeline} />

                        {/* Action Card */}
                        {isPending && (
                            <Card className="border-indigo-100 shadow-md">
                                <CardContent className="pt-6 space-y-4">
                                    <h3 className="font-semibold text-lg">Admin Decision</h3>

                                    {!showRejectInput ? (
                                        <>
                                            {canApprove ? (
                                                <div className="bg-green-50 p-3 rounded text-sm text-green-800 mb-4">
                                                    Verification completed. Ready for approval.
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mb-4">
                                                    {reviewGuard?.blockingReason || "Verification Pending"}
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-3">
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                    onClick={handleApprove}
                                                    disabled={actionLoading || !canApprove}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve Application
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    className="w-full"
                                                    onClick={() => setShowRejectInput(true)}
                                                    disabled={actionLoading}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject Application...
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Rejection Reason</label>
                                            <Textarea
                                                placeholder="Enter remarks for rejection..."
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    className="flex-1"
                                                    onClick={() => setShowRejectInput(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1"
                                                    onClick={handleReject}
                                                    disabled={actionLoading || !remarks}
                                                >
                                                    Confirm Reject
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    )
}
