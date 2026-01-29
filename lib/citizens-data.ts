import type { Citizen } from "@/types/citizen"

export const mockCitizens: Citizen[] = [
  {
    id: "CTZ001",
    personalInfo: {
      firstName: "Rajesh",
      lastName: "Kumar",
      middleName: "Singh",
      dateOfBirth: "1945-03-15",
      gender: "MALE",
      nationality: "Indian",
      religion: "Hindu",
      caste: "General",
      maritalStatus: "MARRIED",
    },
    contactInfo: {
      phone: "+91-9876543210",
      alternatePhone: "+91-9876543211",
      email: "rajesh.kumar@email.com",
      address: {
        street: "123 Connaught Place",
        city: "New Delhi",
        district: "Central Delhi",
        state: "Delhi",
        pincode: "110001",
        landmark: "Near Central Park",
      },
    },
    identification: {
      aadharNumber: "1234-5678-9012",
      panNumber: "ABCDE1234F",
      voterIdNumber: "ABC1234567",
      drivingLicenseNumber: "DL01-20230001234",
    },
    physicalAttributes: {
      height: 175,
      weight: 70,
      eyeColor: "Brown",
      hairColor: "Black",
      complexion: "Fair",
      identificationMarks: ["Scar on left hand", "Mole on right cheek"],
    },
    photos: {
      profilePhoto: "/indian-man-profile.png",
      additionalPhotos: ["/id-photo-front-view.png", "/id-photo-side-view.png"],
    },
    riskScore: {
      score: 25,
      level: "LOW",
      factors: ["Clean criminal record", "Stable employment", "Community ties"],
      lastUpdated: "2024-01-15T10:30:00Z",
    },
    records: {
      criminalHistory: [],
      complaints: [
        {
          id: "CMP001",
          complaintNumber: "FIR-2023-001234",
          type: "BY",
          description: "Theft of mobile phone",
          status: "CLOSED",
          date: "2023-06-15",
          officerInCharge: "Inspector Sharma",
        },
      ],
      interactions: [
        {
          id: "INT001",
          type: "VERIFICATION",
          description: "Address verification for passport",
          date: "2024-01-10",
          officer: "Constable Patel",
          location: "Residence",
        },
      ],
    },
    metadata: {
      createdBy: "Officer Smith",
      createdAt: "2024-01-01T09:00:00Z",
      updatedBy: "Officer Smith",
      updatedAt: "2024-01-15T10:30:00Z",
      stationId: "station-1",
      verificationStatus: "VERIFIED",
    },
  },
  {
    id: "CTZ002",
    personalInfo: {
      firstName: "Priya",
      lastName: "Sharma",
      dateOfBirth: "1950-07-22",
      gender: "FEMALE",
      nationality: "Indian",
      religion: "Hindu",
      maritalStatus: "WIDOWED",
    },
    contactInfo: {
      phone: "+91-9876543220",
      email: "priya.sharma@email.com",
      address: {
        street: "456 Karol Bagh",
        city: "New Delhi",
        district: "Central Delhi",
        state: "Delhi",
        pincode: "110005",
        landmark: "Near Metro Station",
      },
    },
    identification: {
      aadharNumber: "2345-6789-0123",
      panNumber: "BCDEF2345G",
      voterIdNumber: "BCD2345678",
    },
    physicalAttributes: {
      height: 162,
      weight: 55,
      eyeColor: "Brown",
      hairColor: "Grey",
      complexion: "Wheatish",
    },
    photos: {
      profilePhoto: "/indian-woman-profile-photo.png",
    },
    riskScore: {
      score: 15,
      level: "LOW",
      factors: ["No criminal history", "Senior citizen", "Good community standing"],
      lastUpdated: "2024-01-20T14:15:00Z",
    },
    records: {
      criminalHistory: [],
      complaints: [],
      interactions: [
        {
          id: "INT002",
          type: "INQUIRY",
          description: "Witness statement for traffic accident",
          date: "2024-01-18",
          officer: "Inspector Kumar",
          location: "Accident site",
        },
      ],
    },
    metadata: {
      createdBy: "Officer Johnson",
      createdAt: "2024-01-05T11:30:00Z",
      updatedBy: "Officer Johnson",
      updatedAt: "2024-01-20T14:15:00Z",
      stationId: "station-1",
      verificationStatus: "VERIFIED",
    },
  },
  {
    id: "CTZ003",
    personalInfo: {
      firstName: "Mohammed",
      lastName: "Ali",
      dateOfBirth: "1948-11-08",
      gender: "MALE",
      nationality: "Indian",
      religion: "Islam",
      maritalStatus: "MARRIED",
    },
    contactInfo: {
      phone: "+91-9876543230",
      address: {
        street: "789 Chandni Chowk",
        city: "New Delhi",
        district: "North Delhi",
        state: "Delhi",
        pincode: "110006",
        landmark: "Near Jama Masjid",
      },
    },
    identification: {
      aadharNumber: "3456-7890-1234",
      panNumber: "CDEFG3456H",
    },
    physicalAttributes: {
      height: 180,
      weight: 75,
      eyeColor: "Brown",
      hairColor: "Grey",
      complexion: "Dark",
      identificationMarks: ["Beard", "Walking stick"],
    },
    photos: {
      profilePhoto: "/indian-muslim-man-profile-photo.png",
    },
    riskScore: {
      score: 35,
      level: "LOW",
      factors: ["Senior citizen", "Health concerns", "Lives alone"],
      lastUpdated: "2024-01-25T16:45:00Z",
    },
    records: {
      criminalHistory: [],
      complaints: [
        {
          id: "CMP002",
          complaintNumber: "FIR-2023-002345",
          type: "BY",
          description: "Elder abuse complaint",
          status: "INVESTIGATING",
          date: "2023-09-10",
          officerInCharge: "Inspector Gupta",
        },
      ],
      interactions: [
        {
          id: "INT003",
          type: "WELFARE_CHECK",
          description: "Routine welfare check for senior citizen",
          date: "2024-01-22",
          officer: "Constable Singh",
          location: "Residence",
        },
      ],
    },
    metadata: {
      createdBy: "Officer Brown",
      createdAt: "2023-12-15T08:45:00Z",
      updatedBy: "Officer Brown",
      updatedAt: "2024-01-25T16:45:00Z",
      stationId: "station-1",
      verificationStatus: "VERIFIED",
    },
  },
]

export function getCitizenById(id: string): Citizen | undefined {
  return mockCitizens.find((citizen) => citizen.id === id)
}

export function searchCitizens(query: string): Citizen[] {
  if (!query.trim()) return mockCitizens

  const searchTerm = query.toLowerCase()
  return mockCitizens.filter(
    (citizen) =>
      citizen.personalInfo.firstName.toLowerCase().includes(searchTerm) ||
      citizen.personalInfo.lastName.toLowerCase().includes(searchTerm) ||
      citizen.contactInfo.phone.includes(searchTerm) ||
      citizen.identification.aadharNumber?.includes(searchTerm) ||
      citizen.id.toLowerCase().includes(searchTerm),
  )
}

export function filterCitizens(citizens: Citizen[], filters: any): Citizen[] {
  return citizens.filter((citizen) => {
    if (filters.gender && citizen.personalInfo.gender !== filters.gender) return false
    if (filters.riskLevel && citizen.riskScore.level !== filters.riskLevel) return false
    if (filters.verificationStatus && citizen.metadata.verificationStatus !== filters.verificationStatus) return false
    if (filters.district && citizen.contactInfo.address.district !== filters.district) return false
    return true
  })
}
