import User from "../models/User";
import RentalRequest from "../models/RentalRequest";
import { createNotificationService, getNotificationsService } from "./notificationService";
import { io } from "../server";
import Player from "../models/Player";

// Get all rental requests
export const getRentalRequestsService = async () => {
  const rentalRequests = await RentalRequest.findAll();
  return rentalRequests;
};

// Create a new rental request
export const createRentalRequestService = async (payload: any) => {
  const user = await User.findByPk(payload.userId);
  const player = await Player.findByPk(payload.playerId);
  const path = "/rental-request-list";
  await createNotificationService({
    title: "Rental Request",
    message:  `${user.fullName} user is sending a request to hire you`,
    userId: player.userId,
    path,
  });
  const notifications = await getNotificationsService(player.userId);
  io.emit("newPriceNotification", {
    userId: player.userId,
    player: notifications,
  });
  const rentalRequest = await RentalRequest.create(payload);
  return rentalRequest;
};

// Update a rental request (e.g., to approve or reject the request)
export const updateRentalRequestService = async (id: string, payload: any) => {
  const rentalRequest = await RentalRequest.findByPk(id);
  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }
  return await rentalRequest.update(payload);
};

// Delete a rental request
export const deleteRentalRequestService = async (id: string) => {
  const rentalRequest = await RentalRequest.findByPk(id);
  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }
  await rentalRequest.destroy();
  return;
};


export const getRentalRequestByIdPlayerService = async (id: number) => {
  const rentalRequest = await RentalRequest.findAll({
    where: { playerId: id,status:0 },
    include: [
      { model: User, attributes: ["id", "fullName", "email"] },  // Include user details
      { model: Player, attributes: ["id", "name"] },  // Include player details
    ],
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  return rentalRequest; 
};


export const getRentalRequestByIdPlayerAllService = async (id: number) => {
  const rentalRequest = await RentalRequest.findAll({
    where: { playerId: id},
    include: [
      { model: User, attributes: ["id", "fullName", "email"] },  // Include user details
      { model: Player, attributes: ["id", "name"] },  // Include player details
    ],
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  return rentalRequest; 
};