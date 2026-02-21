import { genSalt, hash } from "bcryptjs";
import { PrismaClient } from "generated/prisma/client";
import { SUPER_ADMIN_ROLE } from "src/common/decorators/super-admin.decorator";

async function UsersSeeder(prisma: PrismaClient) {
  const superAdminName = process.env.MAIN_USER_NAME || "Super Admin";
  const superAdminEmail = process.env.MAIN_USER_EMAIL;
  const superAdminPassword = process.env.MAIN_USER_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error("MAIN_USER_EMAIL and MAIN_USER_PASSWORD are required in .env file.");
  }

  // Validate email with regex
  if (!/\S+@\S+\.\S+/.test(superAdminEmail)) {
    throw new Error("Invalid email format for MAIN_USER_EMAIL.");
  }

  const superRole = await prisma.role.findFirst({
    where: { name: SUPER_ADMIN_ROLE },
  });

  if (!superRole) {
    throw new Error(`Role "${SUPER_ADMIN_ROLE}" not found. Seeder aborted.`);
  }

  const superUser = await prisma.user.findFirst({
    where: {
      email: superAdminEmail.toLowerCase(),
      role_id: superRole.id,
    },
  });

  if (superUser) {
    console.info("Super Admin user already exists. Super admin email: " + superUser.email);
    return;
  }

  const salt = await genSalt(10);
  const hashedPassword = await hash(superAdminPassword, salt);

  await prisma.user.create({
    data: {
      name: superAdminName,
      email: superAdminEmail,
      password: hashedPassword,
      role_id: superRole.id,
    },
  });
}

export default UsersSeeder;
