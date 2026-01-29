"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    User, MapPin, Phone, Calendar, Heart, AlertTriangle,
    FileText, Shield, Home, Users
} from "lucide-react"
import { format } from "date-fns"
import apiClient from "@/lib/api-client"

interface DetailViewProps {
    registration: any
}

export function DetailView({ registration }: DetailViewProps) {
    const citizen = registration.citizen || {}

    const InfoItem = ({ icon: Icon, label, value }: any) => (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-sm text-slate-900 font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Personal Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-500" />
                        Personal Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem icon={User} label="Full Name" value={citizen.fullName} />
                    <InfoItem
                        icon={Calendar}
                        label="Date of Birth"
                        value={citizen.dateOfBirth ? `${format(new Date(citizen.dateOfBirth), 'dd MMM yyyy')} (${citizen.age} yrs)` : 'N/A'}
                    />
                    <InfoItem icon={Users} label="Gender" value={citizen.gender} />
                    <InfoItem icon={Phone} label="Mobile Number" value={registration.mobileNumber} />
                    <div className="col-span-2">
                        <InfoItem icon={MapPin} label="Permanent Address" value={citizen.permanentAddress} />
                    </div>
                </CardContent>
            </Card>

            {/* Police Jurisdiction & Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Jurisdiction & Risk
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem
                        icon={Home}
                        label="Police Station"
                        value={citizen.policeStationName || citizen.policeStation?.name}
                    />
                    <InfoItem
                        icon={Shield}
                        label="Beat"
                        value={citizen.beatName || citizen.beat?.name}
                    />

                    <div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-muted-foreground">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Vulnerability Level</p>
                                <Badge className={
                                    citizen.vulnerabilityLevel === 'High' ? 'bg-red-100 text-red-800' :
                                        citizen.vulnerabilityLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                }>
                                    {citizen.vulnerabilityLevel || 'Unknown'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-muted-foreground">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">ID Verification Status</p>
                                <Badge variant="outline">
                                    {citizen.idVerificationStatus || 'Pending'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contacts */}
            {citizen.emergencyContacts && citizen.emergencyContacts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Phone className="h-5 w-5 text-indigo-500" />
                            Emergency Contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {citizen.emergencyContacts.map((contact: any, i: number) => (
                            <div key={i} className={`py-2 ${i !== 0 ? 'border-t' : ''}`}>
                                <p className="font-medium">{contact.name} <span className="text-xs text-muted-foreground">({contact.relation})</span></p>
                                <p className="text-sm text-slate-600">{contact.mobileNumber}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Health Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="h-5 w-5 text-indigo-500" />
                        Health & Living
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem icon={Heart} label="Health Condition" value={citizen.healthCondition} />
                    <InfoItem icon={Home} label="Living Arrangement" value={citizen.livingArrangement} />
                    <InfoItem icon={Users} label="Mobility Status" value={citizen.mobilityStatus} />
                    <InfoItem icon={FileText} label="Blood Group" value={citizen.bloodGroup} />
                </CardContent>
            </Card>

            {/* Documents */}
            {(citizen.addressProofUrl || citizen.idProofUrl) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {citizen.addressProofUrl && (
                            <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Address Proof</p>
                                        <p className="text-xs text-muted-foreground">Verified Document</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => apiClient.viewDocument(citizen.addressProofUrl)}
                                    className="text-xs bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                    Preview
                                </button>
                            </div>
                        )}
                        {citizen.idProofUrl && (
                            <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">ID Proof</p>
                                        <p className="text-xs text-muted-foreground">Identity Document</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => apiClient.viewDocument(citizen.idProofUrl)}
                                    className="text-xs bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                    Preview
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
