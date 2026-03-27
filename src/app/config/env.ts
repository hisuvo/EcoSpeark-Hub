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
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
}

const loadEnvVariables = (): EnvConfig => {
  const env = process.env;

  const requireEnvVariable = [
    "NODE_ENV",
    "APP_NAME",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRES_IN",
    "FRONTEND_URL",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_FROM",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
  ];

  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      // throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
      throw new Error(
        `Environment variable ${variable} is required but not set in .env file.`,
      );
    }
  });

  return {
    NODE_ENV: env.NODE_ENV as string,
    APP_NAME: env.APP_NAME as string,
    PORT: env.PORT as string,
    DATABASE_URL: env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL as string,
    ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET as string,
    REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN as string,
    FRONTEND_URL: env.FRONTEND_URL as string,
    EMAIL_SENDER: {
      SMTP_USER: env.EMAIL_SENDER_SMTP_USER as string,
      SMTP_PASS: env.EMAIL_SENDER_SMTP_PASS as string,
      SMTP_HOST: env.EMAIL_SENDER_SMTP_HOST as string,
      SMTP_PORT: env.EMAIL_SENDER_SMTP_PORT as string,
      SMTP_FROM: env.EMAIL_SENDER_SMTP_FROM as string,
    },
    SUPER_ADMIN_EMAIL: env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: env.SUPER_ADMIN_PASSWORD as string,
  };
};

export const envVars = loadEnvVariables();
