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
        const month = parseInt(req.params.month); // Lấy status từ params
        const year = parseInt(req.params.year); // Lấy year từ params
        if (isNaN(month) || isNaN(year)) {
            return res.status(400).json({
              error: true,
              message: "Invalid status or year",
            });
          }
      
      const trans = await getTransactionHistoryService(year,month);
      return res.status(200).json({
        data: trans,
        error: false,
      });
    } catch (err) {
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