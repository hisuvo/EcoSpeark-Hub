import { Router } from "express";
import { AuthControlelr } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerValidationSchema), AuthControlelr.registerUser);
router.post("/login", validateRequest(AuthValidation.loginValidationSchema), AuthControlelr.loginUser);
router.get("/", AuthControlelr.getAllUsers);

export const AuthRoutes = router;