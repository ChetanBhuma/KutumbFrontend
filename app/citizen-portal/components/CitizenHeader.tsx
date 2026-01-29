'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CitizenHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if citizen token exists (not admin token)
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsLoggedIn(false);
                return;
            }

            // Verify token is valid by making a quick API call
            try {
                await apiClient.getMyProfile();
                setIsLoggedIn(true);
            } catch (error) {
                // Token is invalid/expired - clear it
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setIsLoggedIn(false);
            }
        };

        checkAuth();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            // Clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            apiClient.clearTokens();
            setIsLoggedIn(false);
            router.push('/citizen-portal/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const navItems = [
        { href: '/citizen-portal/dashboard', label: 'Dashboard' },
        { href: '/citizen-portal/profile', label: 'Profile' },
        { href: '/citizen-portal/visits', label: 'Visits' },
        { href: '/citizen-portal/documents', label: 'Documents' },
    ];

    // Show minimal header for public/auth pages
    const isPublicPage = pathname === '/citizen-portal/login'
        || pathname === '/citizen-portal/signup'
        || pathname === '/citizen-portal/register';

    if (isPublicPage) {
        return (
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href="/citizen-portal">
                        <p className="text-sm uppercase tracking-widest text-blue-600">Delhi Police · Kutumb</p>
                        <h1 className="text-xl font-semibold text-slate-800">Senior Citizen Portal</h1>
                    </Link>
                    {pathname === '/citizen-portal/register' && (
                        <Link href="/citizen-portal/login">
                            <Button variant="outline">Already Registered? Login</Button>
                        </Link>
                    )}
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-8">
                    <Link href="/citizen-portal">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-blue-600">Delhi Police</p>
                            <h1 className="text-lg font-bold text-slate-800">Kutumb</h1>
                        </div>
                    </Link>

                    {isLoggedIn && (
                        <nav className="hidden md:flex items-center gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === item.href ? 'text-blue-600' : 'text-slate-600'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <Button variant="destructive" size="sm" asChild className="hidden md:inline-flex">
                                <Link href="/citizen-portal/sos">SOS Alert</Link>
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You will be logged out of your account.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Mobile Menu */}
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild className="md:hidden">
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right">
                                    <div className="flex flex-col gap-6 pt-10">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`text-lg font-medium ${pathname === item.href ? 'text-blue-600' : 'text-slate-600'
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                        <div className="border-t pt-6 flex flex-col gap-3">
                                            <Button variant="destructive" asChild className="w-full">
                                                <Link href="/citizen-portal/sos">Emergency SOS</Link>
                                            </Button>
                                            <Button variant="outline" onClick={handleLogout} className="w-full">
                                                Logout
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/citizen-portal/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/citizen-portal/register">Register</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
