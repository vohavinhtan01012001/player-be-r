import { NextFunction, Response } from "express";
import { customRequest } from "../types/customDefinition";
import { 
  createRentalRequestService, 
  deleteRentalRequestService, 
  getRentalRequestByIdPlayerAllService, 
  getRentalRequestByIdPlayerService, 
  getRentalRequestPlayerAllByStatusService, 
  getRentalRequestsService, 
  getTop5PlayersWithMostRentalRequestsService, 
  updateRentalRequestService 
} from "../services/rentalRequestService";
import { io } from "../server";
import RentalRequest from "../models/RentalRequest";
import Player from "../models/Player";
import User from "../models/User";
import { createNotificationService, getNotificationsService } from "../services/notificationService";

// Get all rental requests
export const getRentalRequests = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const rentalRequests = await getRentalRequestsService();
    return res.status(200).json({
      data: rentalRequests,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const createRentalRequest = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body; 
    const userId = req.user.id;
    const payloadData = {...payload,userId: userId};
    const rentalRequest = await createRentalRequestService(payloadData);
    return res.status(201).json({
      data: rentalRequest,
      error: false,
      msg: "Rental request created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateRentalRequest = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const payload = req.body; 
    const updatedRentalRequest = await updateRentalRequestService(id, payload.status === 2 ? {...payload,rating:true} :payload );
    const player = await Player.findByPk(updatedRentalRequest.playerId);
    const user = await User.findByPk(updatedRentalRequest.userId);
    const userPlayer = await User.findByPk(player.userId);
    const title = "Rental request completed successfully";
    const message = `${player.name} has completed your rental request.`;
    let path;
    if (payload.status === 2) {
      path = `/player/${player.id}?rentalRequestId=${updatedRentalRequest.id}`;
      await Player.update({ status: 2 }, { where: { id: updatedRentalRequest.playerId } });
      await User.update({price:userPlayer.price + updatedRentalRequest.totalPrice},{where:{id:player.userId}});
      await User.update({price:user.price - updatedRentalRequest.totalPrice},{where:{id:user.id}});
    } else {
      path = `/player/${player.id}`;
      await Player.update({ status: 3 }, { where: { id: updatedRentalRequest.playerId } });
    }

    await createNotificationService({
      title,
      message,
      userId: updatedRentalRequest.userId,
      path
    });

    const notifications = await getNotificationsService(updatedRentalRequest.userId);
    io.emit("newPriceNotification", { rentalRequestId: notifications });

    return res.status(200).json({
      data: updatedRentalRequest,
      error: false,
      msg: title,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a rental request
export const deleteRentalRequest = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const rent = await RentalRequest.findByPk(id);
    const player = await Player.findByPk(rent.playerId);
    const path = `/player/${player.id}`;
    await createNotificationService({
      title: "Rental request denied",
      message: `${player.name} player rejected your hire request.`,
      userId: rent.userId,
      path
    });
    const notifications = await getNotificationsService(rent.userId);
    io.emit("newPriceNotification", {
      rentalRequestId: notifications,
    });
    
    await deleteRentalRequestService(id);
    return res.status(200).json({
      error: false,
      msg: "Rental request deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getRentalRequestByIdPlayer = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id); // Lấy ID từ URL params
    const rentalRequests = await getRentalRequestByIdPlayerService(userId); // Gọi service với ID nếu có
    return res.status(200).json({
      data: rentalRequests,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};


export const getRentalRequestByIdPlayerAll = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id); // Lấy ID từ URL params
    const rentalRequests = await getRentalRequestByIdPlayerAllService(userId); // Gọi service với ID nếu có
    return res.status(200).json({
      data: rentalRequests,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const getRentalRequestAllByStatus = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const status = parseInt(req.params.status);
    const year = parseInt(req.params.year);
    const rentalRequests = await getRentalRequestPlayerAllByStatusService(status,year); // Gọi service với ID nếu có
    return res.status(200).json({
      data: rentalRequests,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const getTop5PlayersWithMostRentalRequests = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const month = parseInt(req.params.month); // Lấy status từ params
    const year = parseInt(req.params.year); // Lấy year từ params

    // Kiểm tra nếu status hoặc year không hợp lệ
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({
        error: true,
        message: "Invalid status or year",
      });
    }

    // Gọi service để lấy top 5 players có rentalRequest nhiều nhất trong năm
    const top5Players = await getTop5PlayersWithMostRentalRequestsService(year,month);

    // Trả về danh sách top 5 players
    return res.status(200).json({
      data: top5Players,
      error: false,
    });
  } catch (err) {
    // Nếu có lỗi, chuyển tiếp cho middleware xử lý lỗi
    next(err);
  }
};