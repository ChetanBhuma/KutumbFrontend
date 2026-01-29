'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Search,
    MapPin,
    Phone,
    Loader2,
    User,
    RefreshCw,
    Filter,
    MoreVertical,
    List,
    Map
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MapComponent from '@/components/MapComponent';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function MyBeatCitizensPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [citizens, setCitizens] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [view, setView] = useState<'list' | 'map'>('list');

    const fetchCitizens = async (reset = false) => {
        try {
            if (reset) setLoading(true);
            const currentPage = reset ? 1 : page;
            const res = await apiClient.getMyBeatCitizens({
                page: currentPage,
                limit: 20,
                search: search || undefined
            });

            if (res.success) {
                if (reset) {
                    setCitizens(res.data.citizens);
                } else {
                    setCitizens(prev => [...prev, ...res.data.citizens]);
                }
                setHasMore(res.data.pagination.page < res.data.pagination.totalPages);
                if (!reset) setPage(currentPage + 1);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch citizens",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCitizens(true);
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [search]);

    const getVulnerabilityColor = (level: string) => {
        switch (level) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <ProtectedRoute permissionCode="citizens.read">
            <div className="min-h-screen bg-slate-50/50 pb-20">
                {/* Header & Search */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b shadow-sm">
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">My Beat Citizens</h1>
                                <p className="text-xs text-muted-foreground">Manage citizens in your assigned beat</p>
                            </div>
                            <Button size="icon" variant="ghost" className="hover:bg-slate-100 rounded-full" onClick={() => fetchCitizens(true)}>
                                <RefreshCw className={`h-5 w-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or phone..."
                                    className="pl-9 bg-slate-100 border-slate-200 focus:bg-white transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="px-4 py-2 bg-white/50 border-t flex justify-center">
                        <div className="bg-slate-100 p-1 rounded-lg flex w-full max-w-xs">
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-slate-900'}`}
                                onClick={() => setView('list')}
                            >
                                <List className="h-4 w-4" /> List
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'map' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-slate-900'}`}
                                onClick={() => setView('map')}
                            >
                                <Map className="h-4 w-4" /> Map
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 relative">
                    {view === 'list' ? (
                        <div className="p-4 space-y-3">
                            {citizens.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <User className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No citizens found</h3>
                                    <p className="text-sm">Try adjusting your search criteria</p>
                                </div>
                            ) : (
                                citizens.map((citizen) => (
                                    <Card key={citizen.id} className="group overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]" onClick={() => router.push(`/officer-app/citizens/${citizen.id}`)}>
                                        <CardContent className="p-0">
                                            <div className="p-4 flex gap-4">
                                                <Avatar className="h-14 w-14 border-2 border-white shadow-sm shrink-0">
                                                    <AvatarImage src={citizen.photoUrl} alt={citizen.fullName} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold text-lg">
                                                        {citizen.fullName?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-semibold text-base text-slate-900 truncate pr-2">{citizen.fullName}</h3>
                                                        <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0.5 font-medium ${getVulnerabilityColor(citizen.vulnerabilityLevel)}`}>
                                                            {citizen.vulnerabilityLevel || 'Low'}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-1 space-y-1">
                                                        <p className="flex items-start gap-1.5 text-xs text-muted-foreground line-clamp-2">
                                                            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                                            {citizen.permanentAddress}
                                                        </p>
                                                        <p className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                            <Phone className="h-3 w-3 shrink-0" />
                                                            {citizen.mobileNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 bg-slate-50/50 p-2 flex gap-2">
                                                <Button
                                                    className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-9 text-xs"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `tel:${citizen.mobileNumber}`;
                                                    }}
                                                >
                                                    <Phone className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                                                    Call
                                                </Button>
                                                <Button className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow">
                                                    View Profile
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}

                            {loading && (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            )}

                            {hasMore && !loading && (
                                <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => { setPage(p => p + 1); fetchCitizens(); }}>
                                    Load More
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="h-[calc(100vh-200px)] w-full">
                            <MapComponent
                                height="100%"
                                markers={citizens
                                    .filter(c => c.gpsLatitude && c.gpsLongitude)
                                    .map(c => ({
                                        position: { lat: c.gpsLatitude, lng: c.gpsLongitude },
                                        title: c.fullName,
                                        label: c.vulnerabilityLevel?.charAt(0) || 'L',
                                        onClick: () => router.push(`/officer-app/citizens/${c.id}`)
                                    }))
                                }
                                center={citizens.find(c => c.gpsLatitude)?.gpsLatitude ? { lat: citizens.find(c => c.gpsLatitude).gpsLatitude, lng: citizens.find(c => c.gpsLongitude).gpsLongitude } : undefined}
                            />
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
