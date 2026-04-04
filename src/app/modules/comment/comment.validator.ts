import { z } from "zod";

const createComment = z.object({
  content: z.string("Content is required"),
  parentId: z.string().nullable().optional(),
});

export const CommentValidation = {
  createComment,
};
