import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";
import { PaymentService } from "./payment.service";

// const createPayment = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user!.userId;
//   const { ideaId } = req.params;

//   const result = await PaymentService.createPayment(userId, ideaId as string);

//   sendResponse(res, {
//     statusCode: status.CREATED,
//     success: true,
//     message: "Payment intent created successfully",
//     data: result,
//   });
// });

export const createPayment = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { ideaId } = req.params;

  const data = await PaymentService.createPaymentIntent(
    userId,
    ideaId as string,
  );

  console.log("create stripe payment ->", data);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment intent created",
    data: {
      client_secret: data.client_secret,
    },
  });
});

const checkPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { ideaId } = req.params;
  const result = await PaymentService.checkPaymentStatus(
    userId,
    ideaId as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

// const handleWebhook = catchAsync(async (req: Request, res: Response) => {
//   const signature = req.headers["stripe-signature"] as string;

//   console.log(signature, "this is signature");

//   if (!signature) {
//     throw new AppError(404, "Missing signature");
//   }

//   const result = await PaymentService.handleWebhook(signature, req.body);

//   sendResponse(res, {
//     statusCode: status.OK,
//     success: true,
//     message: "Webhook received successfully",
//     data: result,
//   });
// });

export const webhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  const result = await PaymentService.confirmWebhook(
    signature,
    req.body, // MUST be Buffer
  );

  res.status(200).json(result);
};

export const PaymentController = {
  createPayment,
  checkPaymentStatus,
  // handleWebhook,
  webhook,
};
