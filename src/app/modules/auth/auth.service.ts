/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { tokenUtils } from "../../utils/token";
import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";

interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface ILoginUser {
  email: string;
  password: string;
}

const registerUser = async (payload: IRegisterUser) => {
  const data = await auth.api.signUpEmail({
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register user");
  }

  try {
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      accessToken,
      refreshToken,
      ...data,
    };
  } catch (error: any) {
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

const loginUser = async (payload: ILoginUser) => {
  const data = await auth.api.signInEmail({
    body: {
      email: payload.email,
      password: payload.password,
    },
  });

  if (!data.user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  if (!data.user.emailVerified) {
    throw new AppError(status.UNAUTHORIZED, "Email not verified");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.UNAUTHORIZED, "User is deleted");
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.UNAUTHORIZED, "User is blocked");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const result = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      ideas: {
        include: {
          comments: true,
          category: true,
          votes: true,
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return result;
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
};
