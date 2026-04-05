import express from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
const router = express.Router();
router.post("/:ideaId/pay", checkAuth(Role.ADMIN, Role.MEMBER), PaymentController.createPayment);
router.get("/:ideaId/status", checkAuth(Role.ADMIN, Role.MEMBER), PaymentController.checkPaymentStatus);
export const PaymentRoutes = router;
