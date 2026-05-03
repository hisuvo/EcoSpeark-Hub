import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { UserRoutes } from "../modules/user/user.route";
import { IdeaRoutes } from "../modules/idea/idea.route";
import { VoteRoutes } from "../modules/vote/vote.route";
import { CommentRoutes } from "../modules/comment/comment.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { AdminRoutes } from "../modules/admin/admin.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);
router.use("/users", UserRoutes);
router.use("/ideas", IdeaRoutes);
router.use("/votes", VoteRoutes);
router.use("/comments", CommentRoutes);
router.use("/payments", PaymentRoutes);
router.use("/admin", AdminRoutes);

export const ApplicationRoutes: Router = router;
