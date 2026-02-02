"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// seed.ts - UPDATED FOR STRING ENUMS
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding database...");
    const seededUsers = [
        {
            username: "finance",
            password: "finance",
        },
        {
            username: "sales",
            password: "sales",
        },
    ];
    for (const user of seededUsers) {
        const created = await prisma.user.upsert({
            where: { username: user.username },
            update: {
                password: user.password,
            },
            create: {
                username: user.username,
                password: user.password,
            },
        });
        console.log(`Seeded user created/updated: ${created.username}`);
    }
    // Create item types
    const itemTypes = [
        { name: "OMARI-VISA", code: "OMARI-VISA", isActive: true },
        { name: "OMARI-ZIMSWITCH", code: "OMARI-ZIMSWITCH", isActive: true },
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
