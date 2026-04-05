import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import catchAsync from "../../shared/catchAsync";
const getAllUsers = catchAsync(async (req, res) => {
    const result = await UserService.getAllUsers(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});
const updateUserRole = catchAsync(async (req, res) => {
    const result = await UserService.updateUserRole(req.params.id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
});
export const UserController = {
    getAllUsers,
    updateUserRole,
};
