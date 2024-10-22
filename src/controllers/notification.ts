import { Request, Response, NextFunction } from "express";
import { createNotificationService, getNotificationsService, updateNotificationService, deleteNotificationService } from "../services/notificationService";
import { customRequest } from "customDefinition";
import { io } from "../server";

export const getNotifications = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const notifications = await getNotificationsService(userId);
    return res.status(200).json({
      data: notifications,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, message, status, userId,path } = req.body;
    const notification = await createNotificationService({ title, message, status, userId,path });
    return res.status(201).json({
      data: notification,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const updateNotification = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notificationId = req.params.id;
    const { status } = req.body;
    const notification = await updateNotificationService(notificationId, req.user.id, status);
    return res.status(200).json({
      data: notification,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notificationId = req.params.id;
    await deleteNotificationService(notificationId, req.user.id);
    return res.status(200).json({
      message: "Notification deleted successfully",
      error: false,
    });
  } catch (err) {
    next(err);
  }
};
