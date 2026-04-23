import status from "http-status";
import { IdeaStatus, Role, PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import QueryBuilder from "../../utils/QueryBuilder";
import { CreateIdeaPayload, UpdateIdeaPayload } from "./idea.interface";

const createIdea = async (payload: CreateIdeaPayload, authorId: string) => {
  const result = await prisma.idea.create({
    data: {
      ...payload,
      authorId,
    },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return result;
};

const getAllIdeas = async (query: Record<string, unknown>) => {
  const ideaQuery = new QueryBuilder(query)
    .search(["title", "problem", "solution", "description"])
    .filter()
    .sort()
    .paginate();

  const args = await ideaQuery.getArgs();

  // inject populate
  args.include = {
    category: true,
    author: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        votes: true,
        comments: true,
      },
    },
  };

  const result = await prisma.idea.findMany(args);

  // Sanitize description/solution for paid ideas in the list view
  const sanitizedResult = result.map((idea) => {
    if (idea.isPaid) {
      return {
        ...idea,
        problem: idea.problem.substring(0, 150) + "...",
        solution: "Hidden",
        description: idea.description.substring(0, 150) + "...",
      };
    }
    return idea;
  });

  const total = await prisma.idea.count({ where: args.where || {} });
  return {
    data: sanitizedResult,
    meta: {
      total,
      page: Number(query.page),
      limit: Number(query.limit),
    },
  };
};

const getIdeaById = async (id: string, userRole: Role, userId: string) => {
  const result = await prisma.idea.findUnique({
    where: { id },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: { votes: true, comments: true },
      },
      comments: {
        include: {
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  // If the idea is Paid, restrict access to description and solution unless the user is the author,
  // an admin, or has paid.
  if (result.isPaid) {
    let hasAccess = false;

    if (userRole === Role.ADMIN) {
      hasAccess = true;
    } else if (userId && result.authorId === userId) {
      hasAccess = true;
    } else if (userId) {
      const payment = await prisma.payment.findUnique({
        where: {
          userId_ideaId: { userId, ideaId: id },
        },
      });
      if (payment?.status === PaymentStatus.COMPLETED) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return {
        ...result,
        problem: result.problem.substring(0, 150) + "...",
        solution: "Hidden",
        description: "Hidden",
        comments: [],
        isHidden: true,
        isPurchased: false,
      };
    }
    
    // If has access, explicitly set flags
    return {
      ...result,
      isHidden: false,
      isPurchased: true,
    };
  }

  // For free ideas
  return {
    ...result,
    isHidden: false,
    isPurchased: false,
  };
};

const updateIdea = async (
  ideaId: string,
  payload: UpdateIdeaPayload,
  userId: string,
  userRole: Role,
) => {
  const isExistIdea = await prisma.idea.findUnique({
    where: {
      id: ideaId,
    },
    select: {
      id: true,
      authorId: true,
      status: true,
    },
  });

  if (!isExistIdea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  // Admin can update any idea, but member can only update their own idea
  if (userRole !== Role.ADMIN && isExistIdea.authorId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this idea",
    );
  }

  // Member can only update if it is DRAFT or changing status from DRAFT -> UNDER_REVIEW
  if (userRole === Role.MEMBER) {
    if (isExistIdea.status !== IdeaStatus.DRAFT) {
      throw new AppError(status.FORBIDDEN, "You can only edit DRAFT ideas");
    }
    // Cannot approve/reject self
    if (
      payload.status === IdeaStatus.APPROVED ||
      payload.status === IdeaStatus.REJECTED
    ) {
      throw new AppError(status.FORBIDDEN, "You cannot set this status");
    }
  }

  const result = await prisma.idea.update({
    where: {
      id: ideaId,
    },
    data: payload,
    include: {
      category: true,
    },
  });

  return result;
};

const deleteIdea = async (ideaId: string, userId: string, userRole: Role) => {
  const isExistIdea = await prisma.idea.findUnique({
    where: {
      id: ideaId,
    },
    select: {
      id: true,
      authorId: true,
      status: true,
    },
  });

  if (!isExistIdea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  // Admin can delete any idea, but member can only delete their own idea
  if (userRole !== Role.ADMIN && isExistIdea.authorId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this idea",
    );
  }

  // Member can only delete if it is DRAFT
  if (userRole === Role.MEMBER) {
    if (isExistIdea.status !== IdeaStatus.DRAFT) {
      throw new AppError(status.FORBIDDEN, "You can only delete DRAFT ideas");
    }
  }

  const result = await prisma.idea.delete({
    where: {
      id: ideaId,
    },
  });

  return result;
};

export const IdeaService = {
  getAllIdeas,
  createIdea,
  getIdeaById,
  updateIdea,
  deleteIdea,
};
