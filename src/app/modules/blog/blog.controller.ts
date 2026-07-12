import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { BlogService } from "./blog.service";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";

const CreateBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await BlogService.CreateBlog(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

const GetBlogs = catchAsync(async (req: Request, res: Response) => {
  const blogs = await BlogService.GetBlogs();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Blogs retrieved successfully",
    data: blogs,
  });
});

const GetBlogById = catchAsync(async (req: Request, res: Response) => {
  const { blogId } = req.params;

  if (!blogId) {
    return sendResponse(res, {
      statusCode: status.BAD_REQUEST,
      success: false,
      message: "Blog ID is required",
    });
  }

  const blog = await BlogService.GetBlogById(blogId as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Blog retrieved successfully",
    data: blog,
  });
});

const UpdateBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await BlogService.UpdateBlog(
    req.params.blogId as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
});

const DeleteBlog = catchAsync(async (req: Request, res: Response) => {
  const { blogId } = req.params;

  if (!blogId) {
    return sendResponse(res, {
      statusCode: status.BAD_REQUEST,
      success: false,
      message: "Blog ID is required",
    });
  }

  await BlogService.DeleteBlog(blogId as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Blog deleted successfully",
  });
});

export const BlogController = {
  GetBlogs,
  GetBlogById,
  CreateBlog,
  UpdateBlog,
  DeleteBlog,
};
