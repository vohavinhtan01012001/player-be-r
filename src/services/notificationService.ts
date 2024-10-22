import Notification from "../models/Notification";

export const getNotificationsService = async (userId: number) => {
  const notifications = await Notification.findAll({
    where: { userId },
    order: [["created_at", "DESC"]],
  });
  return notifications;
};

export const createNotificationService = async (notificationData: { title: string; message: string; status?: number; userId: number,path:string }) => {
  const notification = await Notification.create(notificationData);
  return notification;
};

export const updateNotificationService = async (notificationId: string, userId: number, status: number) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
  });
  if (!notification) {
    throw new Error("Notification not found");
  }
  notification.status = status;
  await notification.save();
  return notification;
};

export const deleteNotificationService = async (notificationId: string, userId: number) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
  });
  if (!notification) {
    throw new Error("Notification not found");
  }
  await notification.destroy();
};
