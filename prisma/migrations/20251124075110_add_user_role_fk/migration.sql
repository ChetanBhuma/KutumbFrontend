-- CreateTable
CREATE TABLE "SeniorCitizen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "district" TEXT,
    "aadharNumber" TEXT,
    "photoUrl" TEXT,
    "medicalConditions" TEXT,
    "emergencyContact" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "policeStationId" TEXT,
    "beatOfficerId" TEXT,
    CONSTRAINT "SeniorCitizen_policeStationId_fkey" FOREIGN KEY ("policeStationId") REFERENCES "PoliceStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SeniorCitizen_beatOfficerId_fkey" FOREIGN KEY ("beatOfficerId") REFERENCES "BeatOfficer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PoliceStation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jurisdiction" TEXT
);

-- CreateTable
CREATE TABLE "BeatOfficer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "policeStationId" TEXT NOT NULL,
    CONSTRAINT "BeatOfficer_policeStationId_fkey" FOREIGN KEY ("policeStationId") REFERENCES "PoliceStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "citizenId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Visit_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "SeniorCitizen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "BeatOfficer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SOSAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" REAL,
    "longitude" REAL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "citizenId" TEXT NOT NULL,
    CONSTRAINT "SOSAlert_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "SeniorCitizen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SeniorCitizen_phone_key" ON "SeniorCitizen"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "BeatOfficer_phone_key" ON "BeatOfficer"("phone");
