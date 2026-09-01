"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Smartphone, 
    Tablet, 
    Monitor, 
    CreditCard, 
    Shield, 
    AlertTriangle, 
    CheckCircle2, 
    MapPin, 
    Phone, 
    Activity, 
    Radio, 
    QrCode, 
    UserCheck, 
    Navigation, 
    Flame,
    Sparkles,
    Info
} from 'lucide-react'

type TabType = 'citizen-app' | 'officer-tablet' | 'control-room' | 'digital-id'

interface Hotspot {
    id: string
    x: number // percentage
    y: number // percentage
    title: string
    desc: string
    tag: string
}

export function InteractiveDeviceMockups() {
    const [activeTab, setActiveTab] = useState<TabType>('citizen-app')
    const [activeHotspot, setActiveHotspot] = useState<string | null>('sos-btn')

    const tabs = [
        {
            id: 'citizen-app' as TabType,
            label: 'Citizen Web App',
            icon: Smartphone,
            badge: 'Senior Friendly',
            desc: 'High-contrast, 1-touch SOS & welfare portal for elders'
        },
        {
            id: 'officer-tablet' as TabType,
            label: 'Beat Officer App',
            icon: Tablet,
            badge: 'Patrol Active',
            desc: 'Geo-verified welfare check-in & home audits'
        },
        {
            id: 'control-room' as TabType,
            label: 'Police Command Hub',
            icon: Monitor,
            badge: 'GIS Live',
            desc: 'Real-time dispatch radar & vulnerability analytics'
        },
        {
            id: 'digital-id' as TabType,
            label: 'Digital Senior ID',
            icon: CreditCard,
            badge: 'Official QR',
            desc: 'Instant biometric & police verified emergency ID'
        }
    ]

    const hotspots: Record<TabType, Hotspot[]> = {
        'citizen-app': [
            {
                id: 'sos-btn',
                x: 50,
                y: 78,
                title: 'One-Touch Emergency SOS',
                desc: 'Instantly transmits live GPS coordinates to Delhi Police Control Room & sends SMS alerts to registered family members within 3 seconds.',
                tag: 'Life Safety'
            },
            {
                id: 'health-badge',
                x: 75,
                y: 28,
                title: 'Medical & Mobility Profile',
                desc: 'Displays blood group, vital prescriptions, and emergency contacts accessible only by authorized police officers.',
                tag: 'Health'
            },
            {
                id: 'beat-officer',
                x: 25,
                y: 45,
                title: 'Assigned Beat Officer Badge',
                desc: 'Direct line to your local ward beat constable with photograph, badge number, and scheduled visit date.',
                tag: 'Community Care'
            }
        ],
        'officer-tablet': [
            {
                id: 'geo-verify',
                x: 80,
                y: 32,
                title: 'GPS Geo-Fenced Check-In',
                desc: 'Officers must be within 50 meters of the senior citizen residence to check in, ensuring 100% genuine physical visits.',
                tag: 'Accountability'
            },
            {
                id: 'home-audit',
                x: 30,
                y: 60,
                title: 'Safety & Vulnerability Checklist',
                desc: 'Comprehensive check covering CCTV functioning, door lock strength, domestic help verification, and medicine supply.',
                tag: 'Prevention'
            },
            {
                id: 'voice-notes',
                x: 65,
                y: 82,
                title: 'Voice-to-Text Welfare Log',
                desc: 'Quick verbal log of elder concerns transcribed automatically into the police central dossier.',
                tag: 'AI Powered'
            }
        ],
        'control-room': [
            {
                id: 'gis-radar',
                x: 48,
                y: 42,
                title: 'GIS Vulnerability Density Heatmap',
                desc: 'Visualizes high-risk isolated seniors across all 15 police districts for proactive patrol routing.',
                tag: 'Command'
            },
            {
                id: 'pcr-dispatch',
                x: 82,
                y: 68,
                title: 'Automated PCR Van Routing',
                desc: 'Calculates nearest police response vehicle with live telemetry and turn-by-turn navigation.',
                tag: 'Response'
            }
        ],
        'digital-id': [
            {
                id: 'qr-verify',
                x: 78,
                y: 70,
                title: 'Cryptographic QR Verification',
                desc: 'Scannable by any police official or hospital scanner to retrieve authenticated emergency contacts and medical data.',
                tag: 'Verified'
            },
            {
                id: 'blood-group',
                x: 28,
                y: 35,
                title: 'Official Police Seal & Identity',
                desc: 'Issued under the authority of Delhi Police with unique Senior ID and local police station jurisdiction.',
                tag: 'Official'
            }
        ]
    }

    return (
        <section className="py-20 bg-gradient-to-b from-slate-900 via-[#061224] to-slate-950 text-white relative overflow-hidden">
            {/* Ambient police lights blur */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#0F52BA]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#720924]/25 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0F52BA]/30 to-[#720924]/30 border border-blue-500/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
                        <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                        Kutumb Technology Ecosystem
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Built For <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-rose-400 bg-clip-text text-transparent">Seniors</span>, Powered By <span className="text-[#D4AF37]">Police</span>
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg">
                        Explore our unified platform seamlessly synchronizing senior citizens, beat constables, and police headquarters in real time.
                    </p>
                </div>

                {/* Interactive Tabs Navigation */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto mb-10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id)
                                    setActiveHotspot(hotspots[tab.id][0]?.id || null)
                                }}
                                className={`relative text-left p-4 rounded-xl border transition-all duration-300 group overflow-hidden ${
                                    isActive
                                        ? 'bg-gradient-to-br from-[#0F52BA]/40 via-[#0B1E3D] to-[#720924]/40 border-blue-400 shadow-[0_0_25px_rgba(15,82,186,0.4)]'
                                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-700/60 hover:border-slate-500'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white shadow-md' 
                                            : 'bg-slate-800 text-slate-400 group-hover:text-blue-300'
                                    }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                        isActive 
                                            ? 'bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#D4AF37]' 
                                            : 'bg-slate-800 border-slate-700 text-slate-400'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                </div>
                                <h3 className={`font-bold text-sm md:text-base ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                    {tab.label}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{tab.desc}</p>
                                
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 animate-pulse" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Device Display & Interactive Hotspot Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
                    {/* Visual Mockup Container (7 cols) */}
                    <div className="lg:col-span-7">
                        <div className="relative mx-auto rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-black p-4 md:p-6 border border-slate-700 shadow-2xl backdrop-blur-xl">
                            {/* Device Frame Window Header */}
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                                    <span className="text-xs font-mono text-slate-400 ml-2">
                                        kutumb.delhipolice.gov.in / {activeTab}
                                    </span>
                                </div>
                                <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 bg-emerald-950/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5 inline-block" />
                                    Live Secure Channel
                                </Badge>
                            </div>

                            {/* Dynamic Mockup View per Tab */}
                            <div className="relative min-h-[380px] md:min-h-[440px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-3">
                                {activeTab === 'citizen-app' && (
                                    <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-3xl border-4 border-slate-700 p-4 shadow-2xl space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center font-bold text-blue-300">
                                                    KD
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">Mrs. Kamla Devi</p>
                                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Verified Senior (72y)
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-[#720924] text-white border-0 text-[10px]">Ward 14</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                                                <p className="text-slate-400">Beat Constable</p>
                                                <p className="font-semibold text-white mt-0.5">Ct. Manoj Verma</p>
                                                <p className="text-blue-400 text-[10px] mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Call Officer</p>
                                            </div>
                                            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                                                <p className="text-slate-400">Next Welfare Visit</p>
                                                <p className="font-semibold text-emerald-400 mt-0.5">Tomorrow, 11 AM</p>
                                                <p className="text-slate-400 text-[10px] mt-1">Bi-weekly Scheduled</p>
                                            </div>
                                        </div>

                                        {/* Mockup SOS Button */}
                                        <div className="relative py-4 text-center">
                                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-amber-600 p-1 shadow-[0_0_35px_rgba(225,29,72,0.6)] animate-pulse flex items-center justify-center cursor-pointer">
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#720924] to-red-900 flex flex-col items-center justify-center text-white border-2 border-red-300/40">
                                                    <Radio className="w-6 h-6 text-red-200 mb-0.5 animate-bounce" />
                                                    <span className="font-black text-xs tracking-wider">1-TOUCH SOS</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-2">Hold 2s for instant police dispatch</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'officer-tablet' && (
                                    <div className="w-full h-full bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between bg-blue-950/60 p-3 rounded-lg border border-blue-800/50">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-blue-400" />
                                                <span className="font-bold text-sm text-white">Patrol Route: Connaught Place South Beat</span>
                                            </div>
                                            <Badge className="bg-emerald-600 text-white text-xs">GPS Active</Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="p-3 bg-slate-800/90 rounded-lg border border-emerald-500/40 flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white">Shri R. K. Malhotra (81y)</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Priority Tier 1</span>
                                                    </div>
                                                    <p className="text-xs text-slate-300 mt-0.5">B-42 Janpath Road • Living Alone</p>
                                                </div>
                                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs h-8">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Log Visit
                                                </Button>
                                            </div>

                                            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 flex items-center justify-between opacity-80">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white">Smt. Pushpa Singhania (76y)</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">Priority Tier 2</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-0.5">C-18 Barakhamba • With Caregiver</p>
                                                </div>
                                                <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">Pending (2 PM)</Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'control-room' && (
                                    <div className="w-full h-full bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="bg-blue-950/80 p-2 rounded-lg border border-blue-800">
                                                <p className="text-slate-400">Total Registered</p>
                                                <p className="text-lg font-bold text-blue-300">12,847</p>
                                            </div>
                                            <div className="bg-emerald-950/80 p-2 rounded-lg border border-emerald-800">
                                                <p className="text-slate-400">Visits Completed</p>
                                                <p className="text-lg font-bold text-emerald-300">1,520</p>
                                            </div>
                                            <div className="bg-rose-950/80 p-2 rounded-lg border border-rose-800">
                                                <p className="text-slate-400">Active SOS Alerts</p>
                                                <p className="text-lg font-bold text-rose-400">0 (Normal)</p>
                                            </div>
                                        </div>

                                        {/* Mockup Radar Grid */}
                                        <div className="h-44 rounded-lg bg-[#061224] border border-blue-900/60 relative overflow-hidden flex items-center justify-center">
                                            <div className="absolute inset-0 bg-[radial-gradient(#0F52BA_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                                            {/* Concentric radar rings */}
                                            <div className="w-32 h-32 rounded-full border border-blue-500/30 absolute" />
                                            <div className="w-20 h-20 rounded-full border border-blue-500/50 absolute" />
                                            <div className="w-6 h-6 rounded-full bg-blue-500/80 animate-ping absolute" />
                                            <div className="absolute top-4 left-4 bg-slate-900/90 px-2 py-1 rounded border border-blue-500/40 text-[11px] text-blue-200">
                                                📍 Delhi Central District: 24 PCR Units Patrolling
                                            </div>
                                            <div className="absolute bottom-3 right-4 bg-emerald-950/90 px-2 py-1 rounded border border-emerald-500/40 text-[10px] text-emerald-300">
                                                ✓ Average Dispatch ETA: 4.8 Mins
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'digital-id' && (
                                    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-[#061224] via-[#0F3274] to-[#720924] rounded-2xl p-5 border-2 border-[#D4AF37]/60 shadow-[0_0_30px_rgba(212,175,55,0.25)] text-white relative">
                                        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <img src="/delhi-police-logo.png" alt="Delhi Police" className="h-10 w-auto" />
                                                <div>
                                                    <p className="text-xs font-bold tracking-wider text-[#D4AF37]">DELHI POLICE</p>
                                                    <p className="text-[10px] text-blue-100">Senior Citizen Welfare Identity Card</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-[#D4AF37] text-slate-950 font-bold text-[10px]">VERIFIED</Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 items-center">
                                            <div className="col-span-1">
                                                <div className="w-20 h-24 rounded-lg bg-slate-800 border-2 border-white/30 overflow-hidden shadow">
                                                    <img src="/indian-woman-profile-photo.png" alt="Citizen" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="col-span-2 space-y-1 text-xs">
                                                <p className="font-bold text-sm text-white">Smt. Kamla Devi</p>
                                                <p className="text-[11px] text-blue-200">ID: <span className="font-mono text-white">DP-SC-2024-8841</span></p>
                                                <p className="text-[11px] text-blue-200">Blood: <span className="text-rose-300 font-bold">O+ Positive</span></p>
                                                <p className="text-[11px] text-blue-200">PS: <span className="text-white font-medium">Connaught Place</span></p>
                                                <p className="text-[10px] text-emerald-300">Emergency: +91 98765-XXXXX (Son)</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-slate-300">
                                            <span className="flex items-center gap-1"><QrCode className="w-4 h-4 text-[#D4AF37]" /> Scan for Police Verification</span>
                                            <span className="font-mono">VALID TILL: LIFETIME</span>
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Hotspot Overlays */}
                                {hotspots[activeTab].map((spot) => {
                                    const isSelected = activeHotspot === spot.id
                                    return (
                                        <button
                                            key={spot.id}
                                            onClick={() => setActiveHotspot(spot.id)}
                                            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                                            className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none`}
                                            aria-label={`View feature: ${spot.title}`}
                                        >
                                            <span className="relative flex h-7 w-7 items-center justify-center">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                                    isSelected ? 'bg-amber-400' : 'bg-blue-400'
                                                }`} />
                                                <span className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center text-xs font-bold shadow-lg border-2 border-white ${
                                                    isSelected 
                                                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white scale-110' 
                                                        : 'bg-[#0F52BA] text-white hover:scale-110'
                                                }`}>
                                                    +
                                                </span>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Hotspot Info & Card Details (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500/40 via-amber-500/40 to-rose-500/40 shadow-xl">
                            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white border-0">
                                        Feature Spotlight
                                    </Badge>
                                    <span className="text-xs text-slate-400">Click (+) markers on mockup</span>
                                </div>

                                {activeHotspot ? (() => {
                                    const currentSpot = hotspots[activeTab].find(h => h.id === activeHotspot) || hotspots[activeTab][0]
                                    return (
                                        <div className="space-y-3 animate-fade-in">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xl font-bold text-white">{currentSpot.title}</h4>
                                                <Badge variant="outline" className="text-xs text-[#D4AF37] border-[#D4AF37]/50">
                                                    {currentSpot.tag}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {currentSpot.desc}
                                            </p>
                                        </div>
                                    )
                                })() : (
                                    <p className="text-sm text-slate-400">Click any hotspot to examine technical workflows.</p>
                                )}

                                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        MeitY & GIGW 3.0 Certified Architecture
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Feature Cards with Hover Fill */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="card-hover-fill p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400 card-icon-invert transition-all">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm text-white card-text-invert">Police Verified</h5>
                                        <p className="text-xs text-slate-400 card-subtext-invert">100% physically audited</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-hover-fill p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400 card-icon-invert transition-all">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm text-white card-text-invert">Direct PCR Sync</h5>
                                        <p className="text-xs text-slate-400 card-subtext-invert">Instant response 100/112</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
