import { Router } from "express";

import authRouter from "./authRoute";
import docsRouter from "./docsRoute";
import userRouter from "./userRoutes";
import gameRouter from "./gameRoute";
import playerRouter from "./playerRoute";
import notificationRouter from "./notificationRoute";
import paymentRouter from "./paymentRoute";
import rentalRequestRouter from "./rentalRequestRoute";
import chatRouter from "./chatRoute";
import commentRouter from "./commentRoute";
import followerRouter from "./follower";
import bannerRouter from "./bannerRoute";

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
    path: "/chat",
    router: chatRouter,
  },
  {
    path: "/comment",
    router: commentRouter,
  },
  {
    path: "/payment",
    router: paymentRouter,
  },
  {
    path: "/follower",
    router: followerRouter,
  },  
  {
    path: "/banner",
    router: bannerRouter,
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
