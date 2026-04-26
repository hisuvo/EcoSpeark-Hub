import status from "http-status";
import { prisma } from "../../lib/prisma";
import QueryBuilder from "../../utils/QueryBuilder";
import { ICategory, IUpdateCategory } from "./category.interface";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../../../generated/prisma/enums";

const createCategory = async (payload: ICategory) => {
  const category = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (category) {
    throw new Error("Category already exists");
  }

  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getCategories = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(query)
    .search(["name", "description"])
    .filter()
    .sort()
    .paginate();

  const args = categoryQuery.getArgs();
  const result = await prisma.category.findMany(args);

  const total = await prisma.category.count({
    where: args.where || {},
  });

  return {
    data: result,
    meta: {
      total,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 2,
      totalPage: Math.ceil(total / (Number(query.limit) || 10)),
    },
  };
};

const updateCategory = async (
  categoryId: string,
  payload: IUpdateCategory,
  userRole: Role,
) => {
  const isExistCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!isExistCategory) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  if (userRole !== Role.ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this category",
    );
  }

  const result = await prisma.category.update({
    where: {
      id: isExistCategory.id,
    },
    data: payload,
  });

  return result;
};

const deleteCategories = async (categoryId: string) => {
  const isExistCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!isExistCategory) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  const response = await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return response;
};

export const CategoryServices = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategories,
};
