import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@omari.internal" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@omari.internal",
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.itemType.createMany({
    data: [
      { name: "Visa Classic", code: "VISA-STD", isActive: true },
      { name: "Visa Premium", code: "VISA-PRM", isActive: true },
      { name: "Mastercard Business", code: "MC-BIZ", isActive: false },
    ],
    skipDuplicates: true,
  });

  await prisma.itemType.createMany({
    data: [
      { name: "Office Desk", code: "DESK-OFC", isActive: true },
      { name: "Ergonomic Chair", code: "CHAIR-ERG", isActive: true },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed", { adminId: admin.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
