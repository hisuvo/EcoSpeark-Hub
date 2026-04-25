import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  APP_NAME: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  FRONTEND_URL: string;
  EMAIL_SENDER: {
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_FROM: string;
  };
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  STRIPE: {
    SECRET_KEY: string;
    WEBHOOK_SECRET: string;
  };
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}

const loadEnvVariables = (): EnvConfig => {
  const env = process.env;

  const requireEnvVariable = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "FRONTEND_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ];

  const missingVariables: string[] = [];

  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      missingVariables.push(variable);
    }
  });

  if (missingVariables.length > 0) {
    const errorMsg = `❌ Missing Environment Variables: ${missingVariables.join(", ")}. Please add them to your .env file or Vercel Project Settings.`;
    console.error(errorMsg);
    // Only throw if we are missing critical variables like DATABASE_URL
    if (missingVariables.includes("DATABASE_URL") || missingVariables.includes("BETTER_AUTH_SECRET")) {
      throw new Error(errorMsg);
    }
  }

  return {
    NODE_ENV: (env.NODE_ENV as string) || "development",
    APP_NAME: (env.APP_NAME as string) || "EcoSpark",
    PORT: (env.PORT as string) || "5000",
    DATABASE_URL: env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL as string,
    ACCESS_TOKEN_SECRET: (env.ACCESS_TOKEN_SECRET as string) || "secret",
    ACCESS_TOKEN_EXPIRES_IN: (env.ACCESS_TOKEN_EXPIRES_IN as string) || "1d",
    REFRESH_TOKEN_SECRET: (env.REFRESH_TOKEN_SECRET as string) || "refresh_secret",
    REFRESH_TOKEN_EXPIRES_IN: (env.REFRESH_TOKEN_EXPIRES_IN as string) || "7d",
    FRONTEND_URL: env.FRONTEND_URL as string,
    EMAIL_SENDER: {
      SMTP_USER: env.EMAIL_SENDER_SMTP_USER as string,
      SMTP_PASS: env.EMAIL_SENDER_SMTP_PASS as string,
      SMTP_HOST: env.EMAIL_SENDER_SMTP_HOST as string,
      SMTP_PORT: env.EMAIL_SENDER_SMTP_PORT as string,
      SMTP_FROM: env.EMAIL_SENDER_SMTP_FROM as string,
    },
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    STRIPE: {
      SECRET_KEY: env.STRIPE_SECRET_KEY as string,
      WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET as string,
    },
    ADMIN_EMAIL: env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD as string,
  };
};

export const envVars = loadEnvVariables();
