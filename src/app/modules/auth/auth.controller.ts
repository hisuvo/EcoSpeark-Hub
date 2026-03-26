import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import { AuthServices } from "./auth.service"
import sendResponse from "../../shared/sendResponse"
import { tokenUtils } from "../../utils/token"
import status from "http-status"

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.registerUser(req.body);

    const {accessToken, refreshToken,token, ...rest} = result;
    
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
  
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User registered successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        },
    });
})

const loginUser = catchAsync(async (req: Request, res: Response) => {
    
    const result = await AuthServices.loginUser(req.body);

    const {accessToken, refreshToken,token, ...rest} = result;
    
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        },
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
    loginUser,
    getAllUsers
}