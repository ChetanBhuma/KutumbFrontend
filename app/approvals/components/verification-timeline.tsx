"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock, XCircle, User, FileText, Phone } from "lucide-react"
import { format } from "date-fns"

interface TimelineEntry {
    key: string
    title: string
    description?: string
    status: "completed" | "pending" | "blocked"
    timestamp?: string
    metadata?: any
}

interface VerificationTimelineProps {
    timeline: TimelineEntry[]
}

export function VerificationTimeline({ timeline }: VerificationTimelineProps) {
    const getIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="h-6 w-6 text-green-600" />
            case "blocked":
                return <XCircle className="h-6 w-6 text-red-600" />
            default:
                return <Circle className="h-6 w-6 text-gray-300" />
        }
    }

    const getLineClass = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-600"
            default:
                return "bg-gray-200"
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-8 pl-2">
                    {timeline.map((entry, index) => (
                        <div key={entry.key} className="flex gap-4 relative">
                            {/* Connector Line */}
                            {index !== timeline.length - 1 && (
                                <div
                                    className={`absolute left-[11px] top-8 bottom-[-32px] w-0.5 ${getLineClass(entry.status)}`}
                                />
                            )}

                            <div className="relative z-10 bg-white">
                                {getIcon(entry.status)}
                            </div>

                            <div className="flex-1 -mt-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-semibold ${entry.status === 'completed' ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {entry.title}
                                    </h4>
                                    {entry.timestamp && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {format(new Date(entry.timestamp), "dd MMM, HH:mm")}
                                        </span>
                                    )}
                                </div>

                                {entry.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                                )}

                                {/* Metadata display */}
                                {entry.metadata && (
                                    <div className="mt-2 text-xs bg-slate-50 p-2 rounded border space-y-1 text-slate-600">
                                        {Object.entries(entry.metadata).map(([key, value]) => {
                                            if (!value) return null;
                                            return (
                                                <div key={key} className="flex gap-2">
                                                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                    <span>{String(value)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
