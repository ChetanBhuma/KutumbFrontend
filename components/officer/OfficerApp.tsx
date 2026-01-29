'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Map, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import OfficerDashboardView from '@/components/officer/OfficerDashboardView';
import OfficerMapView from '@/components/officer/OfficerMapView';
import OfficerVisitsView from '@/components/officer/OfficerVisitsView';
import OfficerProfileView from '@/components/officer/OfficerProfileView';
import VisitDetailView from '@/components/officer/VisitDetailView';

export default function OfficerApp() {
    const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'visits' | 'profile'>('dashboard');
    const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

    const handleNavigate = (view: 'dashboard' | 'map' | 'visits' | 'profile') => {
        setCurrentView(view);
        setSelectedVisitId(null);
    };

    const handleVisitSelect = (visitId: string) => {
        setSelectedVisitId(visitId);
    };

    const handleBackToVisits = () => {
        setSelectedVisitId(null);
        setCurrentView('visits');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-1 pb-20 overflow-y-auto">
                {selectedVisitId ? (
                    <VisitDetailView visitId={selectedVisitId} onBack={handleBackToVisits} />
                ) : (
                    <>
                        {currentView === 'dashboard' && <OfficerDashboardView onNavigate={handleNavigate} />}
                        {currentView === 'map' && <OfficerMapView />}
                        {currentView === 'visits' && <OfficerVisitsView onVisitSelect={handleVisitSelect} />}
                        {currentView === 'profile' && <OfficerProfileView />}
                    </>
                )}
            </main>

            {!selectedVisitId && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
                    <div className="flex justify-around items-center h-16">
                        <NavButton
                            icon={LayoutDashboard}
                            label="Home"
                            isActive={currentView === 'dashboard'}
                            onClick={() => handleNavigate('dashboard')}
                        />
                        <NavButton
                            icon={Map}
                            label="Map"
                            isActive={currentView === 'map'}
                            onClick={() => handleNavigate('map')}
                        />
                        <NavButton
                            icon={ClipboardList}
                            label="Visits"
                            isActive={currentView === 'visits'}
                            onClick={() => handleNavigate('visits')}
                        />
                        <NavButton
                            icon={User}
                            label="Profile"
                            isActive={currentView === 'profile'}
                            onClick={() => handleNavigate('profile')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function NavButton({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
        >
            <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
