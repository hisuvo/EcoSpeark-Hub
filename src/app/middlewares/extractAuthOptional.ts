/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";

/**
 * Middleware that optionally extracts user info from the access token.
 * It will NOT throw an error if the token is missing or invalid.
 * Use this for routes that are publicly accessible but behave differently
 * if a user is logged in (e.g., viewing premium idea details).
 */
export const extractAuthOptional = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = CookieUtils.getCookie(req, "accessToken");

    if (accessToken) {
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (verifiedToken.success && verifiedToken.data) {
        req.user = {
          userId: verifiedToken.data.userId,
          role: verifiedToken.data.role,
          email: verifiedToken.data.email,
        };
      }
    }
  } catch (error) {
    // Silently ignore errors to allow public access
    console.error(error);
  }

  next();
};
