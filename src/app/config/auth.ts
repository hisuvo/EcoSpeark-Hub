import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import prisma from "./db";
// import { sendVerificationEmail } from "../utils/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // async sendVerificationEmail(data, request) {
    //   // data provides { user, url, token }
    //   await sendVerificationEmail(data.user.email, data.url, data.token);
    // },
  },
  plugins: [jwt()],
});
