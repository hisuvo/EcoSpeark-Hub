import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  const { accessToken, refreshToken, token, ...rest } = result;

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
      ...rest,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  const { accessToken, refreshToken, token, ...rest } = result;

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
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await AuthServices.getMe(user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if(!refreshToken){
        throw new AppError(status.UNAUTHORIZED, "Refresh token not found");
    }

  const result = await AuthServices.getNewToken(refreshToken,betterAuthSessionToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "New token generated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthServices.changePassword(req.body,sessionToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});
export const AuthControlelr = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword
};
