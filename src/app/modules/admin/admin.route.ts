import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
  "/stats",
  checkAuth(Role.ADMIN),
  AdminController.getAdminStats
);

export const AdminRoutes = router;
