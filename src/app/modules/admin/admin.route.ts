import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/stats",
  checkAuth(Role.ADMIN),
  AdminController.getAdminStats
);

export const AdminRoutes: Router = router;
