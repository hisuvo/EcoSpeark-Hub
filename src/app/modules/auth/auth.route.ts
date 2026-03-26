import { Router } from "express";
import { AuthControlelr } from "./auth.controller";

const router = Router();

router.post("/register", AuthControlelr.registerUser);
router.get("/", AuthControlelr.getAllUsers);

export const AuthRoutes = router;