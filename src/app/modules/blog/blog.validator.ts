import z from "zod";

const createBlog = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),

  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(500, "Excerpt must not exceed 500 characters")
    .trim(),

  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must not exceed 50 characters")
    .trim(),

  author: z
    .string()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name must not exceed 100 characters")
    .trim(),

  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .default("https://via.placeholder.com/800x400"),
});

const UpdateBlog = z.object({
  title: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const BlogValidator = {
  createBlog,
  UpdateBlog,
};
