import { NextFunction, Request, Response } from "express";
import { vnpayIPN, vnpaymentService } from "../services/paymentService";
import { customRequest } from "customDefinition";
export const paymentVnpay = async (
  req: customRequest,
    res: Response,
    next: NextFunction
  ) => {
    const amount = req.body.amount;
    const { id: userId } = req.user;
  
    const { vnp_Url } = await vnpaymentService(amount,userId, req);
  
    if (vnp_Url) {
      console.log(vnp_Url);
      // Redirect the user to the VNPAY URL for payment initiation
      return res.status(200).json(vnp_Url);
    } else {
      // Handle case when vnp_Url is not available or falsy
      throw new Error("Failed to generate payment URL");
    }
    // Handle errors occurring during payment initiation
  };


export const paymentVnpayCheck = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
    const vnp_Params = req.body.vnp_Params;
    const { id: userId } = req.user;
    const check = await vnpayIPN(vnp_Params,userId);
    return res.status(200).json(check);
};
  