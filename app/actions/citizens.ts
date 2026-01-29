'use server'

import { prisma } from '@/lib/prisma'
import type { Citizen, CitizenFilters } from '@/types/citizen'

export async function getCitizens(filters?: CitizenFilters): Promise<Citizen[]> {
    const where: any = {}

    if (filters?.search) {
        where.OR = [
            { fullName: { contains: filters.search } },
            { mobileNumber: { contains: filters.search } },
            { aadhaarNumber: { contains: filters.search } },
        ]
    }

    if (filters?.gender && filters.gender !== 'all') {
        where.gender = filters.gender
    }

    if (filters?.riskLevel && filters.riskLevel !== 'all') {
        where.vulnerabilityLevel = filters.riskLevel
    }

    if (filters?.verificationStatus && filters.verificationStatus !== 'all') {
        where.idVerificationStatus = filters.verificationStatus
    }

    if (filters?.district) {
        where.districtId = filters.district
    }

    const citizens = await prisma.seniorCitizen.findMany({
        where,
        orderBy: {
            updatedAt: 'desc',
        },
    })

    return citizens.map((c: any) => ({
        id: c.id,
        personalInfo: {
            firstName: c.fullName?.split(' ')[0] || '',
            lastName: c.fullName?.split(' ').slice(1).join(' ') || '',
            dateOfBirth: c.dateOfBirth ? c.dateOfBirth.toISOString().split('T')[0] : '',
            gender: c.gender as any,
            nationality: 'Indian',
            maritalStatus: 'MARRIED',
        },
        contactInfo: {
            phone: c.mobileNumber || '',
            email: c.email || undefined,
            address: {
                street: c.permanentAddress?.split(',')[0] || '',
                city: 'New Delhi',
                district: 'Central Delhi',
                state: 'Delhi',
                pincode: c.pinCode || '',
            },
        },
        identification: {
            aadharNumber: c.aadhaarNumber || undefined,
        },
        physicalAttributes: {},
        photos: {
            profilePhoto: c.photoUrl || undefined,
        },
        riskScore: {
            score: 0,
            level: c.vulnerabilityLevel as any,
            factors: [],
            lastUpdated: c.updatedAt.toISOString(),
        },
        records: {
            criminalHistory: [],
            complaints: [],
            interactions: [],
        },
        metadata: {
            createdBy: 'System',
            createdAt: c.createdAt.toISOString(),
            updatedBy: 'System',
            updatedAt: c.updatedAt.toISOString(),
            stationId: c.policeStationId || '',
            verificationStatus: c.idVerificationStatus as any,
        },
    }))
}
