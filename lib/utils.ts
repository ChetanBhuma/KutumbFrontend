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
        data.dateOfBirth || data.dob,
        data.gender,
        data.maritalStatus,
        data.religion,
        data.occupation,
        data.photoUrl,

        // Contact
        data.email,
        data.whatsappNumber, // Optional but contributes to completeness

        // Address
        data.permanentAddress || data.addressLine1,
        data.districtId || data.District?.id || data.district,
        data.policeStationId || data.PoliceStation?.id || data.policeStation,
        data.pinCode || data.pincode,
        data.state,
        data.city,

        // Family & Living
        data.residingWith,
        data.numberOfChildren, // Can be "0" which is truthy if string, but falsy if empty string.
                               // If it's number 0, Boolean(0) is false.
                               // We should check for non-null/non-undefined/non-empty-string specifically if 0 is valid.
                               // However, usually "Filled" means provided.
                               // Let's assume standard Boolean check is fine for strings, but for numbers we might need care.
                               // In the form `numberOfChildren` is a string.

        // Lists (At least one entry implies "filled" section)
        (data.emergencyContacts?.length > 0) || (data.EmergencyContact?.length > 0),
        (data.familyMembers?.length > 0) || (data.FamilyMember?.length > 0),

        // Health
        data.bloodGroup,
        data.mobilityStatus,
        data.regularDoctor,

        // Documents
        data.addressProofUrl
    ];

    const filledCount = fields.filter((f) => {
        // Handle number 0 as valid input for fields like numberOfChildren if converted to number elsewhere
        // But here most are strings.
        if (typeof f === 'number') return true;
        if (typeof f === 'boolean') return f; // true is filled, false is ... empty?
                                              // Boolean fields like `physicalDisability` are false by default.
                                              // If checked (true), it's "filled" with info?
                                              // Or is the *presence* of a decision the fill?
                                              // For now, standard truthy check is safest for mostly text fields.
        return Boolean(f);
    }).length;

    return fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 0;
};
