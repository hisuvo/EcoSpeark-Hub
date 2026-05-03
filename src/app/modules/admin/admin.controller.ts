import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdminService } from "./admin.service";
import status from "http-status";

const getAdminStats = catchAsync(async (req, res) => {
  const result = await AdminService.getAdminStats();

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
