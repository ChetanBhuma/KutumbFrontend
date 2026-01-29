"use client"

import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CitizenWorkflowProps {
    status: string
    verificationStatus: string | null
    digitalCardIssued: boolean
}

export function CitizenWorkflow({ status, verificationStatus, digitalCardIssued }: CitizenWorkflowProps) {
    // Determine step statuses based on verification flow
    const isFieldVerified = verificationStatus === "FieldVerified" || verificationStatus === "Verified";
    const isFullyVerified = verificationStatus === "Verified";
    const isRejected = verificationStatus === "Rejected" || status === "Rejected";

    const steps = [
        {
            id: "registration",
            label: "Registration",
            description: "Profile submitted",
            status: "completed", // Always completed if viewing profile
        },
        {
            id: "verification",
            label: "Field Verification",
            description: isFieldVerified ? "Officer verified" : "Awaiting officer visit",
            status: isFullyVerified ? "completed" :
                isFieldVerified ? "completed" :
                    isRejected ? "rejected" :
                        "current",
        },
        {
            id: "approval",
            label: "Admin Approval",
            description: isFullyVerified ? "Approved" :
                isFieldVerified ? "Pending admin review" :
                    "Awaiting verification",
            status: isFullyVerified ? "completed" :
                isRejected ? "rejected" :
                    isFieldVerified ? "current" :
                        "pending",
        },
        {
            id: "card",
            label: "Digital Card",
            description: digitalCardIssued ? "Card issued" : "Pending issuance",
            status: digitalCardIssued ? "completed" :
                isFullyVerified ? "current" :
                    "pending",
        },
    ]

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted -z-10" />
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
                    style={{
                        width: `${Math.min(100, Math.max(0, (steps.filter(s => s.status === "completed").length - 1)) / (steps.length - 1) * 100)}%`
                    }}
                />

                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center bg-background px-2">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                step.status === "completed" ? "bg-primary border-primary text-primary-foreground" :
                                    step.status === "current" ? "bg-background border-primary text-primary animate-pulse" :
                                        step.status === "rejected" ? "bg-red-100 border-red-500 text-red-600" :
                                            "bg-muted border-muted-foreground/30 text-muted-foreground"
                            )}
                        >
                            {step.status === "completed" ? <CheckCircle2 className="w-6 h-6" /> :
                                step.status === "rejected" ? <XCircle className="w-6 h-6" /> :
                                    step.status === "current" ? <Clock className="w-6 h-6" /> :
                                        <Circle className="w-6 h-6" />}
                        </div>
                        <div className="mt-2 text-center">
                            <p className={cn(
                                "text-sm font-bold",
                                step.status === "completed" ? "text-primary" :
                                    step.status === "current" ? "text-foreground" :
                                        step.status === "rejected" ? "text-red-600" :
                                            "text-muted-foreground"
                            )}>
                                {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground hidden md:block max-w-[120px]">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
