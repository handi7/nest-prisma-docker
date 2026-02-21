import { PrismaClient } from "generated/prisma/client";
import { PERMISSIONS, PERMISSION_CODE_REGEX } from "src/config/permissions";

async function PermissionsSeeder(prisma: PrismaClient) {
  /**
   * 1️⃣ DEV-TIME VALIDATION
   */
  for (const p of PERMISSIONS) {
    if (!PERMISSION_CODE_REGEX.test(p.code)) {
      throw new Error(`❌ Invalid permission code format: ${p.code}`);
    }
  }

  /**
   * 2️⃣ FETCH EXISTING PERMISSIONS
   */
  const existing = await prisma.permission.findMany({
    select: { code: true },
  });

  const existingCodes = new Set(existing.map((p) => p.code));

  /**
   * 3️⃣ FILTER NEW PERMISSIONS
   */
  const permissionsToInsert = PERMISSIONS.filter((p) => !existingCodes.has(p.code));

  /**
   * 4️⃣ INSERT
   */
  if (permissionsToInsert.length > 0) {
    await prisma.permission.createMany({
      data: permissionsToInsert.map((p) => ({
        code: p.code,
        name: p.name,
      })),
      skipDuplicates: true,
    });

    console.log(`✅ Inserted ${permissionsToInsert.length} permissions.`);
  } else {
    console.log("ℹ️ No new permissions to insert.");
  }
}

export default PermissionsSeeder;
