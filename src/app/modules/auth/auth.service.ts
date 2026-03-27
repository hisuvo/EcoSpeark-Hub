/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { tokenUtils } from "../../utils/token";
import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isExsistSessionToken = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isExsistSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Session not found");
  }

  const verifyRefreshToken = jwtUtils.verifyToken(refreshToken,envVars.REFRESH_TOKEN_SECRET);

  if (!verifyRefreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token not found");
  }

  const data = verifyRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };

};

interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

const changePassword = async (payload:IChangePassword,sessionToken:string) => {
  const session = await auth.api.getSession({
    headers:  new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const {currentPassword, newPassword} = payload

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if(session.user.needPasswordChange){
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return {
    accessToken,
    refreshToken,
    ...result,
  };
}

const logoutUser = async (sessionToken:string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
}

const verifyEmail = async (payload:{email:string, otp:string}) => {
  const {email, otp} = payload

  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if(result.user && !result.user.emailVerified){
    await prisma.user.update({
      where: {
        id: result.user.id,
      },
      data: {
        emailVerified: true,
      },
    });
  }
}

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

interface IResetPassword {
  email: string;
  otp: string;
  newPassword: string;
}

const resetPassword = async (
  payload: IResetPassword
) => {
  const {email, otp, newPassword} = payload
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id,
    },
  });
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword
};
