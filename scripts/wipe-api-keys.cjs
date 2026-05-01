"use strict";

/**
 * Dev-only: delete all api_key rows (e.g. after schema changes).
 * Run from repo root with DATABASE_URL set: npm run db:wipe-api-keys
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

(async () => {
  const r = await prisma.apiKey.deleteMany({});
  console.log(`api_keys removed: ${r.count}`);
})()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
