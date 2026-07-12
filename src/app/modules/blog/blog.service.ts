/* eslint-disable @typescript-eslint/no-explicit-any */
import { Blog } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const CreateBlog = async (data: Blog) => {
  const blog = await prisma.blog.create({
    data: {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      authorId: data.authorId,
      status: data.status,
      publishedAt: data.publishedAt,
    },
  });
  return blog;
};

const GetBlogs = async () => {
  const blogs = await prisma.blog.findMany();
  return blogs;
};

const GetBlogById = async (id: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  return blog;
};

const UpdateBlog = async (id: string, data: any) => {
  const blog = await prisma.blog.update({ where: { id }, data });
  return blog;
};

const DeleteBlog = async (id: string) => {
  await prisma.blog.delete({ where: { id } });
};

export const BlogService = {
  CreateBlog,
  GetBlogs,
  GetBlogById,
  UpdateBlog,
  DeleteBlog,
};
