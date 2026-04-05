/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS,
    },
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
});
export const sendEmail = async ({ subject, templateData, templateName, to, attachments, }) => {
    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);
        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            })),
        });
        console.log(`Email sent to ${to} : ${info.messageId}`);
    }
    catch (error) {
        console.log("Email Sending Error", error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
    }
};
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: parseInt(process.env.SMTP_PORT || "587"),
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });
// export const sendVerificationEmail = async (
//   email: string,
//   url: string,
//   token: string,
// ) => {
//   const mailOptions = {
//     from: `"EcoSpark Hub" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject: "Verify your EcoSpark Hub account",
//     html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                 <h2>Welcome to EcoSpark Hub!</h2>
//                 <p>Please verify your email address by clicking the link below:</p>
//                 <a href="${url}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
//                 <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
//                 <p><strong>${url}</strong></p>
//             </div>
//         `,
//   };
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Verification email sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//   }
// };
// export const sendPasswordResetEmail = async (email: string, url: string) => {
//   const mailOptions = {
//     from: `"EcoSpark Hub" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject: "Reset your EcoSpark Hub password",
//     html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                 <h2>Password Reset Request</h2>
//                 <p>You requested a password reset. Click the link below to reset your password:</p>
//                 <a href="${url}" style="padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
//                 <p>If you didn't request this, you can safely ignore this email.</p>
//             </div>
//         `,
//   };
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Password reset email sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//   }
// };
