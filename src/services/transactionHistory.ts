import User from "../models/User";
import TransactionHistory from "../models/TransactionHistory";
import { Op } from "sequelize";

export const getTransactionHistoryService = async (year: number, month: number) => {
  const startDate = new Date(`${year}-${month < 10 ? `0${month}` : month}-01`);
  const endDate = new Date(`${year}-${month < 10 ? `0${month}` : month}-31`); // Ngày cuối tháng (giả định tháng có tối đa 31 ngày)

  const transactions = await TransactionHistory.findAll({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
        { model: User, attributes: ["id", "fullName"] },  
      ],
  });

  return transactions;
};
