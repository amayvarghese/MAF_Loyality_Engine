import { Router, type IRouter } from "express";
import healthRouter from "./health";
import customersRouter from "./loyalty/customers";
import brandsRouter from "./loyalty/brands";
import transactionsRouter from "./loyalty/transactions";
import offersRouter from "./loyalty/offers";
import aiOffersRouter from "./ai-offers/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/customers", customersRouter);
router.use("/brands", brandsRouter);
router.use("/transactions", transactionsRouter);
router.use("/offers", offersRouter);
router.use("/ai", aiOffersRouter);

export default router;
