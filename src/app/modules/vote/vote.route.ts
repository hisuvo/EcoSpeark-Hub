import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { VoteController } from "./vore.controller";

const router = Router();

router.post("/:ideaId/vote", checkAuth(Role.MEMBER), VoteController.castVote);

export const VoteRoutes = router;
