import User from "../models/User";
import RentalRequest from "../models/RentalRequest";
import { createNotificationService, getNotificationsService } from "./notificationService";
import { io } from "../server";
import Player from "../models/Player";
import { Sequelize, Op } from "sequelize"; 
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



export const getRentalRequestPlayerAllByStatusService = async (status: number, year: number) => {
  const whereCondition: any = {
    status, // Lọc theo status
    created_at: {
      [Op.between]: [new Date(`${year}-01-01`), new Date(`${year}-12-31`)], // Lọc theo created_at trong năm
    }
  };

  const rentalRequests = await RentalRequest.findAll({
    where: whereCondition,
    include: [
      { model: User, attributes: ["id", "fullName", "email"] },  // Include user details
      { model: Player, attributes: ["id", "name"] },  // Include player details
    ],
  });


  const monthlyCounts = Array(12).fill(0);  // Mảng có 12 phần tử, mỗi phần tử là 0

  // Duyệt qua tất cả các rentalRequest và đếm số lượng theo tháng
  rentalRequests.forEach((request) => {
    const month = request.created_at.getMonth(); // Lấy tháng từ created_at (tháng là 0-indexed, tức là tháng 0 là tháng 1)
    monthlyCounts[month] += 1; // Tăng số lượng cho tháng tương ứng
  });

  return monthlyCounts; // Trả về mảng tổng số rentalRequest cho từng tháng
};

export const getTop5PlayersWithMostRentalRequestsService = async (year: number, month: number) => {
  // Lọc theo năm và tháng, sử dụng Op.between để lấy rentalRequest trong tháng cụ thể
  const whereCondition: any = {
    status:2,
    created_at: {
      [Op.between]: [
        new Date(`${year}-${month < 10 ? "0" + month : month}-01`), // Ngày đầu tháng
        new Date(`${year}-${month < 10 ? "0" + month : month}-31`), // Ngày cuối tháng
      ],
    },
  };

  // Lấy tất cả rentalRequests thỏa mãn điều kiện
  const rentalRequests = await RentalRequest.findAll({
    where: whereCondition,
    include: [
      { model: Player, attributes: ["id", "name"] },  // Include player details thay vì user
    ],
  });
  // Tạo một đối tượng để đếm số lượng rentalRequest cho từng PlayerId
  const playerRequestCount: { [playerId: number]: number } = {};

  rentalRequests.forEach((request) => {
    const playerId = request.playerId; // Dùng playerId thay vì userId
    playerRequestCount[playerId] = (playerRequestCount[playerId] || 0) + 1; // Tăng số lượng rentalRequest cho playerId
  });

  // Sắp xếp các PlayerId theo số lượng rentalRequests giảm dần và lấy top 5
  const top5Players = Object.entries(playerRequestCount)
    .map(([playerId, count]) => ({ playerId: parseInt(playerId), count })) // Chuyển đổi thành mảng đối tượng { playerId, count }
    .sort((a, b) => b.count - a.count) // Sắp xếp theo số lượng giảm dần
    .slice(0, 5); // Lấy top 5

  // Lấy thông tin player từ top 5
  const playersWithMostRequests = await Player.findAll({
    where: {
      id: top5Players.map(player => player.playerId), // Tìm player có trong danh sách top 5
    },
  });

  // Trả về danh sách top 5 player với số lượng rentalRequests
  return top5Players.map(player => {
    const playerDetails = playersWithMostRequests.find(p => p.id === player.playerId);
    return {
      player: playerDetails,
      rentalRequestsCount: player.count,
    };
  });
};






