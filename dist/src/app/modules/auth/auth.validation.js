import { z } from "zod";
const registerValidationSchema = z.object({
    name: z
        .string("Name is required")
        .trim()
        .min(3, "Name must be at least 3 characters long"),
    email: z
        .string("Email is required")
        .trim()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z
        .string("Password is required")
        .min(6, "Password must be at least 6 characters long"),
});
const loginValidationSchema = z.object({
    email: z
        .string("Email is required")
        .trim()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z
        .string("Password is required")
        .min(6, "Password must be at least 6 characters long"),
});
export const AuthValidation = {
    registerValidationSchema,
    loginValidationSchema,
};
