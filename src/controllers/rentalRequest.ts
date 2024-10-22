import { NextFunction, Response } from "express";
import { customRequest } from "../types/customDefinition";
import { 
  createRentalRequestService, 
  deleteRentalRequestService, 
  getRentalRequestByIdPlayerService, 
  getRentalRequestsService, 
  updateRentalRequestService 
} from "../services/rentalRequestService";
import { io } from "../server";

// Get all rental requests
export const getRentalRequests = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const rentalRequests = await getRentalRequestsService();
    return res.status(200).json({
      data: rentalRequests,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const createRentalRequest = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body; 
    const userId = req.user.id;
    const payloadData = {...payload,userId: userId};
    const rentalRequest = await createRentalRequestService(payloadData);
    return res.status(201).json({
      data: rentalRequest,
      error: false,
      msg: "Rental request created successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Update a rental request (e.g., to approve or reject the request)
export const updateRentalRequest = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const payload = req.body; // Assuming payload contains status or other fields to update
    const updatedRentalRequest = await updateRentalRequestService(id, payload);

    // Emit a WebSocket event when a rental request is updated
    io.emit("rentalRequestUpdated", {
      message: "A rental request has been updated",
      data: updatedRentalRequest,
    });

    return res.status(200).json({
      data: updatedRentalRequest,
      error: false,
      msg: "Rental request updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Delete a rental request
export const deleteRentalRequest = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await deleteRentalRequestService(id);

    // Emit a WebSocket event when a rental request is deleted
    io.emit("rentalRequestDeleted", {
      message: "A rental request has been deleted",
      rentalRequestId: id,
    });

    return res.status(200).json({
      error: false,
      msg: "Rental request deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getRentalRequestByIdPlayer = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id); // Lấy ID từ URL params
    const rentalRequests = await getRentalRequestByIdPlayerService(userId); // Gọi service với ID nếu có
    return res.status(200).json({
      data: rentalRequests,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};