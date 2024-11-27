import User from "../models/User";
import TransactionHistory from "../models/TransactionHistory";
import { Op } from "sequelize";

export const getTransactionHistoryService = async (year: number, month: number, userId: number) => {
  const startDate = new Date(`${year}-${month < 10 ? `0${month}` : month}-01`);
  const endDate = new Date(`${year}-${month < 10 ? `0${month}` : month}-31`); // Ngày cuối tháng (giả định tháng có tối đa 31 ngày)

  // Xây dựng điều kiện where động
  const whereClause: any = {
    created_at: {
      [Op.between]: [startDate, endDate],
    },
  };

  if (userId !== 0) {
    whereClause.userId = userId; // Chỉ thêm điều kiện userId khi userId khác 0
  }

  const transactions = await TransactionHistory.findAll({
    where: whereClause,
    include: [
      { model: User, attributes: ["id", "fullName"] },
    ],
    order: [["created_at", "DESC"]], // Sắp xếp từ mới nhất đến cũ nhất
  });

  return transactions;
};
