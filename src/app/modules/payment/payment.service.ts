/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { stripe } from "../../config/stripe.config";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createPaymentIntent = async (userId: string, ideaId: string) => {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } }); // Adjusted prisma path if needed

  if (!idea) throw new AppError(status.NOT_FOUND, "Idea not found");
  if (!idea.isPaid) throw new AppError(status.BAD_REQUEST, "Free idea");

  const existing = await prisma.payment.findUnique({
    where: { userId_ideaId: { userId, ideaId } },
  });

  if (existing?.status === PaymentStatus.COMPLETED) {
    throw new AppError(400, "Already paid");
  }

  const amount = Math.round((idea.price || 0) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: { userId, ideaId },
  });

  await prisma.payment.upsert({
    where: { userId_ideaId: { userId, ideaId } },
    update: {
      stripePaymentIntentId: paymentIntent.id,
      amount: idea.price ?? 0,
      status: PaymentStatus.PENDING,
    },
    create: {
      userId,
      ideaId,
      amount: idea.price ?? 0,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  return { client_secret: paymentIntent.client_secret };
};

const checkPaymentStatus = async (userId: string, ideaId: string) => {
  const payment = await prisma.payment.findUnique({
    // Use findUnique if userId_ideaId is unique
    where: {
      userId_ideaId: { userId, ideaId },
    },
  });

  // Always compare using the Enum to be safe
  return payment?.status === PaymentStatus.COMPLETED;
};

const confirmWebhook = async (signature: string, payload: Buffer) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    throw new AppError(400, err.message);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    await prisma.payment.update({
      where: { stripePaymentIntentId: intent.id },
      data: { status: PaymentStatus.COMPLETED },
    });
  }
  return { received: true };
};

export const PaymentService = {
  createPaymentIntent,
  checkPaymentStatus,
  confirmWebhook,
};
