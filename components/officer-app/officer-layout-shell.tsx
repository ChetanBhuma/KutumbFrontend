'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Menu,
    Home,
    Users,
    MapPin,
    Calendar,
    User,
    LogOut,
    Shield,
    ChevronRight
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface OfficerLayoutShellProps {
    children: React.ReactNode;
}

export default function OfficerLayoutShell({ children }: OfficerLayoutShellProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [officerName, setOfficerName] = useState('Officer');
    const [officerRank, setOfficerRank] = useState('Beat Officer');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userStr = localStorage.getItem('kutumb-app-user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.officerProfile?.name) {
                        setOfficerName(user.officerProfile.name);
                        setOfficerRank(user.officerProfile.rank || 'Beat Officer');
                    }
                }
            } catch (e) { }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        apiClient.clearTokens();
        router.push('/officer-app/login');
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setOpen(false);
    };

    const navItems = [
        { label: 'Dashboard', icon: Home, path: '/officer-app/dashboard' },
        { label: 'My Beat Citizens', icon: Users, path: '/officer-app/citizens' },
        { label: 'Nearby Citizens', icon: MapPin, path: '/officer-app/nearby' },
        { label: 'Visit History', icon: Calendar, path: '/officer-app/visits/history' },
        { label: 'My Profile', icon: User, path: '/officer-app/profile' },
    ];

    const isLoginPage = pathname === '/officer-app/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar - Matching Main Theme Primary Color */}
            <header className="bg-primary text-primary-foreground px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[320px] p-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
                            <SheetHeader>
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            </SheetHeader>
                            {/* Sidebar Header Style */}
                            <div className="p-4 border-b border-sidebar-border bg-[#001f3f] text-white">
                                <div className="flex items-center gap-2 mb-4">
                                    <img
                                        src="/delhi-police-logo.png"
                                        alt="Delhi Police"
                                        className="h-10 w-auto object-contain bg-white rounded-full p-0.5"
                                    />
                                    <div>
                                        <h2 className="font-bold text-sm tracking-wide">DELHI POLICE</h2>
                                        <p className="text-[10px] opacity-80 uppercase tracking-wider">Shanti Sewa Nyaya</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                    <Avatar className="h-10 w-10 border-2 border-white/20">
                                        <AvatarFallback className="bg-primary text-white font-bold">
                                            {officerName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{officerName}</p>
                                        <p className="text-xs opacity-70 truncate">{officerRank}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Items */}
                            <ScrollArea className="flex-1 py-4">
                                <div className="px-3 space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.path;
                                        return (
                                            <Button
                                                key={item.path}
                                                variant={isActive ? 'default' : 'ghost'}
                                                className={cn(
                                                    "w-full justify-start gap-3 h-11 text-base font-medium transition-all duration-200",
                                                    isActive
                                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                                                )}
                                                onClick={() => handleNavigation(item.path)}
                                            >
                                                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
                                                {item.label}
                                                {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                            {/* Footer */}
                            <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </Button>
                                <div className="mt-4 text-center">
                                    <p className="text-[10px] text-muted-foreground">App Version 1.0.0</p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <div className="flex flex-col">
                        <h1 className="font-semibold text-base leading-none tracking-tight">Kutumb Officer</h1>
                        <p className="text-[10px] opacity-80 font-light">Senior Citizen Safety</p>
                    </div>
                </div>

                <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <Shield className="h-4 w-4" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative">
                {children}
            </main>
        </div>
    );
}
