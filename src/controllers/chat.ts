import { Request, Response, NextFunction } from "express";
import { 
  createChatService, 
  getChatsService, 
  updateChatService, 
  deleteChatService 
} from "../services/chatService"; 
import { customRequest } from "customDefinition";
import { io } from "../server";  // For real-time chat updates using socket.io

// Get all chats for a specific user
export const getChats = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;  // Assuming user is authenticated and `req.user.id` is available
    const chats = await getChatsService(userId);  // Fetching chats related to this user
    return res.status(200).json({
      data: chats,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

// Create a new chat message
export const createChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playerId, userId, message } = req.body;  // Assuming playerId and userId are passed in the body
    const chat = await createChatService({ playerId, userId, message });
    
    io.emit("newChatMessage", chat);

    return res.status(201).json({
      data: chat,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

// Update an existing chat message
export const updateChat = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const chatId = req.params.id;  // Chat ID from URL params
    const { message } = req.body;  // New chat message from the request body
    const updatedChat = await updateChatService(chatId, req.user.id, message);  // Assuming req.user.id is the initiator

    return res.status(200).json({
      data: updatedChat,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a chat message
export const deleteChat = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const chatId = req.params.id;  // Chat ID from URL params
    await deleteChatService(chatId, req.user.id);  // Assuming only the initiator can delete their messages

    return res.status(200).json({
      message: "Chat message deleted successfully",
      error: false,
    });
  } catch (err) {
    next(err);
  }
};
