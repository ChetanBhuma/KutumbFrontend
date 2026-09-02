"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Phone,
    MapPin,
    Heart,
    ArrowRight,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { TrustAndAdvisorySection } from '@/components/landing/TrustAndAdvisorySection'

export default function LandingPage() {
    const [activeSlide, setActiveSlide] = useState(0)
    const [stats, setStats] = useState({
        citizens: 0,
        stations: 0,
        visits: 0,
        response: 0
    })

    const slides = [
        {
            image: '/Banner Image.png',
            tag: 'Delhi Police Kutumb',
            title: 'Protecting Our Elders With Dignity, Care & Rapid Response',
            subtitle: 'A unified digital lifeline connecting elderly residents directly with dedicated Delhi Police Beat Officers for regular doorstep welfare audits and instant emergency assistance.'
        },
        {
            image: '/banner_img_2.png',
            tag: 'Cyber Defense',
            title: 'Senior Cyber Safety & Fraud Shield',
            subtitle: 'Proactive protection against digital arrest frauds, fake pension KYC scams, and predatory online threats.'
        },
        {
            image: '/banner_img_3.png',
            tag: '24/7 Rapid Response',
            title: 'Instant 1-Touch SOS Emergency Response',
            subtitle: 'Sub-5 minute emergency response with real-time GPS telemetry and instant PCR van dispatch across Delhi.'
        }
    ]

    // Auto-rotate hero background slider
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length)
        }, 6500)
        return () => clearInterval(timer)
    }, [slides.length])

    const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length)
    const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)

    // Animated counter effect
    useEffect(() => {
        const targetStats = {
            citizens: 12847,
            stations: 24,
            visits: 1520,
            response: 5
        }

        const duration = 1800
        const steps = 50
        const increment = {
            citizens: targetStats.citizens / steps,
            stations: targetStats.stations / steps,
            visits: targetStats.visits / steps,
            response: targetStats.response / steps
        }

        let currentStep = 0
        const timer = setInterval(() => {
            if (currentStep < steps) {
                setStats({
                    citizens: Math.floor(increment.citizens * currentStep),
                    stations: Math.floor(increment.stations * currentStep),
                    visits: Math.floor(increment.visits * currentStep),
                    response: Math.floor(increment.response * currentStep)
                })
                currentStep++
            } else {
                setStats(targetStats)
                clearInterval(timer)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-[#0F52BA] selection:text-white">
            {/* 1. Header with Delhi Police Branding & Royal Blue / Wine Red Insignia */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#061224]/90 backdrop-blur-xl shadow-2xl" role="banner">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Police Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div className="h-14 md:h-16 relative group" aria-label="Delhi Police Logo">
                                <img
                                    src="/delhi-police-logo.png"
                                    alt="Delhi Police - Shanti Sewa Nyaya"
                                    className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="hidden sm:block border-l border-slate-700/80 pl-4">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                                        DELHI POLICE
                                    </h1>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#720924] text-white border border-rose-500/40">
                                        KUTUMB
                                    </span>
                                </div>
                                <p className="text-xs text-blue-200 font-medium">Senior Citizen Welfare & Safety Portal</p>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main Navigation">
                            <Link href="/citizen-portal/login" aria-label="Login to Citizen Portal">
                                <Button
                                    variant="outline"
                                    className="border-blue-500/50 text-blue-100 bg-blue-950/40 hover:bg-[#0F52BA] hover:text-white transition-all duration-300 shadow text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
                                >
                                    Citizen Login
                                </Button>
                            </Link>
                            <Link href="/admin/login" aria-label="Login to Admin & Officer Portal">
                                <Button className="bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:from-[#0F52BA]/90 hover:to-[#720924]/90 text-white font-bold transition-all duration-300 shadow-[0_0_15px_rgba(15,82,186,0.5)] text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10">
                                    Officer Portal
                                </Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* 2. Simple & Clean Banner Slider */}
            <section className="relative w-full aspect-[2076/758] overflow-hidden bg-slate-950 group" aria-label="Banner Slider">
                {/* Slider Images */}
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === activeSlide
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-105 pointer-events-none'
                            }`}
                    >
                        <img
                            src={slide.image}
                            alt={`Delhi Police Banner ${index + 1}`}
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                ))}

                {/* Slider Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 bg-slate-950/60 hover:bg-[#0F52BA] text-white p-1.5 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/20 shadow-xl backdrop-blur-sm"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 bg-slate-950/60 hover:bg-[#0F52BA] text-white p-1.5 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/20 shadow-xl backdrop-blur-sm"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                </button>

                {/* Slider Dots Indicator */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-20 bg-slate-950/50 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full border border-white/10">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className={`transition-all duration-300 rounded-full ${index === activeSlide
                                ? 'bg-[#D4AF37] w-4 sm:w-7 h-1.5 sm:h-2.5 shadow-lg'
                                : 'bg-white/50 hover:bg-white/80 w-1.5 sm:w-2.5 h-1.5 sm:h-2.5'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* 4. Animated Police Metrics Section */}
            <section className="py-10 sm:py-14 bg-gradient-to-r from-[#061224] via-[#0F3274] to-[#720924] text-white relative overflow-hidden border-y border-white/10">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
                        <div className="group p-3 sm:p-4 rounded-xl bg-slate-950/40 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50 transition-all">
                            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 text-blue-300 mb-2 group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{stats.citizens.toLocaleString()}+</div>
                            <p className="text-[11px] sm:text-xs text-blue-200 mt-1 font-medium">Registered Senior Citizens</p>
                        </div>

                        <div className="group p-3 sm:p-4 rounded-xl bg-slate-950/40 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50 transition-all">
                            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-500/20 text-rose-300 mb-2 group-hover:scale-110 transition-transform">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{stats.stations} Police</div>
                            <p className="text-[11px] sm:text-xs text-blue-200 mt-1 font-medium">Districts & Sub-Divisions</p>
                        </div>

                        <div className="group p-3 sm:p-4 rounded-xl bg-slate-950/40 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50 transition-all">
                            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform">
                                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{stats.visits.toLocaleString()}+</div>
                            <p className="text-[11px] sm:text-xs text-blue-200 mt-1 font-medium">Monthly Physical Visits</p>
                        </div>

                        <div className="group p-3 sm:p-4 rounded-xl bg-slate-950/40 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50 transition-all">
                            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 text-emerald-300 mb-2 group-hover:scale-110 transition-transform">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">&lt; {stats.response} Mins</div>
                            <p className="text-[11px] sm:text-xs text-blue-200 mt-1 font-medium">Emergency Response Time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Section: Community Trust, Testimonials & Cyber Advisory */}
            <TrustAndAdvisorySection />

            {/* 10. Call to Action Section with Police Insignia */}
            <section className="py-14 sm:py-20 bg-gradient-to-r from-[#061224] via-[#0F3274] to-[#720924] text-white relative overflow-hidden border-t border-white/15">
                <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
                    <Badge className="bg-[#D4AF37] text-slate-950 font-bold mb-4 text-xs sm:text-sm">
                        Zero Registration Fee • Direct Police Protection
                    </Badge>
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 sm:mb-6 tracking-tight">
                        Enroll Your Senior Family Members Today
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-blue-100 max-w-2xl mx-auto mb-6 sm:mb-8">
                        Join over 12,000 senior citizens across Delhi who experience peace of mind with regular doorstep visits and 24/7 emergency police support.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md sm:max-w-none mx-auto">
                        <Link href="/citizen-portal/register" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#0F52BA]" />
                                Register Now - It's Free
                                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-[#720924]" />
                            </Button>
                        </Link>
                        <Link href="/citizen-portal/login" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto border-2 border-white/60 bg-slate-900/60 hover:bg-white text-white hover:text-slate-950 font-extrabold text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-xl transition-all duration-300 shadow-xl backdrop-blur-sm">
                                Existing Citizen Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 11. Official Delhi Police Footer */}
            <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800" role="contentinfo">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        {/* Column 1: Police Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img src="/delhi-police-logo.png" alt="Delhi Police" className="h-12 w-auto" />
                                <div>
                                    <h4 className="text-white font-extrabold text-base">Delhi Police</h4>
                                    <p className="text-xs text-[#D4AF37]">Shanti • Sewa • Nyaya</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Official Senior Citizen Welfare Portal (Kutumb) under the direct supervision of Delhi Police Headquarters, Dedicated Nodal Cell for Elder Safety.
                            </p>
                            <div className="text-xs text-slate-400">
                                📍 MSO Building, Indraprastha Marg, New Delhi - 110002
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-blue-300">
                                Portals & Services
                            </h4>
                            <ul className="space-y-2.5 text-xs text-slate-400">
                                <li><Link href="/citizen-portal/register" className="hover:text-white transition-colors">Citizen Registration</Link></li>
                                <li><Link href="/citizen-portal/login" className="hover:text-white transition-colors">Citizen Portal Login</Link></li>
                                <li><Link href="/admin/login" className="hover:text-white transition-colors">Officer & Admin Login</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Governance & Policies */}
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
                                    Police Emergency: <strong className="text-white font-mono">112 / 100</strong>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-[#D4AF37]" />
                                    Senior Citizen Cell: <strong className="text-[#D4AF37] font-mono">1090 / 1291</strong>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-400" />
                                    Cyber Fraud Helpline: <strong className="text-blue-300 font-mono">1930</strong>
                                </p>
                                <p className="text-slate-500 pt-2 text-[11px]">Email: support@delhipolice.gov.in</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                        <p>© 2024-2026 Delhi Police, Government of NCT of Delhi. All rights reserved.</p>
                        <p className="flex items-center gap-2">
                            <span>Designed with GIGW 3.0 & OWASP Compliance</span>
                            <span>•</span>
                            <span className="text-[#D4AF37]">v2.4 Police Edition</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
