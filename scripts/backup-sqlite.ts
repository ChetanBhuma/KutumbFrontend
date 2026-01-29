import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function backup() {
  console.log('Starting backup...');

  const data: any = {};

  // Get all model names from Prisma
  // Note: We'll hardcode the models we know about to be safe and ordered
  const models = [
    'User',
    'Role',
    'Permission', // Assuming this exists based on context, if not catch error
    'SeniorCitizen',
    'PoliceStation',
    'BeatOfficer',
    'Visit',
    'SOSAlert',
    // Add other relevant models if they exist in schema.prisma
    // Checking schema.prisma content provided earlier:
    // SeniorCitizen, PoliceStation, BeatOfficer, Visit, SOSAlert, User.
    // Role is likely an enum or string in User, but if there's a Role model (mentioned in other tasks), we should check.
    // The previously viewed schema.prisma (lines 102-120) showed Role as a String field, but conservation history mentions Role model.
    // I will try to fetch generic tables if possible, but safer to stick to known models.
  ];

  // Let's check the schema again to be sure about models
  // For now I'll stick to the ones visible in the `view_file` output I saw earlier.
  // Actually, I should probably inspect `Prisma.dmmf` if I wanted to be dynamic, but let's just dump the main ones.
  // Wait, I recall a "Role" conversation. Let's check if Role exists in the schema I read.
  // The schema I read in Step 110 (lines 13-121) shows:
  // SeniorCitizen, PoliceStation, BeatOfficer, Visit, SOSAlert, User.
  // User has `role String`.
  // However, conversation history says "Locating the Role model definition... Adding a dataScopeLevel field".
  // This implies there MIGHT be a Role model in a separate file or I missed it.
  // Let me re-read the schema really quick or just dump what I know.
  // If I missed reading the top of the schema file?
  // Step 110 showed lines 1-121. It looks complete.
  // Maybe the `Role` model was added recently and I didn't see it?
  // I will just dump the models I see in the schema: SeniorCitizen, PoliceStation, BeatOfficer, Visit, SOSAlert, User.
  // If there are others, I'll add them.

  try {
     data.SeniorCitizen = await prisma.seniorCitizen.findMany();
     console.log(`Backed up ${data.SeniorCitizen.length} SeniorCitizen records`);
  } catch (e) { console.error('Error backing up SeniorCitizen', e); }

  try {
     data.PoliceStation = await prisma.policeStation.findMany();
     console.log(`Backed up ${data.PoliceStation.length} PoliceStation records`);
  } catch (e) { console.error('Error backing up PoliceStation', e); }

  try {
     data.BeatOfficer = await prisma.beatOfficer.findMany();
     console.log(`Backed up ${data.BeatOfficer.length} BeatOfficer records`);
  } catch (e) { console.error('Error backing up BeatOfficer', e); }

  try {
     data.Visit = await prisma.visit.findMany();
     console.log(`Backed up ${data.Visit.length} Visit records`);
  } catch (e) { console.error('Error backing up Visit', e); }

  try {
     data.SOSAlert = await prisma.sOSAlert.findMany(); // Prisma capitalizes oddly sometimes
     console.log(`Backed up ${data.SOSAlert.length} SOSAlert records`);
  } catch (e) {
      try {
        data.SOSAlert = await prisma.sOSAlert.findMany();
      } catch (e2) {
          console.log("Could not backup SOSAlert (naming might vary)");
      }
  }

  try {
     data.User = await prisma.user.findMany();
     console.log(`Backed up ${data.User.length} User records`);
  } catch (e) { console.error('Error backing up User', e); }

  // Check for Role model just in case
  try {
      // @ts-ignore
      if (prisma.role) {
          // @ts-ignore
          data.Role = await prisma.role.findMany();
          console.log(`Backed up ${data.Role.length} Role records`);
      }
  } catch (e) {}

  const backupDir = path.join(__dirname, '../backup');
  await fs.mkdir(backupDir, { recursive: true });

  const outputPath = path.join(backupDir, 'data-snapshot.json');
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2));

  console.log(`Backup completed to ${outputPath}`);
}

backup()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
