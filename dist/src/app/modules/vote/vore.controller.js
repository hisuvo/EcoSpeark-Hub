import catchAsync from "../../shared/catchAsync";
import { VoteService } from "./vote.service";
import sendResponse from "../../shared/sendResponse";
const castVote = catchAsync(async (req, res) => {
    const { ideaId } = req.params;
    const { type } = req.body;
    const userId = req.user?.userId;
    const vote = await VoteService.castVote(ideaId, userId, type);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Vote cast successfully",
        data: vote,
    });
});
export const VoteController = {
    castVote,
};
