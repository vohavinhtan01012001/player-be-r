import { Request, Response, NextFunction } from "express";
import {
  createCommentService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
  getTop5PlayersWithMostLikes
} from "../services/commentService";
import { customRequest } from "customDefinition";
import { updateRentalRequestService } from "../services/rentalRequestService";

// Get all comments for a specific user or player
export const getComments = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : undefined;
    const playerId = req.params.playerId ? parseInt(req.params.playerId) : undefined;

    const comments = await getCommentsService(userId, playerId);
    return res.status(200).json({
      data: comments,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

// Create a new comment
export const createComment = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playerId, userId, message, rating, rental } = req.body;
    const comment = await createCommentService({ playerId, userId, message, rating });
    await updateRentalRequestService(rental.id, { rating: false });
    return res.status(201).json({
      data: comment,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

// Update an existing comment
export const updateComment = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = parseInt(req.params.id);  // Comment ID from URL params
    const { message, rating } = req.body;  // New comment message and rating from the request body

    const updatedComment = await updateCommentService(commentId, req.user.id, undefined, message, rating);

    return res.status(200).json({
      data: updatedComment,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a comment
export const deleteComment = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = parseInt(req.params.id);  // Comment ID from URL params
    await deleteCommentService(commentId, req.user.id);  // Assuming only the initiator can delete their comments

    return res.status(200).json({
      message: "Comment deleted successfully",
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const getTopPlayersWithMostLikes = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    const updatedComment = await getTop5PlayersWithMostLikes(month,year);

    return res.status(200).json({
      data: updatedComment,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};
