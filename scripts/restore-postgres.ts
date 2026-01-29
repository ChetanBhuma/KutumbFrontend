import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function restore() {
  console.log('Starting restore to PostgreSQL...');

  const backupPath = path.join(__dirname, '../backup/data-snapshot.json');
  const data = JSON.parse(await fs.readFile(backupPath, 'utf-8'));

  // Restore Order:
  // 1. PoliceStation
  // 2. BeatOfficer
  // 3. SeniorCitizen
  // 4. User
  // 5. Visit
  // 6. SOSAlert

  // Note: We use createMany or Promise.all with create to upsert/create.
  // Since it's a fresh DB (db push cleared it or it's empty), create is fine.
  // We should handle potential errors or existing data if re-run.

  const restoreTable = async (modelName: string, records: any[]) => {
      if (!records || records.length === 0) return;
      console.log(`Restoring ${records.length} ${modelName} records...`);

      // We will loop and create individually to handle errors gracefully,
      // or use createMany if supported and no relations are nested.
      // However, typical backup json has raw fields. createMany is safest for raw data.

      // @ts-ignore
      const model = prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)];

      if (!model) {
          console.error(`Model ${modelName} not found on prisma client.`);
          return;
      }

      // createMany is not supported by all providers in all versions, but Postgres supports it.
      // However, createMany doesn't support relations.
      // Our backup is just raw table data (IDs and FKs are strings).
      // So createMany is perfect.
      try {
        await model.createMany({
            data: records,
            skipDuplicates: true
        });
        console.log(`Restored ${modelName}.`);
      } catch (e: any) {
          console.log(`Error utilizing createMany for ${modelName}, trying individual inserts: ${e.message}`);
          let success = 0;
          for (const r of records) {
              try {
                  await model.create({ data: r });
                  success++;
              } catch (err: any) {
                  // Ignore unique constraint violation if re-running
                 // console.error(`Failed to restore record: ${err.message}`);
              }
          }
          console.log(`Restored ${success}/${records.length} ${modelName} individually.`);
      }
  };

  // PoliceStation
  if (data.PoliceStation) await restoreTable('PoliceStation', data.PoliceStation);

  // BeatOfficer
  if (data.BeatOfficer) await restoreTable('BeatOfficer', data.BeatOfficer);

  // SeniorCitizen
  if (data.SeniorCitizen) await restoreTable('SeniorCitizen', data.SeniorCitizen);

  // Role (if it exists)
  if (data.Role) await restoreTable('Role', data.Role);

  // User
  if (data.User) await restoreTable('User', data.User);

  // Visit
  if (data.Visit) await restoreTable('Visit', data.Visit);

  // SOSAlert
  // Handle capitalization quirks: Prisma usually camelCases model names.
  // schema says: model SOSAlert -> prisma.sOSAlert
  if (data.SOSAlert) {
      console.log(`Restoring ${data.SOSAlert.length} SOSAlert records...`);
      try {
          await prisma.sOSAlert.createMany({ data: data.SOSAlert, skipDuplicates: true });
          console.log('Restored SOSAlert.');
      } catch (e) {
          console.log('Error creating items for SOSAlert, trying loop');
            for (const r of data.SOSAlert) {
              try { await prisma.sOSAlert.create({ data: r }); } catch {}
          }
      }
  }

  console.log('Restore completed.');
}

restore()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
