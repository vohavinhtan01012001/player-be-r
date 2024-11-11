import User from "../models/User";
import Comment from "../models/Comment"; // Assuming you have the Comment model defined
import Player from "../models/Player";
import { Op, Sequelize } from "sequelize";

// Get all comments for a specific user or player
export const getCommentsService = async (userId?: number, playerId?: number) => {
  const whereClause: any = {};
  if (userId) whereClause.userId = userId;
  if (playerId) whereClause.playerId = playerId;

  const comments = await Comment.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        attributes: ["id", "fullName", "email"],
      },
      {
        model: Player,
        attributes: ["id", "name"],
      },
    ],
  });
  return comments;
};

// Create a new comment
export const createCommentService = async (commentData: { playerId?: number; userId?: number; message: string; rating?: number }) => {
  const comment = await Comment.create(commentData as any); // Create a new comment record in the database
  return comment;
};

// Update a comment (only if the user or player owns the comment)
export const updateCommentService = async (commentId: number, userId?: number, playerId?: number, message?: string, rating?: number) => {
  const whereClause: any = { id: commentId };

  if (userId) whereClause.userId = userId;
  if (playerId) whereClause.playerId = playerId;

  const comment = await Comment.findOne({
    where: whereClause, // Ensure the comment belongs to the user or player
  });
  
  if (!comment) {
    throw new Error("Comment not found");
  }
  
  // Update the message and rating if provided
  if (message) {
    comment.message = message;
  }
  
  if (rating !== undefined) {
    comment.rating = rating;
  }
  
  await comment.save();
  return comment;
};

// Delete a comment (only if the user or player owns the comment)
export const deleteCommentService = async (commentId: number, userId?: number, playerId?: number) => {
  const whereClause: any = { id: commentId };

  if (userId) whereClause.userId = userId;
  if (playerId) whereClause.playerId = playerId;

  const comment = await Comment.findOne({
    where: whereClause, // Ensure the comment belongs to the user or player
  });
  
  if (!comment) {
    throw new Error("Comment not found");
  }
  
  await comment.destroy(); // Remove the comment from the database
};


export const getTop5PlayersWithMostLikes = async (month: number, year: number) => {
  try {
    // Fetch top 5 players based on the average rating of comments within the specified month and year
    const topPlayers = await Comment.findAll({
      attributes: [
        "playerId",
        [Sequelize.fn("AVG", Sequelize.col("rating")), "averageRating"], // Calculate average rating
        [Sequelize.fn("COUNT", Sequelize.col("Comment.id")), "commentsCount"] // Count the number of comments specifically from Comment table
      ],
      include: [
        {
          model: Player,
          attributes: ["id", "name", "email"],  // Include fields from Player model if needed
        }
      ],
      where: {
        created_at: {
          [Op.between]: [
            new Date(`${year}-${month < 10 ? "0" + month : month}-01`),
            new Date(`${year}-${month < 10 ? "0" + month : month}-31`),
          ],
        },
      },
      group: ["playerId"],  // Group by playerId to calculate average rating for each player
      order: [[Sequelize.literal("averageRating"), "DESC"]],  // Order by average rating, from high to low
      limit: 5,  // Limit the results to top 5 players
    });
    
    // Return the top 5 players with their average rating and number of comments
    return topPlayers.map((player) => ({
      playerId: player.playerId,
      playerName: player.Player.name,
      playerEmail: player.Player.email,
      averageRating: (parseFloat(player.get("averageRating") as string) || 0).toFixed(2), // Round the rating to 2 decimal places
      commentsCount: player.get("commentsCount"),
    }));
  } catch (error) {
    console.error("Error fetching top players:", error);
    throw new Error("Failed to fetch top players.");
  }
};