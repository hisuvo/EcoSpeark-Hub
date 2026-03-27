import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerValidationSchema), AuthController.registerUser);
router.post("/login", validateRequest(AuthValidation.loginValidationSchema), AuthController.loginUser);
router.get("/me",checkAuth(Role.MEMBER,Role.ADMIN), AuthController.getMe);
router.post("/refresh-token",AuthController.getNewToken);
router.post("/change-password",checkAuth(Role.MEMBER,Role.ADMIN), AuthController.changePassword);
router.post("/logout",checkAuth(Role.MEMBER,Role.ADMIN), AuthController.logoutUser);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword)
router.post("/reset-password", AuthController.resetPassword)

router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes = router;