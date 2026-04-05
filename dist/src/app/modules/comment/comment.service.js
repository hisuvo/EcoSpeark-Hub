import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";
const createComment = async (ideaId, userId, payload) => {
    const result = await prisma.comment.create({
        data: {
            content: payload.content,
            ideaId,
            authorId: userId,
            ...payload.parentId && { parentId: payload.parentId }
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });
    return result;
};
const deleteComment = async (commentId, userId, role) => {
    const comment = await prisma.comment.findUnique({
        where: {
            id: commentId
        }
    });
    if (!comment) {
        throw new AppError(status.NOT_FOUND, "Comment not found");
    }
    if (comment.authorId !== userId && role !== Role.ADMIN) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to delete this comment");
    }
    const result = await prisma.comment.delete({
        where: {
            id: commentId
        }
    });
    return result;
};
export const CommentService = {
    createComment,
    deleteComment
};
