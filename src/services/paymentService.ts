import qs from "qs";
import crypto from "crypto";
import { clientConfig, paymentConfig } from "../config/config";
import User from "../models/User";
import { io } from "../server";
import { createNotificationService, getNotificationsService } from "./notificationService";
import Player from "../models/Player";

interface SortedObject {
  [key: string]: string;
}

function sortObject(obj: any): SortedObject {
  const sorted: SortedObject = {};
  const str: string[] = Object.keys(obj).map(key => encodeURIComponent(key));

  str.sort();

  for (let key = 0; key < str.length; key++) {
    const sortedKey = str[key];
    sorted[sortedKey] = encodeURIComponent(
      obj[decodeURIComponent(sortedKey)]
    ).replace(/%20/g, "+");
  }

  return sorted;
}

export const vnpaymentService = async (amount: number, userId: number, req: any) => {
  try {
    const exchangeRateUSDToVND:number = parseFloat(paymentConfig.exchangeRateUSDToVND); 
    const id = Math.floor(Math.random() * 10000).toString();
    const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_Returnurl = `${clientConfig.clientUrl}/thanks`;
    const vnp_TmnCode = paymentConfig.tmncode; // Mã website tại VNPAY
    const vnp_HashSecret = paymentConfig.hashsecret; // Chuỗi bí mật

    const vnp_TxnRef = id; // Mã đơn hàng
    const vnp_OrderInfo = "Thanh+toan+don+hang+test";
    const vnp_OrderType = "billpayment";
    const vnp_Amount = Math.round(amount * 100 * exchangeRateUSDToVND);
    const vnp_Locale = "en";
    const vnp_BankCode = "NCB";
    const vnp_IpAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const vnp_CreateDate = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const inputData: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: vnp_Locale,
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_OrderType: "other",
      vnp_Amount: vnp_Amount,
      vnp_ReturnUrl: vnp_Returnurl,
      vnp_IpAddr: vnp_IpAddr,
      vnp_CreateDate: vnp_CreateDate,
      vnp_BankCode: vnp_BankCode,
    };

    if (vnp_BankCode !== null) {
      inputData.vnp_BankCode = vnp_BankCode;
    }

    const inputDatas = sortObject(inputData);
    const querystring = qs;
    const signData = querystring.stringify(inputDatas, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    inputDatas["vnp_SecureHash"] = signed;
    const finalUrl =
      vnp_Url + "?" + querystring.stringify(inputDatas, { encode: false });

    return { vnp_Url: finalUrl };
  } catch (error) {
    throw error;
  }
};


export const vnpayIPN = async (
  vnp_Params: any,
  userId: number
) => {
  try {
    const exchangeRateUSDToVND:number = parseFloat(paymentConfig.exchangeRateUSDToVND); 
    const secureHash = vnp_Params["vnp_SecureHash"];
    const rspCode = vnp_Params["vnp_ResponseCode"];
    const amount = vnp_Params["vnp_Amount"];
    const txnRef = vnp_Params["vnp_TxnRef"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = paymentConfig.hashsecret;

    const querystring = qs;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Kiểm tra txnRef trong CSDL của bạn trước khi xử lý giao dịch
    const user = await User.findOne({ where: { id: userId } });

    // Nếu txnRef đã tồn tại, chặn xử lý lại giao dịch
    if (user.txnRef === txnRef) {
      console.log("Giao dịch đã được xử lý, không thực hiện lại.");
      return { RspCode: "02", Message: "Transaction already processed" };
    }

    const checkOrderId = true;
    const checkAmount = true;

    if (secureHash == signed) {
      if (checkOrderId) {
        if (checkAmount) {
          if (rspCode === "00") {
            // Cập nhật txnRef và số tiền cho người dùng
            await User.update({ txnRef: txnRef }, { where: { id: userId } });

            const currentPrice = user.price;
            const depositAmount = amount / 100;
            const amountDes = depositAmount - (depositAmount * 0.01);

            const newPrice = (currentPrice + amountDes) / exchangeRateUSDToVND;

            await User.update({ price: newPrice }, { where: { id: userId } });

            const path = "/profile";
            await createNotificationService({
              title: "Deposit successful",
              message: `Successfully deposited ${new Intl.NumberFormat("USD").format((Number(amountDes / exchangeRateUSDToVND) || 0))} USD`,
              userId: userId,
              path,
            });

            const notifications = await getNotificationsService(userId);

            io.emit("newPriceNotification", {
              userId: userId,
              message: `Successfully deposited ${new Intl.NumberFormat("USD").format((Number(amountDes / exchangeRateUSDToVND) || 0))} USD`,
              player: notifications,
            });

            return { RspCode: "00", Message: "Success" };
          } else {
            return { RspCode: "99", Message: "Transaction failed" };
          }
        } else {
          return { RspCode: "04", Message: "Amount invalid" };
        }
      } else {
        return { RspCode: "01", Message: "Order not found" };
      }
    } else {
      return { RspCode: "97", Message: "Checksum failed" };
    }
  } catch (error) {
    // Xử lý các lỗi nếu có
    console.error(error);
    return { RspCode: "99", Message: "Internal server error" };
  }
};

