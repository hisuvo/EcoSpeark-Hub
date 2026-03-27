import { Router } from "express";
import { AuthControlelr } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerValidationSchema), AuthControlelr.registerUser);
router.post("/login", validateRequest(AuthValidation.loginValidationSchema), AuthControlelr.loginUser);
router.get("/me",checkAuth(Role.MEMBER,Role.ADMIN), AuthControlelr.getMe);
router.post("/refresh-token",AuthControlelr.getNewToken);
router.post("/change-password",checkAuth(Role.MEMBER,Role.ADMIN), AuthControlelr.changePassword);

export const AuthRoutes = router;