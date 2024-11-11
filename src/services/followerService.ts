import Follower from "../models/Follower";
import { Op, Sequelize } from "sequelize";
import Player from "../models/Player";
// Lấy danh sách tất cả follower
export const getFollowersService = async () => {
    const followers = await Follower.findAll();
    return followers;
};

// Tạo một follower mới
export const createFollowerService = async (userId: number, playerId: number) => {
    const follower = await Follower.create({ userId, playerId });
    return follower;
};

// Cập nhật một follower
export const updateFollowerService = async (id: number, payload: Partial<{ userId: number; playerId: number }>) => {
    const follower = await Follower.findByPk(id);
    if (!follower) {
        throw new Error("Follower not found");
    }
    return await follower.update(payload);
};

// Xóa một follower theo ID
export const deleteFollowerService = async (id: number) => {
    const follower = await Follower.findByPk(id);
    if (!follower) {
        throw new Error("Follower not found");
    }
    await follower.destroy();
    return;
};

export const getTop5PlayersWithMostFollowers = async (month: number, year: number) => {
    try {
      const startDate = new Date(`${year}-${month < 10 ? "0" + month : month}-01`);
      const endDate = new Date(`${year}-${month < 10 ? "0" + month : month}-31`);
  
      const topPlayers = await Follower.findAll({
        attributes: [
          "playerId",
          [Sequelize.fn("COUNT", Sequelize.col("followers.id")), "followersCount"] // Specify 'followers.id' here
        ],
        include: [
          {
            model: Player,
            attributes: ["id", "name", "email"], // Include player information
          }
        ],
        where: {
          created_at: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: ["playerId"], // Group by playerId to count followers per player
        order: [[Sequelize.literal("followersCount"), "DESC"]], // Order by followers count in descending order
        limit: 5, // Limit to top 5 players
      });
  
      // Map the results to a simplified format
      return topPlayers.map((record) => ({
        playerId: record.playerId,
        playerName: record.Player.name,
        playerEmail: record.Player.email,
        followersCount: record.get("followersCount"),
      }));
    } catch (error) {
      console.error("Error fetching top players:", error);
      throw new Error("Failed to fetch top players.");
    }
  };