import z from "zod";

const createIdeaValidator = z.object({
  title: z.string("Title is required"),
  problem: z.string("Problem is required"),
  solution: z.string("Solution is required"),
  description: z.string("Description is required"),
  imageUrl: z.string().optional(),
  isPaid: z.boolean().optional(),
  price: z.number().optional(),
  categoryId: z.string("Category is required"),
});

const updateIdeaSchema = z.object({
  title: z.string().optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  isPaid: z.boolean().optional(),
  price: z.number().optional(),
  status: z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
});

export const IdeaValidator = {
  createIdeaValidator,
  updateIdeaSchema,
};
