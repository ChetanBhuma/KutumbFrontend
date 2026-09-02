'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Phone, ExternalLink, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface AuthShellProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    badgeIcon?: React.ReactNode;
    headerTitle?: string;
    headerAction?: {
        label: string;
        href: string;
        variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    };
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    showHeader?: boolean;
    showFooter?: boolean;
    cardClassName?: string;
}

export function AuthHeader({
    title = 'Senior Citizen Portal',
    action
}: {
    title?: string;
    action?: { label: string; href: string; variant?: 'default' | 'outline' | 'ghost' | 'secondary' };
}) {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#061224]/90 backdrop-blur-xl shadow-2xl" role="banner">
            <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center justify-between gap-2">
                    {/* Police Logo & Title */}
                    <Link href="/" className="flex items-center gap-2 sm:gap-4 group min-w-0">
                        <div className="h-9 sm:h-14 md:h-16 relative shrink-0" aria-label="Delhi Police Logo">
                            <img
                                src="/delhi-police-logo.png"
                                alt="Delhi Police - Shanti Sewa Nyaya"
                                className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="border-l border-slate-700/80 pl-2 sm:pl-4 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <h1 className="text-xs sm:text-lg md:text-xl font-black tracking-tight text-white truncate">
                                    DELHI POLICE
                                </h1>
                                <span className="text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#720924] text-white border border-rose-500/40 shrink-0">
                                    KUTUMB
                                </span>
                            </div>
                            <p className="hidden sm:block text-[10px] sm:text-xs text-blue-200 font-medium truncate">Senior Citizen Welfare & Safety Portal</p>
                        </div>
                    </Link>

                    {/* Navigation Actions */}
                    <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0" aria-label="Auth Navigation">
                        {action ? (
                            <Link href={action.href}>
                                <Button
                                    variant={action.variant || 'outline'}
                                    className="border-blue-500/50 text-blue-100 bg-blue-950/40 hover:bg-[#0F52BA] hover:text-white transition-all duration-300 shadow text-[11px] sm:text-sm px-2.5 sm:px-4 h-7 sm:h-10 shrink-0"
                                >
                                    {action.label}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                {pathname !== '/citizen-portal/login' && pathname !== '/citizen/login' && (
                                    <Link href="/citizen-portal/login" className="inline-block">
                                        <Button
                                            variant="outline"
                                            className="border-blue-500/50 text-blue-100 bg-blue-950/40 hover:bg-[#0F52BA] hover:text-white transition-all duration-300 shadow text-[11px] sm:text-sm px-2.5 sm:px-4 h-7 sm:h-10 shrink-0"
                                        >
                                            Citizen Login
                                        </Button>
                                    </Link>
                                )}
                                {pathname !== '/admin/login' && (
                                    <Link href="/admin/login">
                                        <Button className="bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:from-[#0F52BA]/90 hover:to-[#720924]/90 text-white font-bold transition-all duration-300 shadow-[0_0_15px_rgba(15,82,186,0.5)] text-[11px] sm:text-sm px-2.5 sm:px-4 h-7 sm:h-10 shrink-0">
                                            Officer Portal
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export function AuthFooter() {
    return (
        <footer className="border-t border-slate-800 bg-[#061224] text-slate-400 py-10 mt-auto relative z-10" role="contentinfo">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Column 1: Police Brand & Mission */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <img src="/delhi-police-logo.png" alt="Delhi Police Crest" className="h-12 w-auto" />
                            <div>
                                <h3 className="text-white font-bold text-sm">Delhi Police Kutumb</h3>
                                <p className="text-[11px] text-blue-300">Senior Citizen Welfare Portal</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Shanti Sewa Nyaya - Committed to the safety, dignity and proactive doorstep welfare of every senior citizen across Delhi.
                        </p>
                        <Badge className="mt-3 text-[10px] bg-blue-950/80 text-blue-300 border-blue-800">
                            Official Delhi Police Initiative
                        </Badge>
                    </div>

                    {/* Column 2: Portals & Services */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-blue-300">
                            Portals & Services
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-400">
                            <li><Link href="/citizen-portal/register" className="hover:text-white transition-colors">Senior Citizen Registration</Link></li>
                            <li><Link href="/citizen-portal/login" className="hover:text-white transition-colors">Citizen Portal Login</Link></li>
                            <li><Link href="/admin/login" className="hover:text-white transition-colors">Officer & Admin Login</Link></li>
                            <li><Link href="/officer-app/login" className="hover:text-white transition-colors">Beat Officer Mobile App</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Compliance & Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-blue-300">
                            Compliance & Legal
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-400">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy & Data Protection Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Public Service</Link></li>
                            <li><Link href="/accessibility" className="hover:text-white transition-colors">GIGW 3.0 Accessibility Statement</Link></li>
                            <li><Link href="/security" className="hover:text-white transition-colors">Security & Encryption Architecture</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: 24/7 Helplines */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-rose-300">
                            24/7 Official Helplines
                        </h4>
                        <div className="space-y-2.5 text-xs">
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-rose-400" />
                                <span>Police Emergency:</span> <strong className="text-white font-mono">112 / 100</strong>
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#D4AF37]" />
                                <span>Senior Citizen Cell:</span> <strong className="text-[#D4AF37] font-mono">1090 / 1291</strong>
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-400" />
                                <span>Cyber Fraud Helpline:</span> <strong className="text-blue-300 font-mono">1930</strong>
                            </p>
                            <p className="text-slate-500 pt-1 text-[11px]">Email: support@delhipolice.gov.in</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                    <p>© 2024-2026 Delhi Police, Government of NCT of Delhi. All rights reserved.</p>
                    <p className="flex items-center gap-2">
                        <span>Designed with GIGW 3.0 & OWASP Compliance</span>
                        <span>•</span>
                        <span className="text-[#D4AF37]">v2.4 Police Edition</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export function AuthShell({
    children,
    title = 'Senior Citizen Portal',
    subtitle = 'Delhi Police - Citizen Access',
    badgeIcon,
    headerTitle,
    headerAction,
    maxWidth = 'md',
    showHeader = true,
    showFooter = true,
    cardClassName = ''
}: AuthShellProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-[#0F52BA] selection:text-white">
            {showHeader && (
                <AuthHeader
                    title={headerTitle || title}
                    action={headerAction}
                />
            )}

            {/* Background Ambient Glows: Royal Blue (#0F52BA) & Wine Red (#720924) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#0F52BA]/15 blur-[120px] animate-pulse-soft" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#720924]/15 blur-[130px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] right-[25%] w-[350px] h-[350px] rounded-full bg-[#D4AF37]/5 blur-[100px] animate-pulse-soft" style={{ animationDelay: '4s' }} />
            </div>

            {/* Main Content Container */}
            <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 relative z-10 my-auto">
                <div className={`w-full ${maxWidthClasses[maxWidth]} space-y-4 sm:space-y-6 animate-fade-in`}>
                    {/* Header Emblem & Title */}
                    <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3.5">
                        <div className="bg-gradient-to-b from-slate-900 to-[#061224] p-3 sm:p-4 rounded-full shadow-[0_0_25px_rgba(15,82,186,0.35)] border border-slate-700/80 animate-float text-blue-400">
                            {badgeIcon || <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-[#0F52BA]" />}
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                                <span className="bg-gradient-to-r from-blue-200 via-white to-rose-200 bg-clip-text text-transparent">
                                    {title}
                                </span>
                            </h2>
                            {subtitle && (
                                <p className="text-slate-400 mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-medium">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Children / Form card content */}
                    <div className={cardClassName}>
                        {children}
                    </div>
                </div>
            </main>

            {showFooter && <AuthFooter />}
        </div>
    );
}

export default AuthShell;
