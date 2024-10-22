import { Router } from "express";

import authRouter from "./authRoute";
import docsRouter from "./docsRoute";
import userRouter from "./userRoutes";
import gameRouter from "./gameRoute";
import playerRouter from "./playerRoute";
import notificationRouter from "./notificationRoute";
import paymentRouter from "./paymentRoute";
import rentalRequestRouter from "./rentalRequestRoute";

const appRouter = Router();

// all routes
const appRoutes = [
  {
    path: "/auth",
    router: authRouter,
  },
  {
    path: "/user",
    router: userRouter,
  },
  {
    path: "/game",
    router: gameRouter,
  },
  {
    path: "/player",
    router: playerRouter,
  },
  {
    path: "/rental-Request",
    router: rentalRequestRouter,
  },
  {
    path: "/notification",
    router: notificationRouter,
  },
  {
    path: "/payment",
    router: paymentRouter,
  },
  {
    path: "/docs",
    router: docsRouter,
  },
];

appRoutes.forEach(route => {
  appRouter.use(route.path, route.router);
});

export default appRouter;
