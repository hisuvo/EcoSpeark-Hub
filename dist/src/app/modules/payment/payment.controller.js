import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";
import { PaymentService } from "./payment.service";
import AppError from "../../errorHelpers/AppError";
const createPayment = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { ideaId } = req.params;
    const result = await PaymentService.createPayment(userId, ideaId);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Payment intent created successfully",
        data: result,
    });
});
const checkPaymentStatus = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { ideaId } = req.params;
    const result = await PaymentService.checkPaymentStatus(userId, ideaId);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Payment intent created successfully",
        data: result,
    });
});
const handleWebhook = catchAsync(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    console.log(signature, "this is signature");
    if (!signature) {
        throw new AppError(404, "Missing signature");
    }
    const result = await PaymentService.handleWebhook(signature, req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Webhook received successfully",
        data: result,
    });
});
export const PaymentController = {
    createPayment,
    checkPaymentStatus,
    handleWebhook,
};
