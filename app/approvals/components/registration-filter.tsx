"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"

interface RegistrationFilterProps {
    onFilterChange: (filters: {
        status?: string
        districtId?: string
        vulnerabilityLevel?: string
        search?: string
    }) => void
}

export function RegistrationFilter({ onFilterChange }: RegistrationFilterProps) {
    const { districts } = useMasterData()
    const [filters, setFilters] = useState({
        status: "all",
        districtId: "all",
        vulnerabilityLevel: "all",
        search: "",
    })

    const handleApply = () => {
        const activeFilters: any = {
            search: filters.search,
        }
        if (filters.status !== "all") activeFilters.status = filters.status
        if (filters.districtId !== "all") activeFilters.districtId = filters.districtId
        if (filters.vulnerabilityLevel !== "all") activeFilters.vulnerabilityLevel = filters.vulnerabilityLevel

        onFilterChange(activeFilters)
    }

    const handleReset = () => {
        setFilters({
            status: "all",
            districtId: "all",
            vulnerabilityLevel: "all",
            search: "",
        })
        onFilterChange({})
    }

    const hasActiveFilters = Boolean(
        filters.search ||
        filters.status !== "all" ||
        filters.districtId !== "all" ||
        filters.vulnerabilityLevel !== "all"
    )

    return (
        <Card className="mb-5 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="filters" className="border-none">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                            <span>Filters & Search</span>
                            {hasActiveFilters && (
                                <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary rounded-full">
                                    Active
                                </span>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-1 pb-4 space-y-3.5">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, mobile, or ID..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-9 h-9"
                                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleApply} size="sm" className="h-9 px-4">
                                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                                    Apply
                                </Button>
                                <Button variant="outline" onClick={handleReset} size="sm" className="h-9 px-3">
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Select
                                value={filters.status}
                                onValueChange={(val) => setFilters({ ...filters, status: val })}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.districtId}
                                onValueChange={(val) => setFilters({ ...filters, districtId: val })}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="District" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Districts</SelectItem>
                                    {(districts || []).map((d: any) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.vulnerabilityLevel}
                                onValueChange={(val) => setFilters({ ...filters, vulnerabilityLevel: val })}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Vulnerability" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    )
}
