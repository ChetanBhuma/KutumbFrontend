"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    HeartHandshake, 
    ShieldAlert, 
    CheckCircle, 
    Clock, 
    Calendar, 
    Home, 
    Activity, 
    Sliders, 
    Sparkles, 
    FileText, 
    Camera,
    Stethoscope,
    Lock
} from 'lucide-react'

export function WelfareVisitExplorer() {
    // Calculator States
    const [livingStatus, setLivingStatus] = useState<'alone' | 'spouse' | 'family'>('alone')
    const [ageBracket, setAgeBracket] = useState<'60_70' | '71_80' | '80_plus'>('71_80')
    const [mobility, setMobility] = useState<'independent' | 'assisted' | 'bedridden'>('assisted')
    const [familyLocation, setFamilyLocation] = useState<'nearby' | 'abroad'>('abroad')

    // Active Gallery Image Tab
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)

    const galleryItems = [
        {
            title: "Doorstep Welfare Consultation",
            badge: "Personal Touch",
            description: "Beat officers personally visit registered elders to assess mental, emotional, and physical well-being in the comfort of their homes.",
            image: "/citizen-welfare-check-photo.png",
            checklist: ["Mental & emotional well-being check", "Grievance logging & resolution", "Direct contact number sharing"]
        },
        {
            title: "Medical & Emergency Preparedness",
            badge: "Life Essentials",
            description: "Verification of essential prescription supplies, nearest hospital route mapping, and emergency ambulance access validation.",
            image: "/medical-check-documentation-photo.png",
            checklist: ["Prescription inventory check", "Caregiver identity verification", "SOS quick-dial test"]
        },
        {
            title: "Home Security & Access Audit",
            badge: "Crime Prevention",
            description: "Inspection of main door locks, CCTV coverage, window grills, and verification of domestic helps and security guards.",
            image: "/home-condition-check-photo.png",
            checklist: ["Domestic staff police verification", "Lock & sensor inspection", "Senior cyber-safety briefing"]
        }
    ]

    // Calculate score
    const calculateVulnerability = () => {
        let score = 0
        if (livingStatus === 'alone') score += 35
        else if (livingStatus === 'spouse') score += 20
        else score += 5

        if (ageBracket === '80_plus') score += 35
        else if (ageBracket === '71_80') score += 25
        else score += 10

        if (mobility === 'bedridden') score += 35
        else if (mobility === 'assisted') score += 20
        else score += 5

        if (familyLocation === 'abroad') score += 20
        else score += 5

        if (score >= 80) {
            return {
                tier: 'Tier 1 (High Priority)',
                color: 'bg-[#720924] border-rose-500 text-rose-200',
                badgeColor: 'bg-rose-600',
                frequency: 'Weekly Physical Visits + 2x Weekly Welfare Calls',
                score,
                action: 'Assigned to Ward Beat Sub-Inspector for direct supervision'
            }
        } else if (score >= 50) {
            return {
                tier: 'Tier 2 (Moderate Priority)',
                color: 'bg-gradient-to-r from-amber-950/80 to-blue-950/80 border-amber-500/50 text-amber-200',
                badgeColor: 'bg-amber-600',
                frequency: 'Bi-Weekly Physical Visits + Weekly Welfare Calls',
                score,
                action: 'Assigned to Beat Head Constable with fortnightly audit'
            }
        } else {
            return {
                tier: 'Tier 3 (Standard Care)',
                color: 'bg-[#061224] border-blue-500/50 text-blue-200',
                badgeColor: 'bg-[#0F52BA]',
                frequency: 'Monthly Physical Visits + 24/7 SOS Radar Standby',
                score,
                action: 'Regular beat patrol coverage and monthly doorstep check'
            }
        }
    }

    const vulnerability = calculateVulnerability()

    return (
        <section className="py-20 bg-gradient-to-b from-slate-950 via-[#061224] to-slate-900 text-white relative overflow-hidden">
            {/* Ambient lighting */}
            <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#0F52BA]/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#720924]/20 rounded-full blur-[90px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
                        <HeartHandshake className="h-3.5 w-3.5 text-[#D4AF37]" />
                        Proactive Welfare Model
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Doorstep <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-rose-400 bg-clip-text text-transparent">Welfare Visits</span> & Vulnerability Index
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg">
                        Delhi Police uses an algorithmic vulnerability assessment to customize visit frequencies and safeguard our most vulnerable elders.
                    </p>
                </div>

                {/* Main 2-Column Grid: Calculator (Left) & Verified Photo Gallery (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto mb-14">
                    {/* Interactive Vulnerability Calculator (6 cols) */}
                    <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Sliders className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-bold text-base text-white">Vulnerability Score Estimator</h3>
                                </div>
                                <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                                    Live Calculator
                                </Badge>
                            </div>

                            <p className="text-xs text-slate-300 mb-5">
                                Select demographic factors below to see the automated Delhi Police welfare visit frequency:
                            </p>

                            {/* Option 1: Living Status */}
                            <div className="space-y-2 mb-4">
                                <label className="text-xs font-semibold text-slate-300">Living Condition:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'alone', label: 'Living Alone' },
                                        { id: 'spouse', label: 'With Spouse' },
                                        { id: 'family', label: 'With Family' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setLivingStatus(opt.id as any)}
                                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                                livingStatus === opt.id
                                                    ? 'bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white border-blue-400 shadow'
                                                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Option 2: Age Bracket */}
                            <div className="space-y-2 mb-4">
                                <label className="text-xs font-semibold text-slate-300">Age Bracket:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: '60_70', label: '60 - 70 Yrs' },
                                        { id: '71_80', label: '71 - 80 Yrs' },
                                        { id: '80_plus', label: '80+ Yrs' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setAgeBracket(opt.id as any)}
                                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                                ageBracket === opt.id
                                                    ? 'bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white border-blue-400 shadow'
                                                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Option 3: Mobility */}
                            <div className="space-y-2 mb-4">
                                <label className="text-xs font-semibold text-slate-300">Mobility & Health Status:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'independent', label: 'Independent' },
                                        { id: 'assisted', label: 'Assisted Walk' },
                                        { id: 'bedridden', label: 'Bedridden' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setMobility(opt.id as any)}
                                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                                mobility === opt.id
                                                    ? 'bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white border-blue-400 shadow'
                                                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Option 4: Kin Location */}
                            <div className="space-y-2 mb-5">
                                <label className="text-xs font-semibold text-slate-300">Next of Kin Proximity:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'nearby', label: 'Living in Delhi/NCR' },
                                        { id: 'abroad', label: 'Other State / Abroad' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFamilyLocation(opt.id as any)}
                                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                                familyLocation === opt.id
                                                    ? 'bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white border-blue-400 shadow'
                                                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Resulting Tier Card */}
                        <div className={`p-4 rounded-xl border ${vulnerability.color} transition-all duration-300 space-y-2`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className={`${vulnerability.badgeColor} text-white font-bold text-xs`}>
                                        {vulnerability.tier}
                                    </Badge>
                                </div>
                                <span className="text-xs font-mono">Score: {vulnerability.score}/100</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Mandated Protocol: {vulnerability.frequency}
                                </p>
                                <p className="text-[11px] text-slate-300 mt-1">
                                    {vulnerability.action}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Field Inspection Photo Gallery & Checklist (6 cols) */}
                    <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
                        <div>
                            {/* Gallery Header */}
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-[#D4AF37]" />
                                    <h3 className="font-bold text-base text-white">Live Field Welfare Protocols</h3>
                                </div>
                                <Badge className="bg-[#720924] text-white text-xs border-0">
                                    Official SOP
                                </Badge>
                            </div>

                            {/* Gallery Tab Switcher */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                                {galleryItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveGalleryIndex(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                            activeGalleryIndex === idx
                                                ? 'bg-[#0F52BA] text-white shadow'
                                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {item.badge}
                                    </button>
                                ))}
                            </div>

                            {/* Active Image Card with Glassmorphic Overlay */}
                            <div className="relative h-56 rounded-xl overflow-hidden border border-slate-700 shadow-lg group">
                                <img
                                    src={galleryItems[activeGalleryIndex].image}
                                    alt={galleryItems[activeGalleryIndex].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4">
                                    <Badge className="bg-[#D4AF37] text-slate-950 text-[10px] font-bold mb-1">
                                        {galleryItems[activeGalleryIndex].badge}
                                    </Badge>
                                    <h4 className="font-bold text-sm text-white">
                                        {galleryItems[activeGalleryIndex].title}
                                    </h4>
                                    <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                                        {galleryItems[activeGalleryIndex].description}
                                    </p>
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-semibold text-slate-300">Mandatory Verification Checklist:</p>
                                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-300">
                                    {galleryItems[activeGalleryIndex].checklist.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-blue-400" />
                                100% Geo-Tagged & Signed Documentation
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3 Hover-Fill Metric Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    <div className="card-hover-fill p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-700 text-blue-300 card-icon-invert transition-all">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white card-text-invert">1,500+</p>
                                <p className="text-xs text-slate-400 card-subtext-invert">Monthly In-Person Visits</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-hover-fill p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 card-icon-invert transition-all">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white card-text-invert">100%</p>
                                <p className="text-xs text-slate-400 card-subtext-invert">High-Risk Coverage</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-hover-fill p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-700 text-[#D4AF37] card-icon-invert transition-all">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white card-text-invert">24 Police</p>
                                <p className="text-xs text-slate-400 card-subtext-invert">Districts Synchronized</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
