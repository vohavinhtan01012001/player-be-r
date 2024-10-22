import { Router } from "express";
import { requireUser } from "../../middleware";
import { getNotifications, createNotification, updateNotification, deleteNotification } from "../../controllers/notification";

const notificationRouter = Router();

notificationRouter.get("/", requireUser, getNotifications);

notificationRouter.post("/", requireUser, createNotification);

notificationRouter.patch("/:id", requireUser, updateNotification);

notificationRouter.delete("/:id", requireUser, deleteNotification);

export default notificationRouter;
