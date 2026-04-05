import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";
const router = Router();
router.get('/', checkAuth(Role.ADMIN), UserController.getAllUsers);
router.patch("/:id/role", checkAuth(Role.ADMIN), UserController.updateUserRole);
export const UserRoutes = router;
