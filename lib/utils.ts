import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const normalizeMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) {
        return `+91${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }
    if (digits.length === 13 && digits.startsWith('091')) {
        return `+${digits.slice(1)}`;
    }
    return value;
};

export const calculateProfileCompleteness = (data: any) => {
    if (!data) return 0;

    const fields = [
        // Personal
        data.fullName,
        data.mobileNumber,
        data.dateOfBirth || data.dob, // Handle both key styles
        data.gender,
        data.maritalStatus,
        data.religion,

        // Address
        data.permanentAddress || data.addressLine1,
        data.districtId || data.District?.id || data.district,
        data.policeStationId || data.PoliceStation?.id || data.policeStation,
        data.pinCode || data.pincode,

        // Family & Relations
        data.residingWith,
        (data.emergencyContacts?.length > 0) || (data.FamilyMember?.length > 0) || (data.EmergencyContact?.length > 0),

        // Health
        data.bloodGroup,
        data.mobilityStatus
    ];

    const filledCount = fields.filter(Boolean).length;
    return fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 0;
};
