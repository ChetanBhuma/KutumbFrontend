export interface Citizen {
  id: string
  personalInfo: {
    firstName: string
    lastName: string
    middleName?: string
    dateOfBirth: string
    gender: "MALE" | "FEMALE" | "OTHER"
    nationality: string
    religion?: string
    caste?: string
    maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED"
  }
  contactInfo: {
    phone: string
    alternatePhone?: string
    email?: string
    address: {
      street: string
      city: string
      district: string
      state: string
      pincode: string
      landmark?: string
    }
  }
  identification: {
    aadharNumber?: string
    panNumber?: string
    voterIdNumber?: string
    drivingLicenseNumber?: string
    passportNumber?: string
  }
  physicalAttributes: {
    height?: number // in cm
    weight?: number // in kg
    eyeColor?: string
    hairColor?: string
    complexion?: string
    identificationMarks?: string[]
  }
  photos: {
    profilePhoto?: string
    additionalPhotos?: string[]
  }
  riskScore: {
    score: number // 0-100
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    factors: string[]
    lastUpdated: string
  }
  records: {
    criminalHistory: CriminalRecord[]
    complaints: ComplaintRecord[]
    interactions: InteractionRecord[]
  }
  metadata: {
    createdBy: string
    createdAt: string
    updatedBy: string
    updatedAt: string
    stationId: string
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED"
  }
}

export interface CriminalRecord {
  id: string
  caseNumber: string
  charges: string[]
  status: "PENDING" | "CONVICTED" | "ACQUITTED" | "DISMISSED"
  date: string
  court?: string
  sentence?: string
}

export interface ComplaintRecord {
  id: string
  complaintNumber: string
  type: "AGAINST" | "BY"
  description: string
  status: "OPEN" | "CLOSED" | "UNDER_INVESTIGATION"
  date: string
  officerInCharge: string
}

export interface InteractionRecord {
  id: string
  type: "INQUIRY" | "VERIFICATION" | "ARREST" | "QUESTIONING" | "OTHER"
  description: string
  date: string
  officer: string
  location: string
}

export interface CitizenFilters {
  search?: string
  gender?: string
  riskLevel?: string
  verificationStatus?: string
  district?: string
  ageRange?: {
    min: number
    max: number
  }
}

export interface CitizenFormData extends Omit<Citizen, "id" | "metadata" | "riskScore"> {
  riskScore?: Partial<Citizen["riskScore"]>
}
