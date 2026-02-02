// seed.ts - UPDATED FOR STRING ENUMS
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");


  // Create Finance user
  const finance = await prisma.user.upsert({
    where: { username: "finance" },
    update: {},
    create: {
      name: "Finance User",
      username: "finance",
      password: "finance123",
      role: "FINANCE",
      isActive: true,
    },
  });
  console.log(`Finance user created with id: ${finance.id}`);

  // Create Sales user
  const sales = await prisma.user.upsert({
    where: { username: "sales" },
    update: {},
    create: {
      name: "Sales User",
      username: "sales",
      password: "sales123",
      role: "SALES",
      isActive: true,
    },
  });
  console.log(`Sales user created with id: ${sales.id}`);

  // Create item types
  const itemTypes = [
    { name: "Visa Classic", code: "VISA-STD", isActive: true },
    { name: "Visa Premium", code: "VISA-PRM", isActive: true },
    { name: "Mastercard Business", code: "MC-BIZ", isActive: false },
    { name: "Office Desk", code: "DESK-OFC", isActive: true },
    { name: "Ergonomic Chair", code: "CHAIR-ERG", isActive: true },
  ];

  for (const item of itemTypes) {
    try {
      await prisma.itemType.create({
        data: item,
      });
      console.log(`Created: ${item.name}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`Skipped (already exists): ${item.name}`);
      } else {
        console.error(`Error creating ${item.name}:`, error);
      }
    }
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });