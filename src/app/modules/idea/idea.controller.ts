import catchAsync from "../../shared/catchAsync";
import { IdeaService } from "./idea.service";
import sendResponse from "../../shared/sendResponse";
import { status } from "http-status";

const createIdea = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    imageUrl: req.file?.path,
  };

  const result = await IdeaService.createIdea(payload, req.user!.userId);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Idea created successfully",
    data: result,
  });
});

const getAllIdeas = catchAsync(async (req, res) => {
  const result = await IdeaService.getAllIdeas(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Ideas fetched successfully",
    data: result,
  });
});

const getIdeaById = catchAsync(async (req, res) => {
  const userRole = req.user?.role;
  const userId = req.user?.userId;
  const result = await IdeaService.getIdeaById(
    req.params.id as string,
    userRole,
    userId,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Idea fetched successfully",
    data: result,
  });
});

const updateIdea = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.userId;

  const payload = { ...req.body, imageUrl: req.file?.path };

  const result = await IdeaService.updateIdea(
    id as string,
    payload,
    userId,
    userRole,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Idea updated successfully",
    data: result,
  });
});

const deleteIdea = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.userId;
  const result = await IdeaService.deleteIdea(id as string, userId, userRole);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Idea deleted successfully",
    data: result,
  });
});

export const IdeaController = {
  getAllIdeas,
  createIdea,
  getIdeaById,
  updateIdea,
  deleteIdea,
};
