import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import QueryBuilder from "../../utils/QueryBuilder";

const getAllUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(query)
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate();

  const args = userQuery.getArgs();
  args.select = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
  };

  const result = await prisma.user.findMany(args);
  const total = await prisma.user.count({ where: args.where });
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data: result,
    meta: { page, limit, total, totalPages },
  };
};

const updateUserRole = async (id: string, payload: { role: Role }) => {
  const isExistUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!isExistUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isValidRole = (role: any): role is Role => {
    return Object.values(Role).includes(role);
  };

  if (!isValidRole(payload.role)) {
    throw new AppError(status.BAD_REQUEST, "Invalid role provided");
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return result;
};

export const UserService = {
  getAllUsers,
  updateUserRole,
};
