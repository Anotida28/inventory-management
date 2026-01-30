// test-connection.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log(`✅ Users in database: ${userCount}`);
    
    // Test item types
    const itemTypes = await prisma.itemType.findMany();
    console.log(`✅ Item types in database: ${itemTypes.length}`);
    
    // Test a simple query
    const admin = await prisma.user.findFirst({
      where: { email: "admin@omari.internal" }
    });
    console.log(`✅ Admin user found: ${admin?.name}`);
    
    console.log("\n🎉 Database connection successful!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();