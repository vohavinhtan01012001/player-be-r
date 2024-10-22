import { Router } from "express";
import { createGame, deleteGame, getGames, updateGame } from "../../controllers/game";
import { isAdmin } from "../../middleware";
import multer from "multer";

const gameRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

gameRouter.get("/", getGames);

gameRouter.post(
    "/add-game",
    isAdmin,
    upload.fields([
        { name: "image", maxCount: 1 },
    ]),
    createGame
);

gameRouter.put(
    "/update-game/:id",
    isAdmin,
    upload.fields([
      { name: "image", maxCount: 1 },
    ]),
    updateGame
);

gameRouter.delete("/delete-game/:id", isAdmin, deleteGame);

export default gameRouter;