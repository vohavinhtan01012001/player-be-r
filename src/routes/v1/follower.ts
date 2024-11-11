import { Router } from "express";
import { getFollowers, createFollower, updateFollower, deleteFollower, getTopPlayer } from "../../controllers/follower";
import { requireUser } from "../../middleware";

const followerRouter = Router();

// Lấy tất cả followers
followerRouter.get("/", getFollowers);

// Tạo mới follower
followerRouter.post(
    "/add-follower",
    requireUser, 
    createFollower
);

// Cập nhật follower
followerRouter.put(
    "/update-follower/:id",
    requireUser, 
    updateFollower
);

// Xóa follower
followerRouter.delete(
    "/delete-follower/:id",
    requireUser, 
    deleteFollower
);


followerRouter.get("/top-player/:month/:year", getTopPlayer);
export default followerRouter;
