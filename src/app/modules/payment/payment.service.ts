/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import Stripe from "stripe";
import { envVars } from "../../config/env";
import { PaymentStatus } from "../../../generated/prisma/enums";

const createPayment = async (userId: string, ideaId: string) => {
  const isExistIdea = await prisma.idea.findUnique({
    where: {
      id: ideaId,
    },
  });

  if (!isExistIdea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  if (!isExistIdea.isPaid) {
    throw new AppError(status.BAD_REQUEST, "Idea is free, no payment required");
  }

  const existingPayment = await prisma.payment.findFirst({
    where: { userId, ideaId },
  });

  if (existingPayment && existingPayment.status === "COMPLETED") {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already paid for this idea",
    );
  }

  const price = isExistIdea.price || 0;
  const amount = Math.round(price * 100);

  if (amount < 50) {
    throw new Error("Amount must be at least $0.50");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      userId,
      ideaId,
    },
  });

  // If there's an existing PENDING payment, we could reuse or update it.
  // For simplicity, we create or return the existing one if needed.
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        userId,
        ideaId,
        amount: isExistIdea.price || 100,
        status: "PENDING",
      },
    });
  }

  return {
    client_secret: paymentIntent.client_secret,
    amount: isExistIdea.price,
  };
};

const checkPaymentStatus = async (userId: string, ideaId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      ideaId,
      status: "COMPLETED",
    },
  });
  return !!payment;
};

const handleWebhook = async (signature: string, payload: Buffer) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      envVars.STRIPE.WEBHOOK_SECRET,
    );
  } catch (error: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${error.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { userId, ideaId } = paymentIntent.metadata;

    if (userId && ideaId) {
      await prisma.payment.updateMany({
        where: {
          userId,
          ideaId,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.COMPLETED,
        },
      });
    }
  }

  return { success: true };
};

export const PaymentService = {
  createPayment,
  checkPaymentStatus,
  handleWebhook,
};
