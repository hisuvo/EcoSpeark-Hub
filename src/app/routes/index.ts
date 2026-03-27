import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { UserRoutes } from "../modules/user/user.route";

const router = Router()

router.use("/auth", AuthRoutes)
router.use("/categories", CategoryRoutes)
router.use("/users", UserRoutes)

export const ApplicationRoutes = router
