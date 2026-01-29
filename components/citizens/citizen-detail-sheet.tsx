import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Navigation, User, FileText, AlertTriangle } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { format } from 'date-fns';

interface CitizenDetailSheetProps {
    citizen: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CitizenDetailSheet({ citizen, open, onOpenChange }: CitizenDetailSheetProps) {
    if (!citizen) return null;

    const getVulnerabilityColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Citizen Details</SheetTitle>
                    <SheetDescription>
                        {citizen.srCitizenUniqueId || 'ID: N/A'} · Registered {citizen.createdAt ? format(new Date(citizen.createdAt), 'PP') : ''}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Citizen Profile */}
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={citizen.photoUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                                {citizen.fullName?.charAt(0) ?? 'SC'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl">{citizen.fullName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Phone className="h-3 w-3" />
                                <span>{citizen.mobileNumber}</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{citizen.permanentAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status & Vulnerability */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Vulnerability</p>
                            <Badge variant={getVulnerabilityColor(citizen.vulnerabilityLevel)}>
                                {citizen.vulnerabilityLevel || 'Unknown'}
                            </Badge>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Verification</p>
                            <Badge variant={citizen.idVerificationStatus === 'Approved' ? 'default' : 'outline'}>
                                {citizen.idVerificationStatus || 'Pending'}
                            </Badge>
                        </div>
                    </div>

                    {/* Jurisdiction */}
                    <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" /> Jurisdiction
                        </h4>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs">Police Station</span>
                                <span className="font-medium">{citizen.policeStation?.name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Beat</span>
                                <span className="font-medium">{citizen.beat?.name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">District</span>
                                <span className="font-medium">{citizen.district?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Location
                        </h4>
                        <div className="h-[250px] w-full rounded-lg overflow-hidden border shadow-sm relative">
                            {citizen.gpsLatitude && citizen.gpsLongitude ? (
                                <MapComponent
                                    center={{ lat: citizen.gpsLatitude, lng: citizen.gpsLongitude }}
                                    zoom={15}
                                    markers={[
                                        {
                                            position: { lat: citizen.gpsLatitude, lng: citizen.gpsLongitude },
                                            title: citizen.fullName ?? 'Unknown',
                                        }
                                    ]}
                                    height="100%"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                                    <div className="text-center p-4">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No GPS coordinates available</p>
                                        <p className="text-xs mt-1">{citizen.permanentAddress}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <Button className="w-full gap-2" variant="outline" asChild>
                            <a href={`tel:${citizen.mobileNumber}`}>
                                <Phone className="h-4 w-4" /> Call Citizen
                            </a>
                        </Button>
                        <Button className="w-full gap-2" asChild>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${citizen.gpsLatitude || encodeURIComponent(citizen.permanentAddress || '')},${citizen.gpsLongitude || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Navigation className="h-4 w-4" /> Get Directions
                            </a>
                        </Button>
                    </div>

                    {/* Notes if any */}
                    {citizen.visitRemarks && (
                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                            <p className="font-bold mb-1 flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Remarks
                            </p>
                            {citizen.visitRemarks}
                        </div>
                    )}
                </div>
                <SheetFooter className="mt-6">
                    <Button className="w-full" variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
