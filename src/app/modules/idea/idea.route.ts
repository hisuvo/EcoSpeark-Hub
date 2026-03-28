import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IdeaController } from "./idea.controller";
import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { IdeaValidator } from "./idea.validator";

const router = Router();

// publicly accessable idea routes
router.get("/", IdeaController.getAllIdeas);
router.get("/:id", IdeaController.getIdeaById);

// idea routes that require authentication
router.post(
  "/",
  checkAuth(Role.MEMBER),
  validateRequest(IdeaValidator.createIdeaValidator),
  IdeaController.createIdea,
);
router.patch(
  "/:id",
  checkAuth(Role.MEMBER, Role.ADMIN),
  validateRequest(IdeaValidator.updateIdeaSchema),
  IdeaController.updateIdea,
);
router.delete(
  "/:id",
  checkAuth(Role.MEMBER, Role.ADMIN),
  IdeaController.deleteIdea,
);

export const IdeaRoutes = router;
