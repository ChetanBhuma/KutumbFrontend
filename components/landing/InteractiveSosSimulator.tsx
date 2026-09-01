"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Radio, 
    AlertOctagon, 
    MapPin, 
    ShieldCheck, 
    Smartphone, 
    Clock, 
    CheckCircle2, 
    RotateCcw, 
    Navigation, 
    Car, 
    Send,
    BellRing
} from 'lucide-react'

export function InteractiveSosSimulator() {
    const [simState, setSimState] = useState<'idle' | 'triggered' | 'gps_locked' | 'dispatched'>('idle')
    const [countdown, setCountdown] = useState<number>(270) // 4m 30s
    const [logs, setLogs] = useState<string[]>([])

    const startSimulation = () => {
        setSimState('triggered')
        setLogs(['[00:01] 🚨 SOS Button pressed by Senior Citizen'])

        setTimeout(() => {
            setSimState('gps_locked')
            setLogs(prev => [
                ...prev,
                '[00:03] 🛰️ High-Precision GPS Lock Acquired: 28.6139° N, 77.2090° E (Connaught Place)',
                '[00:04] ⚡ Central Command Hub Priority Flag Activated'
            ])
        }, 1600)

        setTimeout(() => {
            setSimState('dispatched')
            setLogs(prev => [
                ...prev,
                '[00:06] 🚓 PCR Van #DL-1C-4421 & Beat Officer Ct. Manoj Verma Dispatched',
                '[00:07] 📱 Automated High-Priority SMS & WhatsApp sent to Next of Kin (Son: Rohit Sharma)',
                '[00:08] 🎧 Welfare Audio Channel Opened with Delhi Police 112 Command Desk'
            ])
        }, 3400)
    }

    const resetSimulation = () => {
        setSimState('idle')
        setCountdown(270)
        setLogs([])
    }

    useEffect(() => {
        let interval: any = null
        if (simState === 'dispatched' && countdown > 0) {
            interval = setInterval(() => {
                setCountdown(prev => (prev > 0 ? prev - 1 : 0))
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [simState, countdown])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
            {/* Background lighting mesh */}
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#720924]/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-[#0F52BA]/25 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/70 border border-rose-600/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-4">
                        <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                        Live Emergency Simulation
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Instant <span className="bg-gradient-to-r from-rose-400 via-red-300 to-amber-300 bg-clip-text text-transparent">SOS Life-Line</span>
                    </h2>
                    <p className="text-slate-300 text-base md:text-lg">
                        Test how the Delhi Police emergency mechanism reacts within seconds of a senior citizen pressing the distress trigger.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
                    {/* Interactive Trigger & Live Status Display (7 cols) */}
                    <div className="lg:col-span-7 bg-gradient-to-br from-slate-900/90 via-[#061224] to-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <AlertOctagon className="w-5 h-5 text-rose-400" />
                                    <span className="font-bold text-sm text-white">Emergency Response Simulator</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {simState !== 'idle' && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={resetSimulation}
                                            className="h-7 text-xs border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                                        >
                                            <RotateCcw className="w-3 h-3 mr-1" /> Reset Test
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Simulator Trigger State */}
                            {simState === 'idle' && (
                                <div className="py-8 text-center space-y-6">
                                    <div className="relative inline-block">
                                        <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-rose-600 via-[#720924] to-red-500 p-1.5 shadow-[0_0_50px_rgba(225,29,72,0.5)] cursor-pointer group hover:scale-105 transition-all duration-300"
                                            onClick={startSimulation}>
                                            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-white border-2 border-rose-500/40 group-hover:border-rose-400">
                                                <Radio className="w-10 h-10 text-rose-500 mb-1 animate-pulse" />
                                                <span className="font-black text-sm tracking-widest text-rose-200">TRIGGER SOS</span>
                                                <span className="text-[10px] text-slate-400">Click to Simulate</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                                        Pressing this button activates a zero-latency priority distress beacon directly to the Delhi Police Integrated Command & Control Centre.
                                    </p>
                                </div>
                            )}

                            {simState !== 'idle' && (
                                <div className="space-y-4">
                                    {/* Status Cards */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className={`p-3 rounded-xl border text-center transition-all ${
                                            simState === 'triggered' || simState === 'gps_locked' || simState === 'dispatched'
                                                ? 'bg-rose-950/60 border-rose-600 text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                                                : 'bg-slate-900 border-slate-800 text-slate-500'
                                        }`}>
                                            <Radio className="w-5 h-5 mx-auto mb-1 animate-bounce" />
                                            <p className="text-[11px] font-bold">1. Beacon Fired</p>
                                            <p className="text-[9px] text-rose-300">0.8s Latency</p>
                                        </div>

                                        <div className={`p-3 rounded-xl border text-center transition-all ${
                                            simState === 'gps_locked' || simState === 'dispatched'
                                                ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(15,82,186,0.3)]'
                                                : 'bg-slate-900 border-slate-800 text-slate-500'
                                        }`}>
                                            <MapPin className="w-5 h-5 mx-auto mb-1 animate-pulse" />
                                            <p className="text-[11px] font-bold">2. GPS Locked</p>
                                            <p className="text-[9px] text-blue-300">Accuracy ± 3m</p>
                                        </div>

                                        <div className={`p-3 rounded-xl border text-center transition-all ${
                                            simState === 'dispatched'
                                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                : 'bg-slate-900 border-slate-800 text-slate-500'
                                        }`}>
                                            <Car className="w-5 h-5 mx-auto mb-1 animate-pulse" />
                                            <p className="text-[11px] font-bold">3. PCR Dispatched</p>
                                            <p className="text-[9px] text-emerald-300">ETA {formatTime(countdown)}</p>
                                        </div>
                                    </div>

                                    {/* Live Simulated Map Radar Screen */}
                                    <div className="relative h-48 rounded-xl bg-slate-950 border border-slate-800 p-4 overflow-hidden flex flex-col justify-between">
                                        <div className="absolute inset-0 bg-[radial-gradient(#1E40AF_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />
                                        
                                        <div className="relative z-10 flex items-center justify-between">
                                            <Badge className="bg-rose-600 text-white font-mono text-[10px] animate-pulse">
                                                LIVE DISTRESS ACTIVE
                                            </Badge>
                                            <span className="text-xs font-mono text-slate-400">
                                                DISTRICT: NEW DELHI | SECTOR 4
                                            </span>
                                        </div>

                                        {/* Visual Route & Pulse */}
                                        <div className="relative z-10 flex items-center justify-around py-3">
                                            <div className="text-center">
                                                <div className="w-12 h-12 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center mx-auto mb-1 animate-ping">
                                                    <MapPin className="w-6 h-6 text-rose-400" />
                                                </div>
                                                <p className="text-[11px] font-bold text-white">Senior Location</p>
                                                <p className="text-[9px] text-slate-400">Connaught Circus</p>
                                            </div>

                                            <div className="flex-1 mx-4 flex flex-col items-center">
                                                <div className="w-full h-1 bg-slate-700 relative overflow-hidden rounded-full">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 animate-[pulse_1.5s_infinite]" />
                                                </div>
                                                <span className="text-[10px] text-emerald-400 font-mono mt-1">
                                                    Distance: 650m • En Route
                                                </span>
                                            </div>

                                            <div className="text-center">
                                                <div className="w-12 h-12 rounded-full bg-emerald-600/30 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-1">
                                                    <Car className="w-6 h-6 text-emerald-400" />
                                                </div>
                                                <p className="text-[11px] font-bold text-white">PCR Van #4421</p>
                                                <p className="text-[9px] text-emerald-300">Ct. Manoj Verma</p>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                                            <span>Est. Officer Arrival: <strong className="text-white font-mono">{formatTime(countdown)} min</strong></span>
                                            <span className="text-emerald-400 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Next-of-Kin Notified
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Event Feed Console */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                            <p className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                                Telemetry Event Feed:
                            </p>
                            <div className="bg-slate-950 rounded-lg p-2.5 max-h-24 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300 border border-slate-800/60">
                                {logs.length === 0 ? (
                                    <p className="text-slate-500 italic">Waiting for simulation trigger...</p>
                                ) : (
                                    logs.map((log, idx) => (
                                        <p key={idx} className={log.includes('🚨') ? 'text-rose-400 font-semibold' : log.includes('🚓') ? 'text-emerald-300' : 'text-slate-300'}>
                                            {log}
                                        </p>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features & Guarantees (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="card-hover-fill p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#061224] border border-slate-800 shadow-xl cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-[#0F52BA]/20 border border-blue-500/30 text-blue-400 card-icon-invert transition-all">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-base text-white card-text-invert">Sub-5 Minute Response Target</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed card-subtext-invert">
                                        Integrated with Delhi Police 112 Command Dispatch, routing the closest available beat constable or PCR van with zero triage delays.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-hover-fill p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#720924]/40 border border-slate-800 shadow-xl cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-[#720924]/40 border border-rose-500/30 text-rose-300 card-icon-invert transition-all">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-base text-white card-text-invert">Multi-Channel Kin Broadcast</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed card-subtext-invert">
                                        Simultaneously broadcasts live GPS coordinates and medical history to designated sons, daughters, or caregivers via SMS and automated call.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-hover-fill p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#061224] border border-slate-800 shadow-xl cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-[#D4AF37] card-icon-invert transition-all">
                                    <BellRing className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-base text-white card-text-invert">Physical Doorstep Confirmation</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed card-subtext-invert">
                                        The officer stays on-site until the senior's well-being is verified and logs a mandatory resolution report before closing the dispatch.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
