import { Router } from "express";
import { paymentVnpay, paymentVnpayCheck, withdrawMoney } from "../../controllers/payment";
import { requireUser } from "../../middleware";
const paymentRouter = Router();

paymentRouter.post("/", requireUser,paymentVnpay);
paymentRouter.post("/vnpay-check",requireUser, paymentVnpayCheck);
paymentRouter.post("/withdraw-money",requireUser, withdrawMoney);
export default paymentRouter;