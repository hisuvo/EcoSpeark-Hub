import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { CategoryServices } from "./category.service";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createCategory(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getCategories(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const userRole = req.user?.role;

  const payload = req.body;

  const result = await CategoryServices.updateCategory(
    categoryId as string,
    payload,
    userRole,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategories = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const result = await CategoryServices.deleteCategories(categoryId as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "category deleted successfully",
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategories,
};
