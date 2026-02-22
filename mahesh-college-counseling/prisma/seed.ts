import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  let cohort = await prisma.cohort.findFirst({
    where: { name: "Current Cohort" },
  });
  if (!cohort) {
    cohort = await prisma.cohort.create({
      data: { name: "Current Cohort", maxSeats: 20 },
    });
    console.log("Cohort created:", cohort.name);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@maheshcollegecounseling.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hash,
      name: "Admin",
      role: "admin",
    },
  });
  console.log("Admin user created:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
