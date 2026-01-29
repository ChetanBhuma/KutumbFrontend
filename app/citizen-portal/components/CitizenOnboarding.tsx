'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, FileText, User } from 'lucide-react';

const STEPS = [
    {
        title: "Welcome to Kutumb",
        description: "Your dedicated portal for safety and assistance from the Delhi Police Senior Citizen Cell.",
        icon: null
    },
    {
        title: "Emergency SOS",
        description: "In case of emergency, use the SOS button to instantly alert the police and your contacts.",
        icon: <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
    },
    {
        title: "Request Visits",
        description: "Schedule regular welfare checks or specific assistance visits from your beat officer.",
        icon: <Calendar className="h-12 w-12 text-blue-500 mb-4" />
    },
    {
        title: "Manage Documents",
        description: "Keep your important medical and ID documents safe and accessible in one place.",
        icon: <FileText className="h-12 w-12 text-green-500 mb-4" />
    },
    {
        title: "Profile & Health",
        description: "Keep your profile updated so we can provide the best assistance when needed.",
        icon: <User className="h-12 w-12 text-purple-500 mb-4" />
    }
];

export function CitizenOnboarding() {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('citizen_tour_completed');
        if (!hasSeenTour) {
            // Small delay to allow page to load
            const timer = setTimeout(() => setOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('citizen_tour_completed', 'true');
        setOpen(false);
    };

    const step = STEPS[currentStep];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleComplete()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center">
                        {step.icon}
                    </div>
                    <DialogTitle className="text-center text-xl">{step.title}</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {step.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center gap-1 py-4">
                    {STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 w-2 rounded-full transition-colors ${index === currentStep ? 'bg-blue-600' : 'bg-slate-200'}`}
                        />
                    ))}
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={handleComplete}>
                        Skip
                    </Button>
                    <Button onClick={handleNext}>
                        {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
