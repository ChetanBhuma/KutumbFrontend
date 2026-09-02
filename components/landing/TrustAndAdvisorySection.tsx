"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Star, 
    ShieldCheck, 
    Volume2, 
    VolumeX, 
    ChevronRight, 
    ChevronLeft, 
    AlertTriangle, 
    Lock, 
    Phone, 
    HelpCircle, 
    Quote, 
    CheckCircle2,
    Headphones
} from 'lucide-react'

export function TrustAndAdvisorySection() {
    const [activeTestimonial, setActiveTestimonial] = useState(0)
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)
    const [openAdvisoryIndex, setOpenAdvisoryIndex] = useState<number | null>(0)

    const testimonials = [
        {
            name: "Mrs. Kamla Devi",
            age: 72,
            location: "Connaught Place, Ward 14",
            text: "Living alone after my husband passed was frightening. When Constable Manoj Verma came for the first welfare check and gave me his direct number, all my anxiety vanished. The Kutumb SOS button gives me true peace of mind.",
            rating: 5,
            photo: "/indian-woman-profile-photo.png",
            verifiedBy: "Ct. Manoj Verma (Beat #3)"
        },
        {
            name: "Mr. Rajesh Kumar",
            age: 68,
            location: "Rohini, Sector 14",
            text: "The beat officers helped verify our domestic helper within 24 hours. When I had a medical panic late at night, the PCR van reached my gate in under 4 minutes. Delhi Police has become our extended family.",
            rating: 5,
            photo: "/indian-man-profile-photo.png",
            verifiedBy: "Insp. Naresh Khatri (SHO)"
        },
        {
            name: "Mrs. Sunita Sharma",
            age: 75,
            location: "Dwarka, Sector 9",
            text: "The digital ID card with my medical details is brilliant. My daughter in the UK receives instant notifications whenever the beat officer visits me. Exceptional governance and care.",
            rating: 5,
            photo: "/indian-muslim-man-profile-photo.png",
            verifiedBy: "Ct. Deepak Rathi (Beat #7)"
        }
    ]

    const cyberAdvisories = [
        {
            title: "Beware of 'Digital Arrest' & Fake Police Video Calls",
            badge: "Critical Alert",
            desc: "Delhi Police NEVER conducts interrogations or demands money over WhatsApp video calls or Skype. If anyone claims you are under 'Digital Arrest', disconnect immediately and call 1930 / 112.",
            icon: AlertTriangle
        },
        {
            title: "Pension & Electricity Bill APK Frauds",
            badge: "Financial Safety",
            desc: "Never click on SMS links threatening power disconnection or demanding pension KYC update via third-party APK downloads. Official services never ask for remote screen sharing.",
            icon: Lock
        },
        {
            title: "Doorstep Police & Domestic Help Verification",
            badge: "Physical Safety",
            desc: "Always ask the visiting beat officer to show their Kutumb Digital Verification Badge or dial 112 to confirm their dispatch. Register all household domestic staff free on the portal.",
            icon: ShieldCheck
        }
    ]

    return (
        <section className="py-12 sm:py-20 bg-gradient-to-b from-slate-900 via-[#061224] to-slate-950 text-white relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#0F52BA]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#720924]/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Community Trust & Cyber Shield
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4">
                        Voice of <span className="bg-gradient-to-r from-blue-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">Our Elders</span> & Police Advisory
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base md:text-lg">
                        Hear authentic experiences from senior citizens protected under the Kutumb initiative, and stay vigilant against modern cyber threats.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto mb-10 sm:mb-14">
                    {/* Testimonial Showcase with Card Hover Fill (7 cols) */}
                    <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-5 sm:p-8 border border-slate-800 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 text-white/5 pointer-events-none">
                            <Quote className="w-36 h-36 sm:w-48 sm:h-48" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 sm:mb-6 border-b border-slate-800">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[#D4AF37] text-[#D4AF37]" />
                                    ))}
                                    <span className="text-[11px] sm:text-xs font-bold text-amber-300 ml-1.5 sm:ml-2">5.0 Official Rating</span>
                                </div>
                                <Badge className="bg-[#0F52BA] text-white text-[11px] sm:text-xs border-0">
                                    Verified Citizen Voice
                                </Badge>
                            </div>

                            {/* Active Quote */}
                            <blockquote className="text-sm sm:text-base md:text-lg text-slate-200 italic leading-relaxed mb-5 sm:mb-6">
                                "{testimonials[activeTestimonial].text}"
                            </blockquote>

                            {/* Citizen Info & Verification Badge */}
                            <div className="flex items-center gap-3 sm:gap-4 pt-4 border-t border-slate-800">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#D4AF37] overflow-hidden shadow-lg shrink-0">
                                    <img
                                        src={testimonials[activeTestimonial].photo}
                                        alt={testimonials[activeTestimonial].name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm sm:text-base text-white truncate">{testimonials[activeTestimonial].name} ({testimonials[activeTestimonial].age}y)</h4>
                                    <p className="text-xs text-slate-400 truncate">{testimonials[activeTestimonial].location}</p>
                                    <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
                                        <CheckCircle2 className="w-3 h-3 shrink-0" /> Audited by: {testimonials[activeTestimonial].verifiedBy}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-5 sm:mt-6 pt-4 border-t border-slate-800">
                            <div className="flex gap-1.5 sm:gap-2">
                                {testimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveTestimonial(idx)}
                                        className={`h-2.5 rounded-full transition-all ${
                                            activeTestimonial === idx ? 'w-6 sm:w-8 bg-[#D4AF37]' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                                        }`}
                                        aria-label={`Slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all"
                                    aria-label="Previous testimonial"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
                                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all"
                                    aria-label="Next testimonial"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Police Cyber Advisory Accordion (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                                Senior Cyber Shield
                            </h3>
                            <Badge className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                                Anti-Scam Guide
                            </Badge>
                        </div>

                        {cyberAdvisories.map((advisory, idx) => {
                            const Icon = advisory.icon
                            const isOpen = openAdvisoryIndex === idx
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setOpenAdvisoryIndex(isOpen ? null : idx)}
                                    className={`card-hover-fill p-3.5 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                                        isOpen
                                            ? 'bg-slate-900 border-rose-500/50 shadow-lg'
                                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/60 card-icon-invert shrink-0">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-bold text-xs sm:text-sm text-white card-text-invert leading-snug">
                                                {advisory.title}
                                            </h4>
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed card-subtext-invert animate-fade-in">
                                            {advisory.desc}
                                        </p>
                                    )}
                                </div>
                            )
                        })}

                        {/* Cyber Helpline Banner */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#0F52BA]/30 to-[#720924]/30 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div>
                                <p className="font-bold text-white text-xs sm:text-sm">Cyber Fraud Immediate Helpline</p>
                                <p className="text-slate-300 text-[11px]">Dial 1930 to freeze fraudulent transactions</p>
                            </div>
                            <Button size="sm" className="bg-[#720924] hover:bg-[#881337] text-white font-mono font-bold h-8 shrink-0 w-full sm:w-auto">
                                <Phone className="w-3.5 h-3.5 mr-1" /> 1930
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 24/7 Official Delhi Police Helpline Bar */}
                <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-r from-[#061224] via-[#0F3274] to-[#720924] p-4 sm:p-6 border-2 border-[#D4AF37]/50 shadow-2xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
                        <div className="border-r border-white/10 pr-2">
                            <p className="text-[11px] sm:text-xs text-blue-200 font-medium">Police Emergency</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-0.5 sm:mt-1 font-mono">112 / 100</p>
                            <p className="text-[10px] text-emerald-300 font-medium">Toll Free 24/7</p>
                        </div>
                        <div className="border-r-0 md:border-r border-white/10 pr-0 md:pr-2">
                            <p className="text-[11px] sm:text-xs text-blue-200 font-medium">Senior Citizen Cell</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#D4AF37] mt-0.5 sm:mt-1 font-mono">1090 / 1291</p>
                            <p className="text-[10px] text-amber-200 font-medium">Dedicated Elders Line</p>
                        </div>
                        <div className="border-r border-white/10 pr-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                            <p className="text-[11px] sm:text-xs text-blue-200 font-medium">Cyber Crime Helpline</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-black text-rose-300 mt-0.5 sm:mt-1 font-mono">1930</p>
                            <p className="text-[10px] text-rose-200 font-medium">Online Financial Fraud</p>
                        </div>
                        <div className="pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                            <p className="text-[11px] sm:text-xs text-blue-200 font-medium">Medical Ambulance</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-300 mt-0.5 sm:mt-1 font-mono">102 / 108</p>
                            <p className="text-[10px] text-emerald-200 font-medium">Emergency Healthcare</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
