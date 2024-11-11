import { Router } from "express";
import { getComments, createComment, updateComment, deleteComment, getTopPlayersWithMostLikes } from "../../controllers/comment"; // Importing the comment controller functions
import requireUser from "../../middleware/requiresUser"; // Middleware to ensure the user is logged in
import { isAdmin } from "../../middleware";

const commentRouter = Router();

// Get all comments for a specific user or player
commentRouter.get("/:playerId/:userId?", requireUser, getComments);

// Create a new comment
commentRouter.post("/", requireUser, createComment);

// Update an existing comment
commentRouter.put("/:id", requireUser, updateComment);

// Delete a comment
commentRouter.delete("/:id", requireUser, deleteComment);
commentRouter.get("/get-top-player/:month/:year", isAdmin, getTopPlayersWithMostLikes);

export default commentRouter;
