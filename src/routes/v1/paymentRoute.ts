import { Router } from "express";
import { paymentVnpay, paymentVnpayCheck } from "../../controllers/payment";
import { requireUser } from "../../middleware";
const paymentRouter = Router();

paymentRouter.post("/", requireUser,paymentVnpay);
paymentRouter.post("/vnpay-check",requireUser, paymentVnpayCheck);
export default paymentRouter;