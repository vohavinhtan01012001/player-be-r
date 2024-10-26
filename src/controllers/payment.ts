import { NextFunction, Request, Response } from "express";
import { vnpayIPN, vnpaymentService } from "../services/paymentService";
import { customRequest } from "customDefinition";
import User from "../models/User";
import { io } from "../server";
import { createNotificationService } from "../services/notificationService";
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

export const withdrawMoney = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.body.user;
    const payload = req.body.payload;

    // Check if the amount to withdraw is valid
    if (!payload.amount || payload.amount <= 0) {
      return res.status(400).json({ message: "Số tiền không hợp lệ!" });
    }

    // Ensure user has enough balance
    if (user.price < payload.amount) {
      return res.status(400).json({ message: "Số dư không đủ để thực hiện rút tiền!" });
    }

    // Update user's balance
    const updatedUser = await User.update(
      { price: user.price - payload.amount },
      { where: { id: user.id } }
    );

    // Check if the update was successful
    if (updatedUser[0] === 0) {
      return res.status(404).json({ message: "Người dùng không tìm thấy!" });
    }

    // Notify success via Socket.IO only on successful withdrawal
    const path = "/profile"; // Adjust the path as needed
    await createNotificationService({
      title: "Withdrawal Successful",
      message: `${user.fullName} has successfully withdrawn money.`,
      userId: user.id, 
      path
    });

    // Notify success via Socket.IO
    io.emit("newPriceNotification", {
      message: "Rút tiền thành công!",
      newBalance: user.price - payload.amount,
    });

    // Respond with success
    return res.status(200).json({
      message: "Rút tiền thành công!",
      newBalance: user.price - payload.amount,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in withdrawMoney:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi, vui lòng thử lại!" });
  }
};
