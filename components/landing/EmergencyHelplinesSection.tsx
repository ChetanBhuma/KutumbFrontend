"use client"

import React, { useState } from 'react'
import { 
    Phone, 
    PhoneCall, 
    ShieldAlert, 
    HeartHandshake, 
    ShieldCheck, 
    Ambulance, 
    Copy, 
    Check, 
    Radio
} from 'lucide-react'

interface HelplineInfo {
    id: string
    title: string
    numbers: string[]
    primaryNumber: string
    category: string
    description: string
    badge: string
    badgeColor: string
    themeGradient: string
    borderColor: string
    hoverBorder: string
    glowShadow: string
    iconBg: string
    iconColor: string
    icon: React.ElementType
}

export function EmergencyHelplinesSection() {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const helplines: HelplineInfo[] = [
        {
            id: 'police',
            title: 'Police Emergency',
            numbers: ['112', '100'],
            primaryNumber: '112',
            category: 'PCR & Immediate Response',
            description: 'Instant Delhi Police PCR van dispatch, emergency crime response, and 24/7 on-field police assistance.',
            badge: '24/7 Toll Free',
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            themeGradient: 'from-blue-600/15 via-slate-900 to-rose-950/20',
            borderColor: 'border-blue-500/30',
            hoverBorder: 'hover:border-rose-400/70',
            glowShadow: 'group-hover:shadow-[0_0_35px_rgba(225,29,72,0.25)]',
            iconBg: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
            iconColor: 'text-rose-400',
            icon: ShieldAlert
        },
        {
            id: 'senior',
            title: 'Senior Citizen Cell',
            numbers: ['1090', '1291'],
            primaryNumber: '1090',
            category: 'Dedicated Elders Safety',
            description: 'Direct priority line for elderly welfare, beat officer check-in requests, domestic harassment, and urgent support.',
            badge: 'Dedicated Elders Line',
            badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            themeGradient: 'from-amber-600/15 via-slate-900 to-slate-950',
            borderColor: 'border-amber-500/30',
            hoverBorder: 'hover:border-[#D4AF37]/80',
            glowShadow: 'group-hover:shadow-[0_0_35px_rgba(212,175,55,0.25)]',
            iconBg: 'bg-amber-500/20 border-amber-500/40 text-[#D4AF37]',
            iconColor: 'text-[#D4AF37]',
            icon: HeartHandshake
        },
        {
            id: 'cyber',
            title: 'Cyber Crime Helpline',
            numbers: ['1930'],
            primaryNumber: '1930',
            category: 'National Cyber Fraud Shield',
            description: 'Immediate financial fraud freeze, fake digital arrest reporting, KYC phishing complaints, and cyber extortion defense.',
            badge: 'Instant Fraud Freeze',
            badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            themeGradient: 'from-[#0F52BA]/20 via-slate-900 to-cyan-950/20',
            borderColor: 'border-blue-500/30',
            hoverBorder: 'hover:border-blue-400/70',
            glowShadow: 'group-hover:shadow-[0_0_35px_rgba(15,82,186,0.3)]',
            iconBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
            iconColor: 'text-blue-400',
            icon: ShieldCheck
        },
        {
            id: 'medical',
            title: 'Ambulance & Trauma',
            numbers: ['102', '108'],
            primaryNumber: '102',
            category: 'Emergency Medical Care',
            description: 'Critical patient transport, emergency paramedical dispatch, trauma stabilization, and government hospital coordination.',
            badge: '24/7 Healthcare',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            themeGradient: 'from-emerald-600/15 via-slate-900 to-teal-950/20',
            borderColor: 'border-emerald-500/30',
            hoverBorder: 'hover:border-emerald-400/70',
            glowShadow: 'group-hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]',
            iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
            iconColor: 'text-emerald-400',
            icon: Ambulance
        }
    ]

    const handleCopy = (id: string, num: string) => {
        navigator.clipboard.writeText(num)
        setCopiedId(`${id}-${num}`)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <section 
            className="py-12 sm:py-20 bg-gradient-to-b from-slate-950 via-[#061224] to-slate-950 text-white relative overflow-hidden border-y border-white/10"
            aria-label="24/7 Emergency Helplines"
        >
            {/* Ambient glowing orbs */}
            <div className="absolute top-10 left-1/4 w-80 h-80 bg-[#0F52BA]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#720924]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 via-[#0F52BA]/20 to-amber-500/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                        24/7 Rapid Emergency Helplines
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Instant Helpline & <span className="bg-gradient-to-r from-blue-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">Police Calling Cards</span>
                    </h2>

                    <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        One-touch direct calling lines connected to Delhi Police Emergency Control Room, dedicated Senior Citizen Welfare Cells, Cyber Fraud Shield, and Rapid Medical Response.
                    </p>
                </div>

                {/* Emergency Calling Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto">
                    {helplines.map((helpline) => {
                        const Icon = helpline.icon
                        return (
                            <div
                                key={helpline.id}
                                className={`group relative rounded-2xl bg-gradient-to-b ${helpline.themeGradient} p-5 sm:p-6 border ${helpline.borderColor} ${helpline.hoverBorder} ${helpline.glowShadow} backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col justify-between overflow-hidden shadow-xl`}
                            >
                                {/* Background Accent Shimmer */}
                                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                                <div>
                                    {/* Card Header: Icon + Badge */}
                                    <div className="flex items-start justify-between gap-2 mb-4">
                                        <div className={`p-3 rounded-xl border ${helpline.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border ${helpline.badgeColor} backdrop-blur-sm`}>
                                            {helpline.badge}
                                        </span>
                                    </div>

                                    {/* Category & Title */}
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        {helpline.category}
                                    </p>
                                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-amber-200 transition-colors">
                                        {helpline.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-xs text-slate-300 mt-2 mb-5 leading-relaxed">
                                        {helpline.description}
                                    </p>
                                </div>

                                {/* Numbers and Action Row */}
                                <div className="space-y-3 pt-3 border-t border-white/10">
                                    {/* Main Display Numbers */}
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {helpline.numbers.map((num, idx) => (
                                                <div key={num} className="flex items-center gap-1.5">
                                                    {idx > 0 && <span className="text-slate-500 font-bold">/</span>}
                                                    <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-sm group-hover:text-[#D4AF37] transition-colors">
                                                        {num}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Copy Button */}
                                        <button
                                            onClick={() => handleCopy(helpline.id, helpline.primaryNumber)}
                                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 border border-white/10"
                                            title={`Copy ${helpline.primaryNumber}`}
                                            aria-label={`Copy helpline number ${helpline.primaryNumber}`}
                                        >
                                            {copiedId === `${helpline.id}-${helpline.primaryNumber}` ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-[10px] text-emerald-400 font-semibold">Copied</span>
                                                </>
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Direct Calling Button */}
                                    <a
                                        href={`tel:${helpline.primaryNumber}`}
                                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F52BA] to-[#720924] hover:from-[#1360d8] hover:to-[#8a0b2c] text-white font-bold text-xs sm:text-sm shadow-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(15,82,186,0.4)] transform active:scale-95 border border-white/10"
                                    >
                                        <PhoneCall className="w-4 h-4 text-emerald-300 animate-bounce" />
                                        <span>Call {helpline.primaryNumber} Now</span>
                                    </a>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
