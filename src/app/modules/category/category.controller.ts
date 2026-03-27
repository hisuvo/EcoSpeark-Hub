import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import { CategoryServices } from "./category.service"
import sendResponse from "../../shared/sendResponse"

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryServices.createCategory(req.body)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category created successfully",
        data: result
    })
})

const getCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryServices.getCategories(req.query)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Categories fetched successfully",
        data: result
    })
})

export const CategoryController = {
    createCategory,
    getCategories
}