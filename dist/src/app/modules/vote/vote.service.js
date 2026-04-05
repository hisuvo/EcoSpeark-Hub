import { prisma } from "../../lib/prisma";
const castVote = async (ideaId, userId, type) => {
    const ExistingVote = await prisma.vote.findUnique({
        where: {
            ideaId_userId: {
                ideaId,
                userId,
            },
        },
    });
    if (type === null) {
        // if user want to remove vote
        if (ExistingVote) {
            await prisma.vote.delete({
                where: {
                    ideaId_userId: {
                        ideaId,
                        userId,
                    },
                },
            });
            return null;
        }
    }
    else {
        // Add or update vote
        if (ExistingVote) {
            if (ExistingVote.type !== type) {
                return await prisma.vote.update({
                    where: { id: ExistingVote.id },
                    data: { type },
                });
            }
            return ExistingVote;
        }
        else {
            return await prisma.vote.create({
                data: {
                    ideaId,
                    userId,
                    type,
                },
            });
        }
    }
};
export const VoteService = {
    castVote,
};
