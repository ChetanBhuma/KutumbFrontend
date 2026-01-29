import { PrismaClient } from '@prisma/client'
import { mockCitizens } from '../lib/citizens-data'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Create a default Police Station
    const station = await prisma.policeStation.create({
        data: {
            name: 'Central Delhi Police Station',
            location: 'Connaught Place, New Delhi',
            jurisdiction: 'Central Delhi',
        },
    })

    // Create a default Beat Officer
    const officer = await prisma.beatOfficer.create({
        data: {
            name: 'Inspector Sharma',
            rank: 'Inspector',
            phone: '+91-9876543200',
            email: 'sharma@delhipolice.gov.in',
            policeStationId: station.id,
        },
    })

    for (const citizen of mockCitizens) {
        const { personalInfo, contactInfo, identification, riskScore, metadata, photos } = citizen

        await prisma.seniorCitizen.create({
            data: {
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                dateOfBirth: new Date(personalInfo.dateOfBirth),
                gender: personalInfo.gender,
                phone: contactInfo.phone,
                email: contactInfo.email,
                address: `${contactInfo.address.street}, ${contactInfo.address.city}, ${contactInfo.address.state} - ${contactInfo.address.pincode}`,
                district: contactInfo.address.district,
                aadharNumber: identification.aadharNumber,
                photoUrl: photos.profilePhoto,
                riskLevel: riskScore.level,
                status: metadata.verificationStatus || 'PENDING',
                policeStationId: station.id,
                beatOfficerId: officer.id,
            },
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
