import z from "zod";

const createIdeaValidator = z.object({
  title: z.string().min(1, "Title is required"),
  problem: z.string().min(1, "Problem is required"),
  solution: z.string().min(1, "Solution is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  isPaid: z.boolean().optional(),
  price: z.coerce.number().optional(),
  categoryId: z.string().min(1, "Category is required"),
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
