import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// Use a client specifically for the local DB
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:root@localhost:5432/delhi_police_db?schema=public"
        }
    }
});

async function backup() {
  console.log('Connecting to local PostgreSQL (delhi_police_db)...');

  const data: any = {};

  try {
      // Try to dump key tables from the large schema
      // Models: User, Role, SeniorCitizen, PoliceStation, BeatOfficer, Visit, etc.

      const tables = [
          'User', 'Role', 'Permission', 'SeniorCitizen', 'PoliceStation',
          'BeatOfficer', 'Beat', 'Range', 'District', 'SubDivision',
          'Visit', 'SOSAlert', 'AuditLog', 'Designation', 'RiskFactor',
          'LivingArrangement', 'MaritalStatus', 'HealthCondition',
          'EmergencyContact', 'FamilyMember', 'HouseholdHelp',
          'Document', 'MedicalHistory', 'ServiceRequest', 'VisitRequest',
          // Add others as needed
      ];

      for (const table of tables) {
          try {
              // @ts-ignore
              if (prisma[table.charAt(0).toLowerCase() + table.slice(1)]) {
                 // @ts-ignore
                 const records = await prisma[table.charAt(0).toLowerCase() + table.slice(1)].findMany();
                 data[table] = records;
                 console.log(`Backed up ${records.length} ${table} records`);
              }
          } catch(e: any) {
              console.log(`Skipped ${table}: ${e.message.split('\n')[0]}`);
          }
      }

      const backupDir = path.join(__dirname, '../backup');
      await fs.mkdir(backupDir, { recursive: true });

      const outputPath = path.join(backupDir, 'full-data-snapshot.json');
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2));

      console.log(`Full backup completed to ${outputPath}`);

  } catch (e) {
      console.error('Backup failed:', e);
  } finally {
      await prisma.$disconnect();
  }
}

backup();
