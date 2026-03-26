import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import { AuthServices } from "./auth.service"
import sendResponse from "../../shared/sendResponse"

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.registerUser(req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User registered successfully",
        data: result,
    });
})

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.getAllUsers();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
})
    

export const AuthControlelr = {
    registerUser,
    getAllUsers
}