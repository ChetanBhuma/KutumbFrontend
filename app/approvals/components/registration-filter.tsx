"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import apiClient from "@/lib/api-client"

interface RegistrationFilterProps {
    onFilterChange: (filters: {
        status?: string
        districtId?: string
        vulnerabilityLevel?: string
        search?: string
    }) => void
}

export function RegistrationFilter({ onFilterChange }: RegistrationFilterProps) {
    const [districts, setDistricts] = useState<{ id: string; name: string }[]>([])
    const [filters, setFilters] = useState({
        status: "all",
        districtId: "all",
        vulnerabilityLevel: "all",
        search: "",
    })

    useEffect(() => {
        // Fetch filter options (Districts)
        const loadDistricts = async () => {
            try {
                const res = await apiClient.get<any>("/districts")
                if (res.data) setDistricts(res.data)
            } catch (e) {
                console.error("Failed to load districts", e)
            }
        }
        loadDistricts()
    }, [])

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

    return (
        <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, mobile, or ID..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-10"
                            onKeyDown={(e) => e.key === "Enter" && handleApply()}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleApply}>
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                        <Button variant="outline" onClick={handleReset} size="icon">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        value={filters.status}
                        onValueChange={(val) => setFilters({ ...filters, status: val })}
                    >
                        <SelectTrigger>
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
                        <SelectTrigger>
                            <SelectValue placeholder="District" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {districts.map((d) => (
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
                        <SelectTrigger>
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
            </CardContent>
        </Card>
    )
}
