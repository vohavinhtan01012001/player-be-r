import { NextFunction, Response } from "express";
import { customRequest } from "../types/customDefinition";
import { getTransactionHistoryService } from "../services/transactionHistory";
import SystemTotalAmount from "../models/SystemTotalAmount";

export const getTransactionHistories = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Lấy tham số từ route
    const month = parseInt(req.params.month, 10); 
    const year = parseInt(req.params.year, 10);
    const userId = req.params.userId ? parseInt(req.params.userId, 10) : 0;

    // Kiểm tra giá trị month và year
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 0) {
      return res.status(400).json({
        error: true,
        message: "Invalid month or year. Month must be between 1 and 12, and year must be a positive number.",
      });
    }

    // Gọi service để lấy dữ liệu giao dịch
    const trans = await getTransactionHistoryService(year, month, userId);

    return res.status(200).json({
      data: trans,
      error: false,
    });
  } catch (err) {
    // Chuyển lỗi sang middleware xử lý lỗi
    next(err);
  }
};


export const getSystem = async (
    req: customRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trans = await SystemTotalAmount.findByPk(1);
      return res.status(200).json({
        data: trans,
        error: false,
      });
    } catch (err) {
      next(err);
    }
};