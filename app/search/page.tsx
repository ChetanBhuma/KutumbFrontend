'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import AdvancedSearch, { SearchFilters } from '@/components/AdvancedSearch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
    const router = useRouter();
    const [citizens, setCitizens] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState<SearchFilters[]>([]);

    useEffect(() => {
        // Load search history from localStorage
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
            setSearchHistory(JSON.parse(saved));
        }
    }, []);

    const handleSearch = async (filters: SearchFilters) => {
        try {
            setLoading(true);

            const params: any = {};

            if (filters.query) params.search = filters.query;
            if (filters.minAge) params.minAge = filters.minAge;
            if (filters.maxAge) params.maxAge = filters.maxAge;
            if (filters.gender) params.gender = filters.gender;
            if (filters.vulnerabilityLevel) params.vulnerabilityLevel = filters.vulnerabilityLevel;
            if (filters.livingArrangement) params.livingArrangement = filters.livingArrangement;
            if (filters.verificationStatus) params.verificationStatus = filters.verificationStatus;
            if (filters.lastVisitDays) params.lastVisitDays = filters.lastVisitDays;

            const response = await apiClient.getCitizens(params);

            if (response.success) {
                setCitizens(response.data.citizens);

                // Save to search history
                const newHistory = [filters, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
                setSearchHistory(newHistory);
                localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCitizens([]);
    };

    const handleSavedSearch = (filters: SearchFilters) => {
        handleSearch(filters);
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">🔍 Advanced Search</h1>
                    <p className="text-gray-600">Search and filter senior citizens</p>
                </div>

                {/* Search Component */}
                <div className="mb-6">
                    <AdvancedSearch
                        onSearch={handleSearch}
                        onReset={handleReset}
                        loading={loading}
                        resultCount={citizens.length}
                    />
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && citizens.length === 0 && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-3">Recent Searches</h3>
                            <div className="space-y-2">
                                {searchHistory.map((search, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSavedSearch(search)}
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            {search.query && <Badge variant="outline">"{search.query}"</Badge>}
                                            {search.gender && <Badge variant="outline">{search.gender}</Badge>}
                                            {search.vulnerabilityLevel && <Badge variant="outline">{search.vulnerabilityLevel} Risk</Badge>}
                                            {search.minAge && <Badge variant="outline">Age {search.minAge}+</Badge>}
                                            {search.livingArrangement && <Badge variant="outline">{search.livingArrangement}</Badge>}
                                            {!search.query && !search.gender && !search.vulnerabilityLevel && !search.minAge && !search.livingArrangement && (
                                                <Badge variant="outline">Empty Search</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">↻</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-3"
                                onClick={() => {
                                    setSearchHistory([]);
                                    localStorage.removeItem('searchHistory');
                                }}
                            >
                                Clear History
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {citizens.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Search Results ({citizens.length})</h2>
                            <Button variant="outline" size="sm">
                                📥 Export Results
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {citizens.map((citizen) => (
                                <Card
                                    key={citizen.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => router.push(`/citizens/${citizen.id}`)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-lg">{citizen.fullName}</h3>
                                                <p className="text-sm text-gray-600">{citizen.age} years • {citizen.gender}</p>
                                            </div>
                                            <Badge className={
                                                citizen.vulnerabilityLevel === 'High' ? 'bg-red-600' :
                                                    citizen.vulnerabilityLevel === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                                            }>
                                                {citizen.vulnerabilityLevel}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phone:</span>
                                                <span className="font-medium">{citizen.mobileNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {citizen.idVerificationStatus}
                                                </Badge>
                                            </div>
                                            {citizen.livingArrangement && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Living:</span>
                                                    <span className="font-medium">{citizen.livingArrangement}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-gray-500 truncate">{citizen.permanentAddress}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && citizens.length === 0 && searchHistory.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">Start Your Search</p>
                            <p className="text-gray-600">Use the search filters above to find senior citizens</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
