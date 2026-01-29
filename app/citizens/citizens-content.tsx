"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CitizenCard } from "@/components/citizens/citizen-card"
import { CitizenDetails } from "@/components/citizens/citizen-details"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Citizen, CitizenFilters } from "@/types/citizen"
import { Search, Filter, Plus, Download, Users } from "lucide-react"

interface CitizensContentProps {
    initialCitizens: Citizen[]
}

export function CitizensContent({ initialCitizens }: CitizensContentProps) {
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<CitizenFilters>({})
    const [showFilters, setShowFilters] = useState(false)

    // Client-side filtering for now, can be moved to server if needed
    const filteredCitizens = useMemo(() => {
        let citizens = initialCitizens

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            citizens = citizens.filter(c =>
                c.personalInfo.firstName.toLowerCase().includes(query) ||
                c.personalInfo.lastName.toLowerCase().includes(query) ||
                c.contactInfo.phone.includes(query) ||
                c.id.toLowerCase().includes(query)
            )
        }

        if (filters.gender && filters.gender !== 'all') {
            citizens = citizens.filter(c => c.personalInfo.gender === filters.gender)
        }
        if (filters.riskLevel && filters.riskLevel !== 'all') {
            citizens = citizens.filter(c => c.riskScore.level === filters.riskLevel)
        }
        if (filters.verificationStatus && filters.verificationStatus !== 'all') {
            citizens = citizens.filter(c => c.metadata.verificationStatus === filters.verificationStatus)
        }

        return citizens
    }, [initialCitizens, searchQuery, filters])

    const handleFilterChange = (key: keyof CitizenFilters, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "all" ? undefined : value,
        }))
    }

    const clearFilters = () => {
        setFilters({})
        setSearchQuery("")
    }

    const activeFiltersCount = Object.values(filters).filter(Boolean).length

    return (
        <DashboardLayout
            title="Citizens Management"
            description="Manage citizen records and information"
            currentPath="/citizens"
        >
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Panel - Citizens List */}
                <div className="lg:w-1/3 space-y-4">
                    {/* Search and Filters */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Citizens ({filteredCitizens.length})
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, phone, ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Filter Toggle */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </Button>
                                {activeFiltersCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            {/* Filters */}
                            {showFilters && (
                                <div className="space-y-3 pt-2 border-t">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Gender</label>
                                            <Select
                                                value={filters.gender || "all"}
                                                onValueChange={(value) => handleFilterChange("gender", value)}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Risk Level</label>
                                            <Select
                                                value={filters.riskLevel || "all"}
                                                onValueChange={(value) => handleFilterChange("riskLevel", value)}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Verification Status</label>
                                        <Select
                                            value={filters.verificationStatus || "all"}
                                            onValueChange={(value) => handleFilterChange("verificationStatus", value)}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Citizens List */}
                    <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                        {filteredCitizens.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No citizens found matching your criteria.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredCitizens.map((citizen) => (
                                <CitizenCard
                                    key={citizen.id}
                                    citizen={citizen}
                                    isSelected={selectedCitizen?.id === citizen.id}
                                    onClick={() => setSelectedCitizen(citizen)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel - Citizen Details */}
                <div className="lg:w-2/3">
                    {selectedCitizen ? (
                        <CitizenDetails citizen={selectedCitizen} />
                    ) : (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Select a Citizen</h3>
                                    <p className="text-muted-foreground">
                                        Choose a citizen from the list to view their detailed information.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
