"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, MapPin, Shield, User, Users, GripVertical, AlertCircle, CheckCircle2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BeatOfficer } from "@/types/roster"
import { cn } from "@/lib/utils"

interface OfficerBoardProps {
    officers: BeatOfficer[]
    beats: any[]
    onOfficerClick: (officer: BeatOfficer) => void
    onOfficerMove: (officerId: string, toBeatId: string | null) => void
}

interface BoardColumn {
    id: string
    title: string
    subtitle?: string
    beatId?: string
    items: BeatOfficer[]
    stats?: {
        officerCount: number
        citizenCount: number
    }
}

// Stats Card Component
function StatCard({ title, value, icon: Icon, colorClass, borderClass }: any) {
    return (
        <Card className={cn("border-l-4 shadow-sm", borderClass)}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="text-2xl font-bold mt-1">{value}</div>
                </div>
                <div className={cn("p-2 rounded-full bg-opacity-10", colorClass)}>
                    <Icon className={cn("h-5 w-5", colorClass.replace("bg-", "text-"))} />
                </div>
            </CardContent>
        </Card>
    )
}

function OfficerCard({ officer, onClick }: { officer: BeatOfficer; onClick: () => void }) {
    const isHighLoad = (officer.assignedCitizens || 0) > 50;

    return (
        <div
            className={cn(
                "group relative flex items-start gap-2 p-2 mb-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 cursor-grab active:cursor-grabbing transition-all",
                !officer.beatId ? "border-l-4 border-l-orange-400" : "border-l-4 border-l-green-400"
            )}
            onClick={onClick}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("officerId", officer.id)
                e.dataTransfer.setData("fromBeatId", officer.beatId || "unassigned")
            }}
        >
            <div className="mt-1 flex-shrink-0">
                <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage src={officer.avatarUrl} alt={officer.name} />
                    <AvatarFallback className="text-xs bg-slate-100 text-slate-600 font-semibold">
                        {officer.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-slate-800 truncate leading-tight" title={officer.name}>
                        {officer.name}
                    </h4>
                    <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600 uppercase tracking-wide whitespace-nowrap">
                            {officer.rank}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[80px]" title={officer.badgeNumber}>
                            {officer.badgeNumber.split('-').pop()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1" title="Assigned Citizens">
                            <Users className="h-3 w-3 text-blue-500" />
                            <span className="font-medium text-slate-700">{officer.assignedCitizens || 0}</span>
                        </div>
                        {officer.mobileNumber && (
                            <div className="flex items-center gap-1 truncate" title="Mobile">
                                <span className="text-[10px]">{officer.mobileNumber}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Status Indicator */}
            <div className={cn(
                "absolute top-3 right-3 h-2 w-2 rounded-full ring-2 ring-white",
                officer.isActive ? "bg-green-500" : "bg-gray-300"
            )} />
        </div>
    )
}

function BoardDropZone({
    column,
    onDrop
}: {
    column: BoardColumn,
    onDrop: (officerId: string) => void
}) {
    return (
        <div
            className="flex-1 min-h-[100px] transition-all rounded-b-xl"
            onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('bg-blue-50/50')
            }}
            onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-blue-50/50')
            }}
            onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('bg-blue-50/50')
                const officerId = e.dataTransfer.getData("officerId")
                if (officerId) onDrop(officerId)
            }}
        >
            <div className="flex flex-col p-2 pb-20">
                {column.items.map((officer) => (
                    <OfficerCard key={officer.id} officer={officer} onClick={() => { }} />
                ))}
                {column.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 m-2 text-slate-300 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <Shield className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">Empty</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export function OfficerBoard({ officers, beats, onOfficerClick, onOfficerMove }: OfficerBoardProps) {
    // 1. Unassigned Column
    const unassignedOfficers = officers.filter(o => !o.beatId)

    // 2. Beat Columns
    const beatColumns: BoardColumn[] = beats.map(beat => ({
        id: beat.id,
        title: beat.name,
        subtitle: beat.exactLocation || "No location set",
        beatId: beat.id,
        items: officers.filter(o => o.beatId === beat.id),
        stats: {
            officerCount: beat.officerCount || 0, // Backend might need to send this or we calculate
            citizenCount: beat.citizenCount || 0
        }
    }))

    const columns = [
        {
            id: 'unassigned',
            title: 'Unassigned',
            subtitle: 'Officers pending assignment',
            items: unassignedOfficers,
            stats: { officerCount: unassignedOfficers.length, citizenCount: 0 }
        },
        ...beatColumns
    ]

    // Calculate Stats for Top Bar
    const totalOfficers = officers.length
    const totalAssigned = officers.filter(o => o.beatId).length
    const totalUnassigned = unassignedOfficers.length
    const totalCitizens = officers.reduce((acc, curr) => acc + (curr.assignedCitizens || 0), 0) // Approximation if backend doesn't send total

    return (
        <div className="flex flex-col gap-6 h-full font-sans bg-slate-50/50 p-1">

            {/* 1. Stats Overview Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Officers"
                    value={totalOfficers}
                    icon={Shield}
                    colorClass="bg-blue-100 text-blue-600"
                    borderClass="border-l-blue-500"
                />
                <StatCard
                    title="Assigned"
                    value={totalAssigned}
                    icon={CheckCircle2}
                    colorClass="bg-green-100 text-green-600"
                    borderClass="border-l-green-500"
                />
                <StatCard
                    title="Unassigned"
                    value={totalUnassigned}
                    icon={AlertCircle}
                    colorClass="bg-orange-100 text-orange-600"
                    borderClass="border-l-orange-500"
                />
                <StatCard
                    title="Total Citizens Covered"
                    value={totalCitizens}
                    icon={Users}
                    colorClass="bg-indigo-100 text-indigo-600"
                    borderClass="border-l-indigo-500"
                />
            </div>

            {/* 2. Board Grid - CSS Grid for horizontal layout with sticky first column */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 min-w-max h-full items-start relative pl-1">
                    {/* Render Columns */}
                    {columns.map((col, index) => (
                        <div
                            key={col.id}
                            className={cn(
                                "w-[320px] flex-shrink-0 flex flex-col h-full",
                                // Sticky implementation for first column ('unassigned')
                                col.id === 'unassigned' && "sticky left-0 z-20"
                            )}
                        >
                            <Card className={cn(
                                "flex flex-col h-full max-h-[calc(100vh-210px)] overflow-hidden shadow-sm border-0 ring-1 ring-slate-200",
                                // Added bg-white specifically to fix transparency when sticky
                                col.id === 'unassigned' ? "bg-white ring-orange-200 shadow-xl" : "bg-white"
                            )}>
                                <CardHeader className={cn(
                                    "py-3 px-4 border-b border-slate-100 sticky top-0 z-10",
                                    col.id === 'unassigned' ? "bg-orange-50/30" : "bg-white"
                                )}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-bold text-slate-800 leading-tight">
                                                {col.title}
                                            </CardTitle>
                                            {col.subtitle && (
                                                <p className="text-[11px] text-slate-400 mt-1 font-medium truncate max-w-[180px]">
                                                    {col.subtitle}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={col.items.length > 0 ? "default" : "secondary"}
                                            className={cn(
                                                "ml-2 h-6 px-2 text-xs font-mono rounded-md",
                                                col.id === 'unassigned' ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                            )}>
                                            {col.items.length}
                                        </Badge>
                                    </div>
                                    {col.beatId && (
                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-50">
                                            <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                                <Users className="h-3 w-3" />
                                                {col.stats?.citizenCount} Citizens
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className={cn("flex-1 p-0 overflow-hidden", col.id === 'unassigned' ? "bg-orange-50/10" : "bg-slate-50/50")}>
                                    <ScrollArea className="h-[calc(100vh-280px)]">
                                        <BoardDropZone
                                            column={col}
                                            onDrop={(officerId) => onOfficerMove(officerId, col.beatId || null)}
                                        />
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
