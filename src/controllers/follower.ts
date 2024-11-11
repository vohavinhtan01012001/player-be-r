import { NextFunction, Response } from "express";
import { customRequest } from "../types/customDefinition";
import { createFollowerService, deleteFollowerService, getFollowersService, getTop5PlayersWithMostFollowers, updateFollowerService } from "../services/followerService";

export const getFollowers = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const followers = await getFollowersService();
        return res.status(200).json({
            data: followers,
            error: false,
        });
    } catch (err) {
        next(err);
    }
};

export const createFollower = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, playerId } = req.body;

        if (!userId || !playerId) {
            return res.status(400).json({
                error: true,
                msg: "User ID and Player ID are required",
            });
        }

        const follower = await createFollowerService(userId, playerId);

        return res.status(200).json({
            data: follower,
            error: false,
            msg: "Follower created successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const updateFollower = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        if (!payload.userId && !payload.playerId) {
            return res.status(400).json({
                error: true,
                msg: "User ID or Player ID is required to update",
            });
        }

        const updatedFollower = await updateFollowerService(parseInt(id), payload);

        return res.status(200).json({
            data: updatedFollower,
            error: false,
            msg: "Follower updated successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const deleteFollower = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        await deleteFollowerService(parseInt(id));
        return res.status(200).json({
            error: false,
            msg: "Follower deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};


export const getTopPlayer = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const month = parseInt(req.params.month);
        const year = parseInt(req.params.year);
        const players = await getTop5PlayersWithMostFollowers(month, year);
        return res.status(200).json({
            error: false,
            players: players,
        });
    } catch (err) {
        next(err);
    }
};
