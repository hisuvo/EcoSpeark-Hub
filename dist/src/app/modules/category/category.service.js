import { prisma } from "../../lib/prisma";
import QueryBuilder from "../../utils/QueryBuilder";
const createCategory = async (payload) => {
    const category = await prisma.category.findUnique({
        where: {
            name: payload.name
        }
    });
    if (category) {
        throw new Error("Category already exists");
    }
    const result = await prisma.category.create({
        data: payload
    });
    return result;
};
const getCategories = async (query) => {
    const categoryQuery = new QueryBuilder(query)
        .search(['name', 'description'])
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
            limit: Number(query.limit) || 10,
            totalPage: Math.ceil(total / (Number(query.limit) || 10)),
        },
    };
};
export const CategoryServices = {
    createCategory,
    getCategories
};
