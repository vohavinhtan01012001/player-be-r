import { Router } from "express";
import { createRentalRequest, deleteRentalRequest, getRentalRequestAllByStatus, getRentalRequestByIdPlayer, getRentalRequestByIdPlayerAll, getRentalRequests, getTop5PlayersWithMostRentalRequests, updateRentalRequest } from "../../controllers/rentalRequest";
import { isAdmin, requireUser } from "../../middleware";

const rentalRequestRouter = Router();

rentalRequestRouter.get("/", getRentalRequests);

rentalRequestRouter.post("/add-rental-request",requireUser, createRentalRequest);

rentalRequestRouter.put("/update-rental-request/:id", requireUser, updateRentalRequest);

rentalRequestRouter.delete("/delete-rental-request/:id",requireUser , deleteRentalRequest);

rentalRequestRouter.get("/player/:id", getRentalRequestByIdPlayer);
rentalRequestRouter.get("/player-all/:id", getRentalRequestByIdPlayerAll);
rentalRequestRouter.get("/player-all-status/:status/:year",isAdmin, getRentalRequestAllByStatus);
rentalRequestRouter.get("/player-all-top-player/:month/:year",isAdmin, getTop5PlayersWithMostRentalRequests);

export default rentalRequestRouter;
