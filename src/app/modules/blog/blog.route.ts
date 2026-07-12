import { Router } from "express";
import { BlogController } from "./blog.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
// import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.get("/", BlogController.GetBlogs);
router.get("/:blogId", BlogController.GetBlogById);
router.post(
  "/",
  checkAuth(Role.MEMBER, Role.ADMIN),
  //   validateRequest(BlogValidation.createBlog),
  BlogController.CreateBlog,
);
router.put(
  "/:blogId",
  checkAuth(Role.MEMBER, Role.ADMIN),
  //   validateRequest(BlogValidation.updateBlog),
  BlogController.UpdateBlog,
);
router.delete(
  "/:blogId",
  checkAuth(Role.MEMBER, Role.ADMIN),
  BlogController.DeleteBlog,
);

export const BlogRoutes = router;
