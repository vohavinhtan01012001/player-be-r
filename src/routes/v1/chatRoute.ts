import { Router } from "express";
import { getChats, createChat, updateChat, deleteChat } from "../../controllers/chat";
import requireUser from "../../middleware/requiresUser"; // Middleware để đảm bảo người dùng đã đăng nhập

const chatRouter = Router();

// Lấy tất cả tin nhắn chat của người dùng
chatRouter.get("/:playerId/:userId", requireUser, getChats);

// Tạo tin nhắn chat mới
chatRouter.post("/", requireUser, createChat);

// Cập nhật tin nhắn chat
chatRouter.put("/:id", requireUser, updateChat);

// Xóa tin nhắn chat
chatRouter.delete("/:id", requireUser, deleteChat);

export default chatRouter;
