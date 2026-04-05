import dotenv from "dotenv";
dotenv.config();
const loadEnvVariables = () => {
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
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
    ];
    requireEnvVariable.forEach((variable) => {
        if (!process.env[variable]) {
            // throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
            throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
        }
    });
    return {
        NODE_ENV: env.NODE_ENV,
        APP_NAME: env.APP_NAME,
        PORT: env.PORT,
        DATABASE_URL: env.DATABASE_URL,
        BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: env.BETTER_AUTH_URL,
        ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRES_IN: env.ACCESS_TOKEN_EXPIRES_IN,
        REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET,
        REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN,
        FRONTEND_URL: env.FRONTEND_URL,
        EMAIL_SENDER: {
            SMTP_USER: env.EMAIL_SENDER_SMTP_USER,
            SMTP_PASS: env.EMAIL_SENDER_SMTP_PASS,
            SMTP_HOST: env.EMAIL_SENDER_SMTP_HOST,
            SMTP_PORT: env.EMAIL_SENDER_SMTP_PORT,
            SMTP_FROM: env.EMAIL_SENDER_SMTP_FROM,
        },
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        },
        STRIPE: {
            SECRET_KEY: env.STRIPE_SECRET_KEY,
            WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
        },
        ADMIN_EMAIL: env.ADMIN_EMAIL,
        ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    };
};
export const envVars = loadEnvVariables();
