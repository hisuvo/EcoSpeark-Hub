import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { UserRoutes } from "../modules/user/user.route";
import { IdeaRoutes } from "../modules/idea/idea.route";

const router = Router()

router.use("/auth", AuthRoutes)
router.use("/categories", CategoryRoutes)
router.use("/users", UserRoutes)
router.use("/ideas", IdeaRoutes)

export const ApplicationRoutes = router
