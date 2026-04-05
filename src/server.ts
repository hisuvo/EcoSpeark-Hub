import app from "./app";
import dotenv from "dotenv";
import { envVars } from "./app/config/env";
import { seedAdmin } from "./app/utils/seed";
import { prisma } from "./app/lib/prisma";
dotenv.config();

const bootstrap = async () => {
  try {
    await prisma.$connect();

    await seedAdmin();

    app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

bootstrap();
