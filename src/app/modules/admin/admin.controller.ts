import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import status from "http-status";
import { AdminService } from "./admin.service";

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminStatsFromDB();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin stats fetched successfully",
    data: result,
  });
});

export const AdminController = {
  getAdminStats,
};
