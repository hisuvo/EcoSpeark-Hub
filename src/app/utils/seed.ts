import { Role } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
  try {
    const isAdminExists = await prisma.user.findFirst({
      where: {
        email: envVars.ADMIN_EMAIL,
        role: Role.ADMIN,
      },
    });

    if (isAdminExists) {
      console.log("Admin already exists. Skipping seeding admin.");
      return;
    }

    const adminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL as string,
        password: envVars.ADMIN_PASSWORD as string,
        name: "Admin",
        role: Role.ADMIN,
        needPasswordChange: false,
        rememberMe: false,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: adminUser.user.id,
        },
        data: {
          emailVerified: true,
        },
      });
    });

    const Admin = await prisma.user.findFirst({
      where: {
        email: envVars.ADMIN_EMAIL,
      },
    });

    console.log("Admin Created ", Admin);
  } catch (error) {
    console.error("Error seeding admin: ", error);

    if (envVars.ADMIN_EMAIL) {
      await prisma.user.delete({
        where: {
          email: envVars.ADMIN_EMAIL,
        },
      });
    }
  }
};
