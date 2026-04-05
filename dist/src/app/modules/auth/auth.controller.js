import catchAsync from "../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { CookieUtils } from "../../utils/cookie";
import { envVars } from "../../config/env";
const registerUser = catchAsync(async (req, res) => {
    const result = await AuthServices.registerUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
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
const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
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
const getMe = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await AuthServices.getMe(user);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});
const getNewToken = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
        throw new AppError(status.UNAUTHORIZED, "Refresh token not found");
    }
    const result = await AuthServices.getNewToken(refreshToken, betterAuthSessionToken);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "New token generated successfully",
        data: result,
    });
});
const changePassword = catchAsync(async (req, res) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthServices.changePassword(req.body, sessionToken);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Password changed successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest,
        },
    });
});
const logoutUser = catchAsync(async (req, res) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthServices.logoutUser(sessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    CookieUtils.clearCookie(res, "refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    CookieUtils.clearCookie(res, "better-auth.session_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User logged out successfully",
        data: result,
    });
});
const verifyEmail = catchAsync(async (req, res) => {
    await AuthServices.verifyEmail(req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Email verified successfully",
    });
});
const forgetPassword = catchAsync(async (req, res) => {
    await AuthServices.forgetPassword(req.body.email);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Password reset OTP sent to email successfully",
    });
});
const resetPassword = catchAsync(async (req, res) => {
    await AuthServices.resetPassword(req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Password reset successfully",
    });
});
const handleOAuthError = catchAsync((req, res) => {
    const error = req.query.error || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
export const AuthController = {
    registerUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    handleOAuthError
};
