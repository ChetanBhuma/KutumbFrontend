
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDERS = {
    ADDRESS: 'Pending Update',
    PINCODE: '000000',
    GENDER: 'Unknown',
    NAME: 'Unknown'
};

async function checkProfile(mobileNumber: string) {
    console.log(`Checking profile for mobile: ${mobileNumber}`);
    const citizen = await prisma.seniorCitizen.findUnique({
        where: { mobileNumber },
    });

    if (!citizen) {
        console.log('CITIZEN NOT FOUND');
        return;
    }

    console.log('--- CITIZEN DATA ---');
    console.log('ID:', citizen.id);
    console.log('FullName:', citizen.fullName);
    console.log('DOB:', citizen.dateOfBirth);
    console.log('PermanentAddress:', citizen.permanentAddress);
    console.log('PinCode:', citizen.pinCode);
    console.log('Gender:', citizen.gender);
    console.log('--------------------');

    const checks = {
        hasName: !!(citizen.fullName && citizen.fullName !== PLACEHOLDERS.NAME),
        hasDOB: !!citizen.dateOfBirth,
        hasAddress: !!(citizen.permanentAddress && citizen.permanentAddress !== PLACEHOLDERS.ADDRESS),
        hasPincode: !!(citizen.pinCode && citizen.pinCode !== PLACEHOLDERS.PINCODE),
        hasGender: !!(citizen.gender && citizen.gender !== PLACEHOLDERS.GENDER)
    };

    console.log('--- VALIDATION RESULTS ---');
    console.log('1. Name Valid:', checks.hasName);
    console.log('2. DOB Valid:', checks.hasDOB);
    console.log('3. Address Valid:', checks.hasAddress, `(Value: "${citizen.permanentAddress}")`);
    console.log('4. Pincode Valid:', checks.hasPincode, `(Value: "${citizen.pinCode}")`);
    console.log('5. Gender Valid:', checks.hasGender, `(Value: "${citizen.gender}")`);

    const isComplete = Object.values(checks).every(Boolean);
    console.log('--------------------------');
    console.log('FINAL RESULT (isProfileComplete):', isComplete);

    // Check if the update is actually happening (dirty hack check)
    if (!isComplete) {
       console.log('RECOMMENDATION: Fix the failing field above.');
    }
}

// User's mobile from metadata
checkProfile('9876543230')
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
