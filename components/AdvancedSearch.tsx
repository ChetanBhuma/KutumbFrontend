'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface SearchFilters {
    query?: string;
    minAge?: number;
    maxAge?: number;
    gender?: string;
    vulnerabilityLevel?: string;
    livingArrangement?: string;
    verificationStatus?: string;
    policeStationId?: string;
    beatId?: string;
    hasHealthConditions?: boolean;
    lastVisitDays?: number;
}

interface AdvancedSearchProps {
    onSearch: (filters: SearchFilters) => void;
    onReset: () => void;
    loading?: boolean;
    resultCount?: number;
}

export default function AdvancedSearch({ onSearch, onReset, loading, resultCount }: AdvancedSearchProps) {
    const [filters, setFilters] = useState<SearchFilters>({});
    const [expanded, setExpanded] = useState(false);

    const updateFilter = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value
        }));
    };

    const handleSearch = () => {
        onSearch(filters);
    };

    const handleReset = () => {
        setFilters({});
        onReset();
    };

    const activeFilterCount = Object.keys(filters).filter(key => filters[key as keyof SearchFilters] !== undefined).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Advanced Search</CardTitle>
                        {resultCount !== undefined && (
                            <p className="text-sm text-gray-600 mt-1">
                                {resultCount} result{resultCount !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                            <Badge variant="outline">{activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}</Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? '📐 Collapse' : '🔍 Expand Filters'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Search */}
                <div>
                    <Label htmlFor="query">Quick Search</Label>
                    <div className="flex gap-2">
                        <Input
                            id="query"
                            placeholder="Search by name, phone, Aadhaar, address..."
                            value={filters.query || ''}
                            onChange={(e) => updateFilter('query', e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {expanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                        {/* Age Range */}
                        <div className="space-y-2">
                            <Label>Age Range</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minAge || ''}
                                    onChange={(e) => updateFilter('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxAge || ''}
                                    onChange={(e) => updateFilter('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <Label>Gender</Label>
                            <Select value={filters.gender || ''} onValueChange={(val) => updateFilter('gender', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Genders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Genders</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Vulnerability Level */}
                        <div>
                            <Label>Vulnerability Level</Label>
                            <Select value={filters.vulnerabilityLevel || ''} onValueChange={(val) => updateFilter('vulnerabilityLevel', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Levels</SelectItem>
                                    <SelectItem value="High">High Risk</SelectItem>
                                    <SelectItem value="Medium">Medium Risk</SelectItem>
                                    <SelectItem value="Low">Low Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Living Arrangement */}
                        <div>
                            <Label>Living Arrangement</Label>
                            <Select value={filters.livingArrangement || ''} onValueChange={(val) => updateFilter('livingArrangement', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Arrangements" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Arrangements</SelectItem>
                                    <SelectItem value="Alone">Living Alone</SelectItem>
                                    <SelectItem value="With Spouse">With Spouse</SelectItem>
                                    <SelectItem value="With Family">With Family</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Verification Status */}
                        <div>
                            <Label>Verification Status</Label>
                            <Select value={filters.verificationStatus || ''} onValueChange={(val) => updateFilter('verificationStatus', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Last Visit */}
                        <div>
                            <Label>Last Visit Within</Label>
                            <Select value={filters.lastVisitDays?.toString() || ''} onValueChange={(val) => updateFilter('lastVisitDays', val ? parseInt(val) : undefined)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any Time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Any Time</SelectItem>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="14">Last 14 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="60">Last 60 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button onClick={handleSearch} disabled={loading} className="flex-1">
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Searching...
                            </>
                        ) : (
                            '🔍 Search'
                        )}
                    </Button>
                    {activeFilterCount > 0 && (
                        <Button variant="outline" onClick={handleReset}>
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Active Filters Summary */}
                {activeFilterCount > 0 && !expanded && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {filters.query && (
                            <Badge variant="secondary">
                                Query: {filters.query}
                                <button
                                    className="ml-2 hover:text-red-600"
                                    onClick={() => updateFilter('query', undefined)}
                                >
                                    ×
                                </button>
                            </Badge>
                        )}
                        {filters.minAge && (
                            <Badge variant="secondary">
                                Min Age: {filters.minAge}
                                <button
                                    className="ml-2 hover:text-red-600"
                                    onClick={() => updateFilter('minAge', undefined)}
                                >
                                    ×
                                </button>
                            </Badge>
                        )}
                        {filters.maxAge && (
                            <Badge variant="secondary">
                                Max Age: {filters.maxAge}
                                <button
                                    className="ml-2 hover:text-red-600"
                                    onClick={() => updateFilter('maxAge', undefined)}
                                >
                                    ×
                                </button>
                            </Badge>
                        )}
                        {filters.gender && (
                            <Badge variant="secondary">
                                Gender: {filters.gender}
                                <button
                                    className="ml-2 hover:text-red-600"
                                    onClick={() => updateFilter('gender', undefined)}
                                >
                                    ×
                                </button>
                            </Badge>
                        )}
                        {filters.vulnerabilityLevel && (
                            <Badge variant="secondary">
                                Risk: {filters.vulnerabilityLevel}
                                <button
                                    className="ml-2 hover:text-red-600"
                                    onClick={() => updateFilter('vulnerabilityLevel', undefined)}
                                >
                                    ×
                                </button>
                            </Badge>
                        )}
                        {filters.livingArrangement && (
                            <Badge variant="secondary">
                                Living: {filters.livingArrangement}
                                <button
                                    className="ml-2 hover:text-red-600"
                                    onClick={() => updateFilter('livingArrangement', undefined)}
                                >
                                    ×
                                </button>
                            </Badge>
                        )}
                        {filters.verificationStatus && (
                            <Badge variant="secondary">
                                Status: {filters.verificationStatus}
                                <button
                                    className="ml-2 hover:text-red-600"
                                    onClick={() => updateFilter('verificationStatus', undefined)}
                                >
                                    ×
                                </button>
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
