"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// seed.ts - UPDATED FOR STRING ENUMS
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding database...");
    // Create admin user
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
    console.log(`Admin user created with id: ${admin.id}`);
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
        }
        catch (error) {
            if (error.code === 'P2002') {
                console.log(`Skipped (already exists): ${item.name}`);
            }
            else {
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
