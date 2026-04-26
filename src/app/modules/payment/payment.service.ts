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

  if (existing?.status === PaymentStatus.PENDING && existing.stripePaymentIntentId) {
    return { client_secret: existing.stripeClientSecret };
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
      stripeClientSecret: paymentIntent.client_secret,
      amount: amount,
      status: PaymentStatus.PENDING,
    },
    create: {
      userId,
      ideaId,
      amount: amount,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
    },
  });

  return { client_secret: paymentIntent.client_secret };
};

const checkPaymentStatus = async (userId: string, ideaId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      userId_ideaId: { userId, ideaId },
    },
  });

  if (!payment) return false;

  if (payment.status === PaymentStatus.COMPLETED) {
    return true;
  }

  // Fallback: If status is still PENDING, verify directly with Stripe
  if (payment.status === PaymentStatus.PENDING && payment.stripePaymentIntentId) {
    try {
      const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      if (intent.status === "succeeded") {
        await prisma.payment.update({
          where: { userId_ideaId: { userId, ideaId } },
          data: { status: PaymentStatus.COMPLETED },
        });
        return true;
      }
    } catch (error) {
      console.error("Error verifying payment intent:", error);
    }
  }

  return false;
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

  // Handle both payment_intent.succeeded and charge.succeeded as a fallback
  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "charge.succeeded"
  ) {
    const intent = event.data.object as any;
    // For charge.succeeded, the metadata might be under intent.metadata or intent.payment_intent.metadata
    // But for payment_intent.succeeded, it's directly on intent.metadata
    const metadata = intent.metadata || {};
    const { userId, ideaId } = metadata;

    if (userId && ideaId) {
      console.log(`✅ Webhook: Updating payment to COMPLETED for Idea ${ideaId}, User ${userId}`);
      await prisma.payment.update({
        where: { userId_ideaId: { userId, ideaId } },
        data: {
          status: PaymentStatus.COMPLETED,
          stripePaymentIntentId: intent.id,
        },
      });
    } else {
      console.log(`⚠️ Webhook: Received ${event.type} but missing metadata. Falling back to Intent ID lookup.`);
      await prisma.payment.update({
        where: { stripePaymentIntentId: intent.id || intent.payment_intent },
        data: { status: PaymentStatus.COMPLETED },
      });
    }
  }
  return { received: true };
};

export const PaymentService = {
  createPaymentIntent,
  checkPaymentStatus,
  confirmWebhook,
};
