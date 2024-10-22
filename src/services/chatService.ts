import Chat from "../models/Chat";  // Assuming you have the Chat model defined similarly to Notification

// Get all chats for a specific user
export const getChatsService = async (userId: number) => {
  const chats = await Chat.findAll({
    where: { userId },
    order: [["created_at", "DESC"]],  // Order by most recent chats first
  });
  return chats;
};

// Create a new chat message
export const createChatService = async (chatData: { playerId: number; userId: number; message: string }) => {
  const chat = await Chat.create(chatData);  // Create a new chat record in the database
  return chat;
};

// Update a chat message (only if the user owns the chat)
export const updateChatService = async (chatId: string, userId: number, message: string) => {
  const chat = await Chat.findOne({
    where: { id: chatId, userId },  // Ensure the chat belongs to the user
  });
  if (!chat) {
    throw new Error("Chat not found");
  }
  chat.message = message;  // Update the message
  await chat.save();
  return chat;
};

// Delete a chat message (only if the user owns the chat)
export const deleteChatService = async (chatId: string, userId: number) => {
  const chat = await Chat.findOne({
    where: { id: chatId, userId },  // Ensure the chat belongs to the user
  });
  if (!chat) {
    throw new Error("Chat not found");
  }
  await chat.destroy();  // Remove the chat from the database
};
