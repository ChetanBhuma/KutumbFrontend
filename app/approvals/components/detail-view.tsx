"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    User, MapPin, Phone, Calendar, Heart,
    FileText, Shield, Home, Users, Briefcase,
    Building, Mail, Activity, Stethoscope, Clock,
    Award, CheckCircle2, UserCheck,
    Eye, Building2, PhoneCall, Copy
} from "lucide-react"
import { format } from "date-fns"
import apiClient from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface DetailViewProps {
    registration: any
}

export function DetailView({ registration }: DetailViewProps) {
    const { toast } = useToast()
    const [imgError, setImgError] = useState(false)
    const citizen = registration?.citizen || registration?.draftData || {}

    const spouse = citizen.SpouseDetails || (citizen.spouseName ? {
        name: citizen.spouseName,
        age: citizen.spouseAge,
        occupation: citizen.spouseOccupation,
        mobileNumber: citizen.spouseMobile
    } : null)

    const emergencyContacts: any[] = citizen.EmergencyContact || citizen.emergencyContacts || []
    const familyMembers: any[] = citizen.FamilyMember || citizen.familyMembers || []
    const householdHelpers: any[] = citizen.HouseholdHelp || citizen.householdHelp || []

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast({ title: "Copied to Clipboard", description: `${label}: ${text}` })
    }

    const DetailField = ({
        icon: Icon,
        label,
        value,
        canCopy = false,
        className = ""
    }: {
        icon: any
        label: string
        value: any
        canCopy?: boolean
        className?: string
    }) => (
        <div className={cn("p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2 transition-all hover:bg-slate-100/70", className)}>
            <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 p-1.5 rounded-md bg-white text-indigo-600 shadow-2xs shrink-0 border border-slate-200">
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 break-words mt-0.5 block leading-snug">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : (value || "—")}
                    </span>
                </div>
            </div>
            {canCopy && value && (
                <button
                    type="button"
                    onClick={() => copyToClipboard(String(value), label)}
                    title="Copy"
                    className="text-slate-400 hover:text-indigo-600 p-1 rounded transition-colors shrink-0"
                >
                    <Copy className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Top Hero Card for the Citizen */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-900/50 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                    <Shield className="h-64 w-64 text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-indigo-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-indigo-400/40 shrink-0 overflow-hidden">
                            {citizen.photoUrl && !imgError ? (
                                <img
                                    src={citizen.photoUrl}
                                    alt={citizen.fullName || "Citizen Photo"}
                                    className="h-full w-full object-cover rounded-2xl"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <User className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-100" />
                            )}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                                    {citizen.fullName || registration.fullName || "Senior Citizen"}
                                </h2>
                                {citizen.age && (
                                    <Badge className="bg-indigo-600/80 text-white border-indigo-400 text-xs font-bold">
                                        {citizen.age} yrs
                                    </Badge>
                                )}
                                {citizen.gender && (
                                    <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                                        {citizen.gender}
                                    </Badge>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm text-indigo-200 mt-1 flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                                <span className="truncate max-w-md">{citizen.permanentAddress || "Address provided during registration"}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-300">
                                <span className="flex items-center gap-1 font-mono font-medium">
                                    <Phone className="h-3 w-3 text-emerald-400" />
                                    {citizen.mobileNumber || registration.mobileNumber}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3 text-blue-400" />
                                    PS: <strong className="text-white font-bold">{citizen.PoliceStation?.name || citizen.policeStation?.name || citizen.policeStationName || "Pending Assign"}</strong>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-indigo-400" />
                                    District: <strong className="text-white font-bold">{citizen.District?.name || citizen.district?.name || citizen.districtName || "Delhi"}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-indigo-800/60">
                        <Badge className={cn(
                            "px-3 py-1 text-xs font-bold shadow-xs",
                            registration.status === "APPROVED" ? "bg-emerald-500 text-white" :
                            registration.status === "REJECTED" ? "bg-rose-600 text-white" :
                            "bg-amber-400 text-amber-950"
                        )}>
                            ● Status: {registration.status === "PENDING_REVIEW" ? "Pending Admin Review" : registration.status}
                        </Badge>
                        <span className="text-[11px] text-indigo-200 font-mono">
                            Submitted: {registration.createdAt ? format(new Date(registration.createdAt), "dd MMM yyyy, hh:mm a") : "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Segmented View Tabs */}
            <Tabs defaultValue="personal" className="w-full space-y-4">
                <TabsList className="w-full justify-start h-auto p-1.5 bg-slate-100/95 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-1.5 shadow-2xs">
                    <TabsTrigger
                        value="personal"
                        className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
                    >
                        <User className="h-4 w-4 mr-1.5 text-indigo-600 shrink-0 transition-colors" /> Personal
                    </TabsTrigger>
                    <TabsTrigger
                        value="address"
                        className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
                    >
                        <MapPin className="h-4 w-4 mr-1.5 text-indigo-600 shrink-0 transition-colors" /> Address & PS
                    </TabsTrigger>
                    <TabsTrigger
                        value="family"
                        className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
                    >
                        <Users className="h-4 w-4 mr-1.5 text-indigo-600 shrink-0 transition-colors" /> Family & Contacts
                    </TabsTrigger>
                    <TabsTrigger
                        value="health"
                        className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
                    >
                        <Heart className="h-4 w-4 mr-1.5 text-indigo-600 shrink-0 transition-colors" /> Health & Living
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="text-xs py-2.5 px-3 font-bold rounded-lg transition-all text-slate-700 hover:text-indigo-900 hover:bg-slate-200/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:[&_svg]:text-white"
                    >
                        <FileText className="h-4 w-4 mr-1.5 text-indigo-600 shrink-0 transition-colors" /> Documents
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: Personal Details */}
                <TabsContent value="personal" className="space-y-4 mt-0">
                    <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                <User className="h-4.5 w-4.5 text-indigo-600" />
                                Personal & Identity Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <DetailField icon={User} label="Full Legal Name" value={citizen.fullName || registration.fullName} />
                            <DetailField
                                icon={Calendar}
                                label="Date of Birth & Age"
                                value={citizen.dateOfBirth
                                    ? `${format(new Date(citizen.dateOfBirth), "dd MMMM yyyy")} (${citizen.age ?? "—"} yrs)`
                                    : (citizen.age ? `${citizen.age} yrs` : "—")
                                }
                            />
                            <DetailField icon={Users} label="Gender" value={citizen.gender} />
                            <DetailField icon={Phone} label="Primary Mobile Number" value={citizen.mobileNumber || registration.mobileNumber} canCopy />
                            <DetailField icon={Phone} label="Alternate Mobile Number" value={citizen.alternateMobile} canCopy />
                            <DetailField icon={Mail} label="Email Address" value={citizen.email} canCopy />
                            <DetailField icon={Users} label="Religion" value={citizen.religion} />
                            <DetailField icon={Heart} label="Marital Status" value={citizen.maritalStatus} />
                            <DetailField icon={Award} label="Educational Qualification" value={citizen.educationQualification} />
                            <DetailField icon={Briefcase} label="Occupation" value={citizen.occupation} />
                            <DetailField icon={Award} label="Specialization / Trade" value={citizen.specialization} />
                            <DetailField icon={Building} label="Retired From" value={citizen.retiredFrom} />
                            <DetailField icon={Calendar} label="Year of Retirement" value={citizen.yearOfRetirement} />
                            <DetailField
                                icon={FileText}
                                label="Languages Known"
                                value={Array.isArray(citizen.languagesKnown) ? citizen.languagesKnown.join(", ") : citizen.languagesKnown}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: Address & Jurisdiction */}
                <TabsContent value="address" className="space-y-4 mt-0">
                    <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="h-4.5 w-4.5 text-indigo-600" />
                                Police Jurisdiction & Station Assignment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DetailField
                                icon={Shield}
                                label="Police District"
                                value={citizen.District?.name || citizen.district?.name || citizen.districtName || "Delhi Police District"}
                                className="bg-indigo-50/50 border-indigo-100"
                            />
                            <DetailField
                                icon={Building2}
                                label="Assigned Police Station"
                                value={citizen.PoliceStation?.name || citizen.policeStation?.name || citizen.policeStationName || "Police Station Jurisdiction"}
                                className="bg-blue-50/50 border-blue-100"
                            />
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="h-4.5 w-4.5 text-indigo-600" />
                                Residential Address Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DetailField
                                icon={Home}
                                label="Saved Address As"
                                value={citizen.addressType ? (citizen.addressType === "HOME" ? "🏠 Home" : citizen.addressType === "WORK" ? "💼 Work" : citizen.addressType === "HOTEL" ? "🏨 Hotel" : citizen.addressType) : "🏠 Home"}
                            />
                            <DetailField icon={MapPin} label="Pin Code" value={citizen.pinCode} canCopy />
                            <DetailField icon={MapPin} label="City" value={citizen.city || "Delhi"} />
                            <DetailField icon={MapPin} label="Landmark" value={citizen.landmark} />
                            <div className="sm:col-span-2">
                                <DetailField icon={MapPin} label="Permanent Address" value={citizen.permanentAddress} canCopy />
                            </div>
                            {citizen.presentAddress && (
                                <div className="sm:col-span-2">
                                    <DetailField icon={MapPin} label="Present Address" value={citizen.presentAddress} canCopy />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: Family & Emergency Contacts */}
                <TabsContent value="family" className="space-y-4 mt-0">
                    {spouse && (
                        <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Heart className="h-4.5 w-4.5 text-rose-500" />
                                    Spouse Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <DetailField icon={User} label="Spouse Name" value={spouse.name || spouse.fullName} />
                                <DetailField icon={Calendar} label="Spouse Age" value={spouse.age ? `${spouse.age} yrs` : "—"} />
                                <DetailField icon={Briefcase} label="Occupation" value={spouse.occupation} />
                                <DetailField icon={Phone} label="Mobile Number" value={spouse.mobileNumber || spouse.phone} canCopy />
                            </CardContent>
                        </Card>
                    )}

                    {emergencyContacts.length > 0 && (
                        <Card className="border border-rose-200/80 shadow-xs overflow-hidden bg-white">
                            <CardHeader className="bg-rose-50/60 border-b border-rose-100 py-3.5 px-4 sm:px-6">
                                <CardTitle className="text-sm sm:text-base font-bold text-rose-950 flex items-center gap-2">
                                    <Phone className="h-4.5 w-4.5 text-rose-600" />
                                    Emergency Contacts ({emergencyContacts.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {emergencyContacts.map((contact: any, idx: number) => (
                                    <div key={idx} className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-200/70 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-700 font-bold text-sm flex items-center justify-center shrink-0 border border-rose-200">
                                                {contact.name ? contact.name.substring(0, 2).toUpperCase() : "EC"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-slate-900 truncate">
                                                    {contact.name} <span className="text-xs font-semibold text-rose-700">({contact.relation})</span>
                                                </p>
                                                <p className="text-xs font-mono font-medium text-slate-600 mt-0.5">{contact.mobileNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(contact.mobileNumber, "Emergency Contact")}
                                                className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 shadow-2xs"
                                                title="Copy Phone"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                            <a
                                                href={`tel:${contact.mobileNumber}`}
                                                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1 text-xs font-semibold px-2.5"
                                            >
                                                <PhoneCall className="h-3.5 w-3.5" /> Call
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {familyMembers.length > 0 && (
                        <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="h-4.5 w-4.5 text-indigo-600" />
                                    Other Family Members ({familyMembers.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {familyMembers.map((member: any, idx: number) => (
                                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-xs sm:text-sm text-slate-900">
                                                {member.name} <span className="text-xs font-medium text-muted-foreground">({member.relation})</span>
                                            </p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{member.mobileNumber || "No phone listed"}</p>
                                        </div>
                                        {member.age && (
                                            <Badge variant="outline" className="text-xs bg-white text-slate-700 font-semibold px-2">
                                                {member.age} yrs
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* TAB 4: Health & Living */}
                <TabsContent value="health" className="space-y-4 mt-0">
                    <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                <Heart className="h-4.5 w-4.5 text-rose-500" />
                                Health, Medical & Living Arrangement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <DetailField icon={Activity} label="Blood Group" value={citizen.bloodGroup} />
                            <DetailField
                                icon={Heart}
                                label="Chronic Health Conditions"
                                value={Array.isArray(citizen.healthConditions) && citizen.healthConditions.length > 0
                                    ? citizen.healthConditions.join(", ")
                                    : (citizen.healthCondition || "None reported")
                                }
                            />
                            <DetailField icon={Activity} label="Known Allergies" value={citizen.allergies} />
                            <DetailField icon={Stethoscope} label="Regular Doctor" value={citizen.regularDoctor} />
                            <DetailField icon={Phone} label="Doctor Contact Number" value={citizen.doctorContact} canCopy />
                            <DetailField icon={Building} label="Hospital Preference" value={citizen.emergencyHospitalPreference} />
                            <DetailField icon={FileText} label="Health Insurance Provider" value={citizen.healthInsurance} />
                            <DetailField icon={Activity} label="Mobility Constraints" value={citizen.mobilityConstraints || citizen.mobilityStatus} />
                            <DetailField icon={Home} label="Living Arrangement" value={citizen.livingArrangement} />
                        </CardContent>
                    </Card>

                    {householdHelpers.length > 0 && (
                        <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                    <UserCheck className="h-4.5 w-4.5 text-indigo-600" />
                                    Domestic Helpers & Caregivers ({householdHelpers.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {householdHelpers.map((helper: any, idx: number) => (
                                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-xs sm:text-sm text-slate-900">
                                                {helper.name || helper.fullName} <span className="text-xs text-indigo-700 font-semibold">({helper.role || helper.helperType || "Domestic Help"})</span>
                                            </p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{helper.mobileNumber || "No phone"}</p>
                                            {helper.agencyName && <p className="text-[11px] text-slate-400 mt-0.5">Agency: {helper.agencyName}</p>}
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "text-xs font-bold px-2 py-0.5",
                                            helper.isVerified ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-amber-50 text-amber-800 border-amber-300"
                                        )}>
                                            {helper.isVerified ? "Verified" : "Pending Check"}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* TAB 5: Submitted Documents */}
                <TabsContent value="documents" className="space-y-4 mt-0">
                    <Card className="border border-slate-200/90 shadow-xs overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-4 sm:px-6">
                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                                Submitted Identity & Address Proofs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {citizen.addressProofUrl ? (
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700 border border-emerald-200">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Address Proof</p>
                                            <p className="text-xs text-muted-foreground">Permanent residential document</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => apiClient.viewDocument(citizen.addressProofUrl)}
                                        className="text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold gap-1"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> Preview
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-muted-foreground">
                                    No Address Proof Uploaded
                                </div>
                            )}

                            {citizen.idProofUrl ? (
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-100 rounded-lg text-blue-700 border border-blue-200">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Identity Proof</p>
                                            <p className="text-xs text-muted-foreground">Aadhaar / Voter ID proof</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => apiClient.viewDocument(citizen.idProofUrl)}
                                        className="text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold gap-1"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> Preview
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-muted-foreground">
                                    No ID Proof Uploaded
                                </div>
                            )}

                            {citizen.disabilityCertificateUrl && (
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 sm:col-span-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-amber-100 rounded-lg text-amber-700 border border-amber-200">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Disability Certificate</p>
                                            <p className="text-xs text-muted-foreground">Medical board certificate</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => apiClient.viewDocument(citizen.disabilityCertificateUrl)}
                                        className="text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold gap-1"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> Preview
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

