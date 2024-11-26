import { Router } from "express";
import { getSystem, getTransactionHistories } from "../../controllers/transactionHistory";

const transRouter = Router();

transRouter.get("/:month/:year", getTransactionHistories);
transRouter.get("/system", getSystem);


export default transRouter;