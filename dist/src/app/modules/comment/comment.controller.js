import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { status } from "http-status";
import { CommentService } from "./comment.service";
const createComment = catchAsync(async (req, res) => {
    const { ideaId } = req.params;
    const userId = req.user.userId;
    const result = await CommentService.createComment(ideaId, userId, req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Comment created successfully",
        data: result
    });
});
const deleteComment = catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;
    const result = await CommentService.deleteComment(commentId, userId, role);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Comment deleted successfully",
        data: result
    });
});
export const CommentController = {
    createComment,
    deleteComment
};
