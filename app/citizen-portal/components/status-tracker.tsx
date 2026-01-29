
import { Check, Clock, Shield, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusTrackerProps {
    profile: any;
}

export function StatusTracker({ profile }: StatusTrackerProps) {
    // Determine current step
    // Steps: 1. Registration, 2. Profile Submission, 3. Verification, 4. Active

    // Determine current step based on status first, then fields
    const status = profile.status || 'Pending';
    const isSubmitted = ['PENDING_REVIEW', 'APPROVED', 'REJECTED'].includes(status);
    const isVerified = profile.idVerificationStatus === 'Verified' || status === 'APPROVED';

    const hasData = !!(profile.fullName && profile.dateOfBirth && profile.permanentAddress);
    const isProfileComplete = isSubmitted || hasData;

    const steps = [
        {
            id: 1,
            title: 'Registration',
            desc: 'Mobile verified',
            status: 'completed',
            icon: <Check className="h-5 w-5" />
        },
        {
            id: 2,
            title: 'Profile Details',
            desc: 'Submission',
            status: isProfileComplete ? 'completed' : 'current',
            icon: <FileText className="h-5 w-5" />
        },
        {
            id: 3,
            title: 'Police Verification',
            desc: isVerified ? 'Verified' : 'Under Review',
            status: isVerified ? 'completed' : (isProfileComplete ? 'current' : 'pending'),
            icon: <Shield className="h-5 w-5" />
        },
        {
            id: 4,
            title: 'Kutumb Active',
            desc: 'Access all services',
            status: isVerified ? 'completed' : 'pending',
            icon: <Check className="h-5 w-5" />
        }
    ];

    return (
        <Card className="border-slate-200">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Application Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative flex flex-col md:flex-row justify-between w-full">
                    {/* Connecting Lines (Desktop) */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 hidden md:block -z-10" />

                    {steps.map((step, index) => {
                        let colorClass = 'bg-slate-100 text-slate-400 border-slate-200';
                        if (step.status === 'completed') {
                            colorClass = 'bg-green-100 text-green-600 border-green-200 ring-4 ring-green-50';
                        } else if (step.status === 'current') {
                            colorClass = 'bg-blue-100 text-blue-600 border-blue-200 ring-4 ring-blue-50 animate-pulse';
                        }

                        return (
                            <div key={step.id} className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2 relative bg-white md:bg-transparent p-2 md:p-0 rounded-lg">
                                {/* Connector (Mobile) */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-6 top-10 w-0.5 h-10 bg-slate-100 md:hidden" />
                                )}

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${colorClass}`}>
                                    {step.status === 'completed' ? <Check className="h-5 w-5" /> :
                                        step.status === 'current' ? <Clock className="h-5 w-5" /> :
                                            <span className="text-sm font-bold">{step.id}</span>}
                                </div>

                                <div className="flex flex-col md:items-center md:text-center pb-6 md:pb-0">
                                    <span className={`font-semibold text-sm ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</span>
                                    <span className="text-xs text-slate-500">{step.desc}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
