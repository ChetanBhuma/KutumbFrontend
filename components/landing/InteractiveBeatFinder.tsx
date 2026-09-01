"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Search, 
    MapPin, 
    Phone, 
    Shield, 
    UserCheck, 
    Building2, 
    Navigation, 
    CheckCircle2,
    Copy,
    PhoneCall,
    Car
} from 'lucide-react'

interface BeatData {
    district: string
    station: string
    shoName: string
    shoPhone: string
    beatOfficerName: string
    beatOfficerRank: string
    beatOfficerPhone: string
    pcrUnit: string
    address: string
    activeSeniors: number
}

export function InteractiveBeatFinder() {
    const districtsData: Record<string, BeatData[]> = {
        'New Delhi': [
            {
                district: 'New Delhi',
                station: 'Connaught Place Police Station',
                shoName: 'Insp. R. P. Upadhyay',
                shoPhone: '011-23340050',
                beatOfficerName: 'Ct. Manoj Verma',
                beatOfficerRank: 'Head Constable (Beat #3)',
                beatOfficerPhone: '+91 98711-22340',
                pcrUnit: 'PCR Zebra 14 (Janpath)',
                address: 'Parliament Street, Near Rajiv Chowk, New Delhi - 110001',
                activeSeniors: 412
            },
            {
                district: 'New Delhi',
                station: 'Barakhamba Road Police Station',
                shoName: 'Insp. Arvind Rawat',
                shoPhone: '011-23412211',
                beatOfficerName: 'Ct. Rajesh Tyagi',
                beatOfficerRank: 'Constable (Beat #1)',
                beatOfficerPhone: '+91 98711-88320',
                pcrUnit: 'PCR Alpha 08 (Tolstoy Marg)',
                address: 'Barakhamba Road, Connaught Lane, New Delhi - 110001',
                activeSeniors: 289
            }
        ],
        'South': [
            {
                district: 'South',
                station: 'Hauz Khas Police Station',
                shoName: 'Insp. Surender Singh',
                shoPhone: '011-26563333',
                beatOfficerName: 'Ct. Amit Kumar',
                beatOfficerRank: 'Head Constable (Beat #5)',
                beatOfficerPhone: '+91 98712-44560',
                pcrUnit: 'PCR South 22 (Green Park)',
                address: 'Near IIT Flyover, Hauz Khas, New Delhi - 110016',
                activeSeniors: 580
            },
            {
                district: 'South',
                station: 'Saket Police Station',
                shoName: 'Insp. Vikram Dahiya',
                shoPhone: '011-29562244',
                beatOfficerName: 'Ct. Vikas Yadav',
                beatOfficerRank: 'Constable (Beat #2)',
                beatOfficerPhone: '+91 98712-77890',
                pcrUnit: 'PCR South 09 (Select City)',
                address: 'Press Enclave Road, Saket, New Delhi - 110017',
                activeSeniors: 624
            }
        ],
        'Rohini': [
            {
                district: 'Rohini',
                station: 'Prashant Vihar Police Station',
                shoName: 'Insp. Naresh Khatri',
                shoPhone: '011-27561122',
                beatOfficerName: 'Ct. Sandeep Hooda',
                beatOfficerRank: 'Head Constable (Beat #4)',
                beatOfficerPhone: '+91 98713-11223',
                pcrUnit: 'PCR Rohini 12 (Outer Ring Rd)',
                address: 'Sector 14, Rohini, Delhi - 110085',
                activeSeniors: 710
            }
        ],
        'Dwarka': [
            {
                district: 'Dwarka',
                station: 'Dwarka South Police Station',
                shoName: 'Insp. Harish Kumar',
                shoPhone: '011-28080011',
                beatOfficerName: 'Ct. Deepak Rathi',
                beatOfficerRank: 'Constable (Beat #7)',
                beatOfficerPhone: '+91 98714-99881',
                pcrUnit: 'PCR Dwarka 04 (City Centre)',
                address: 'Sector 9, Dwarka, New Delhi - 110077',
                activeSeniors: 840
            }
        ]
    }

    const [selectedDistrict, setSelectedDistrict] = useState<string>('New Delhi')
    const [selectedStationIndex, setSelectedStationIndex] = useState<number>(0)
    const [copied, setCopied] = useState(false)

    const stationsList = districtsData[selectedDistrict] || []
    const currentData = stationsList[selectedStationIndex] || stationsList[0]

    const copyPhone = (phone: string) => {
        navigator.clipboard.writeText(phone)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
            {/* Gradient glow */}
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#0F52BA]/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#720924]/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-950 to-rose-950 border border-blue-500/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
                        <Building2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                        Jurisdiction Directory
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Find Your Assigned <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-rose-400 bg-clip-text text-transparent">Police Beat Officer</span>
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg">
                        Select your Delhi Police District to instantly look up your local Station House Officer, Beat Constable, and dedicated senior citizen nodal desk.
                    </p>
                </div>

                {/* District Filter Bar */}
                <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
                    {Object.keys(districtsData).map((district) => (
                        <button
                            key={district}
                            onClick={() => {
                                setSelectedDistrict(district)
                                setSelectedStationIndex(0)
                            }}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                                selectedDistrict === district
                                    ? 'bg-gradient-to-r from-[#0F52BA] to-[#720924] text-white shadow-[0_0_20px_rgba(15,82,186,0.5)] border border-blue-400 scale-105'
                                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                            }`}
                        >
                            📍 {district} District
                        </button>
                    ))}
                </div>

                {/* Station Tabs */}
                {stationsList.length > 1 && (
                    <div className="flex justify-center gap-2 mb-8">
                        {stationsList.map((station, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedStationIndex(idx)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                    selectedStationIndex === idx
                                        ? 'bg-blue-600/30 border-blue-400 text-white'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {station.station}
                            </button>
                        ))}
                    </div>
                )}

                {/* Interactive Officer Profile Card */}
                {currentData && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-slate-900 via-[#061224] to-slate-900 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
                            {/* Police Insignia Accent Line */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F52BA] via-[#D4AF37] to-[#720924]" />

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                {/* Officer Badge Photo / Crest (4 cols) */}
                                <div className="md:col-span-4 text-center">
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#0F52BA] to-[#720924] p-1 shadow-[0_0_25px_rgba(15,82,186,0.4)] mx-auto">
                                            <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-3 text-center">
                                                <Shield className="w-12 h-12 text-[#D4AF37] mb-1" />
                                                <p className="text-[10px] font-bold text-blue-200 tracking-wider">BEAT OFFICER</p>
                                                <p className="text-[9px] text-slate-400">DELHI POLICE</p>
                                            </div>
                                        </div>
                                        <Badge className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] whitespace-nowrap">
                                            <CheckCircle2 className="w-3 h-3 mr-1 inline" /> On Active Duty
                                        </Badge>
                                    </div>
                                    <h4 className="font-bold text-lg text-white mt-4">{currentData.beatOfficerName}</h4>
                                    <p className="text-xs text-blue-300">{currentData.beatOfficerRank}</p>
                                </div>

                                {/* Detailed Contact & Jurisdiction Information (8 cols) */}
                                <div className="md:col-span-8 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white">{currentData.station}</h3>
                                            <Badge className="bg-[#D4AF37] text-slate-950 text-xs font-bold">
                                                {currentData.activeSeniors}+ Seniors Enrolled
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                            {currentData.address}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        {/* Beat Officer Phone */}
                                        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                                            <p className="text-[11px] text-slate-400">Direct Beat Helpline</p>
                                            <p className="font-mono text-sm font-bold text-emerald-400 mt-0.5">{currentData.beatOfficerPhone}</p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyPhone(currentData.beatOfficerPhone)}
                                                className="h-6 text-[10px] text-blue-300 hover:text-blue-100 p-0 mt-1"
                                            >
                                                <Copy className="w-3 h-3 mr-1" /> {copied ? 'Copied!' : 'Copy Number'}
                                            </Button>
                                        </div>

                                        {/* Station House Officer Contact */}
                                        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                                            <p className="text-[11px] text-slate-400">Station House Officer (SHO)</p>
                                            <p className="font-semibold text-sm text-white mt-0.5">{currentData.shoName}</p>
                                            <p className="font-mono text-xs text-blue-300">{currentData.shoPhone}</p>
                                        </div>
                                    </div>

                                    {/* PCR Unit */}
                                    <div className="flex items-center justify-between bg-blue-950/40 p-3 rounded-xl border border-blue-900/50 text-xs">
                                        <span className="flex items-center gap-2 text-slate-300">
                                            <Car className="w-4 h-4 text-blue-400" />
                                            Assigned Patrol Sector: <strong className="text-white">{currentData.pcrUnit}</strong>
                                        </span>
                                        <span className="text-emerald-400 font-mono">24/7 Standby</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
