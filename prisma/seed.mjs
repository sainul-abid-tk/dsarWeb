import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("🌱 Seeding database...");

  const adminPass = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@dsar.local" },
    update: {},
    create: {
      email: "admin@dsar.local",
      password: adminPass,
      role: "admin",
    },
  });

  console.log("✅ Admin user created");

  await prisma.$disconnect();
}

seed().catch(console.error);
