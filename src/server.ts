import app from "./app";
import dotenv from "dotenv";
import { envVars } from "./app/config/env";
dotenv.config();

const bootstrap = async () => {
  try {
    app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

bootstrap();
