import { Router } from "express";
import { createRentalRequest, deleteRentalRequest, getRentalRequestByIdPlayer, getRentalRequests, updateRentalRequest } from "../../controllers/rentalRequest";
import { isAdmin, requireUser } from "../../middleware";

const rentalRequestRouter = Router();

rentalRequestRouter.get("/", getRentalRequests);

rentalRequestRouter.post("/add-rental-request",requireUser, createRentalRequest);

rentalRequestRouter.put("/update-rental-request/:id", isAdmin, updateRentalRequest);

rentalRequestRouter.delete("/delete-rental-request/:id",requireUser , deleteRentalRequest);

rentalRequestRouter.get("/player/:id", getRentalRequestByIdPlayer);

export default rentalRequestRouter;
