import { Router } from "express";
import { getPlayers, createPlayer, updatePlayer, deletePlayer, getPlayerById, createPlayerUser, updateStatusPlayer, getPlayerData, getPlayersClient } from "../../controllers/player";
import multer from "multer";
import isAdmin from "../../middleware/isAdmin";

const playerRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

playerRouter.get("/:gameId", getPlayers);
playerRouter.get("/get/:playerId", getPlayerById);
playerRouter.post("/add-player",
    isAdmin,
    upload.fields([
        { name: "images[]", maxCount: 10 }, 
        { name: "avatar", maxCount: 1 },
    ]),
    createPlayer
);
playerRouter.post("/add-player-user",
    upload.fields([
        { name: "images[]", maxCount: 10 }, 
        { name: "avatar", maxCount: 1 },
    ]),
    createPlayerUser
);
playerRouter.put("/update-player/:id",
    isAdmin,
     upload.fields([
        { name: "images[]", maxCount: 10 }, 
        { name: "avatar", maxCount: 1 },
    ]), 
    updatePlayer
);

playerRouter.delete("/delete-player/:id", deletePlayer);

playerRouter.patch("/update-status/:id",
    isAdmin,
    updateStatusPlayer
);

playerRouter.get("/get-player", getPlayerData);
playerRouter.get("/get-player-client/:gameId", getPlayersClient);

export default playerRouter;
