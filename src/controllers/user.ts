import { changePasswordService, findOneUser, getUsersService, updatePriceService, updateUserById, updateUserService } from "../services/userService";
import { NextFunction, Response } from "express";
import { omit } from "lodash";
import { customRequest } from "../types/customDefinition";
import { ApiError } from "../util/ApiError";
const omitData = ["password"];
export const updateUser = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.user;

    let body = req.body;
    body = omit(body, omitData);

    const user = await findOneUser({ id: userId });

    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const updated = await updateUserById(body, parseInt(userId, 10));

    return res.status(200).json({
      updated: updated[0],
      msg: updated[0] ? "Data updated successfully" : "failed to update",
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserData = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.status(200).json({
      data: req.user,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};


export const getUsers = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getUsersService();
    return res.status(200).json({
      data: users,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserByAdmin = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const userId = parseInt(req.params.id);
    const updated = await updateUserService(data,userId);
    return res.status(200).json({
      updated: updated[0],
      msg: updated[0] ? "User updated successfully" : "failed to update",
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePrice = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const price = req.body.price;
    const message = req.body.message;
    const playerId = req.body.playerId;
    const userId = parseInt(req.user.id);
    const updated = await updatePriceService(price,playerId,userId,message);
    return res.status(200).json({
      msg: updated,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};


export const changePassword = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.user.id);
    const { newPassword,oldPassword } = req.body;
    if (!newPassword) {
      throw new ApiError(400, "New password is required");
    }
    await changePasswordService(userId, oldPassword,newPassword);
    return res.status(200).json({
      msg: "Password changed successfully",
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

