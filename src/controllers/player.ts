import { NextFunction, Request, Response } from "express";
import { createPlayerService, deletePlayerService, getPlayersClientService, getPlayersService, playerGetByIdService, updatePlayerService, updateStatusPlayerService } from "../services/playerService";
import { customPlayerRequest, customRequest } from "customDefinition";
import { v2 as cloudinary } from "cloudinary";
import { Server as SocketIO } from "socket.io";
import { io } from "../server";
import { createNotificationService, getNotificationsService } from "../services/notificationService";
import User from "../models/User";
import { userExists } from "../services/userService";
import { ApiError } from "../util/ApiError";

export const getPlayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const players = await getPlayersService({gameId});
        return res.status(200).json({
            data: players,
            error: false,
        });
    } catch (err) {
        next(err);
    }
};

export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const playerId = parseInt(req.params.playerId); 
        if (isNaN(playerId)) {
            return res.status(400).json({
                message: "Invalid playerId",
                error: true,
            });
        }

        const player = await playerGetByIdService({ playerId });

        return res.status(200).json({
            data: player,
            error: false,
        });
    } catch (err) {
        next(err);
    }
};

export const createPlayer = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const payload = req.body;
        const files: any = req.files;
        const userExist = await userExists({
            email: payload.email,
          });
          if (userExist) {
            throw new ApiError(400, "Email is alredy used");
          }
        // Upload avatar if provided
        if (files && files.avatar && files.avatar.length > 0) {
            const avatar = files.avatar[0];
            const avatarUrl = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "player/avatars",
                    },
                    (error: any, result: any) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                ).end(avatar.buffer);
            });
            payload.avatar = avatarUrl;
        } else {
            return res.status(400).json({
                error: true,
                msg: "No avatar provided",
            });
        }

        // Upload images if provided
        if (files && files["images[]"] && files["images[]"].length > 0) {
            const imagePromises = files["images[]"].map((image: any) => {
                return new Promise<string>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "player/images",
                        },
                        (error: any, result: any) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.secure_url);
                            }
                        }
                    ).end(image.buffer);
                });
            });

            const imagesUrls = await Promise.all(imagePromises);
            payload.images = imagesUrls;
        } 

        const gameIds: number[] = payload.games || []; 

        const newPlayer = await createPlayerService(payload, gameIds);

        return res.status(201).json({
            data: newPlayer,
            error: false,
            msg: "Player created successfully",
        });
    } catch (err) {
        console.error("Error creating player:", err);
        next(err);
    }
};


export const createPlayerUser = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const payload = req.body;
        const files: any = req.files;

        // Upload avatar if provided
        if (files && files.avatar && files.avatar.length > 0) {
            const avatar = files.avatar[0];
            const avatarUrl = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "player/avatars",
                    },
                    (error: any, result: any) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                ).end(avatar.buffer);
            });
            payload.avatar = avatarUrl;
        } else {
            return res.status(400).json({
                error: true,
                msg: "No avatar provided",
            });
        }

        // Upload images if provided
        if (files && files["images[]"] && files["images[]"].length > 0) {
            const imagePromises = files["images[]"].map((image: any) => {
                return new Promise<string>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "player/images",
                        },
                        (error: any, result: any) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.secure_url);
                            }
                        }
                    ).end(image.buffer);
                });
            });

            const imagesUrls = await Promise.all(imagePromises);
            payload.images = imagesUrls;
        }

        // Ensure gameIds and achievements are included in the payload
        const gameIds: number[] = payload.games || []; // Default to an empty array if not provided
        payload.status = 4;

        // Create the new player using a service function
        const newPlayer = await createPlayerService(payload, gameIds);

        // Fetch admin user
        const admin = await User.findOne({ where: { role: 1 } });

        if (admin) {
            // Create notification for admin
            const path = `/admin/players?status=4&active=${newPlayer.id}`;
            await createNotificationService({
                title: `New Player ${newPlayer.id} Created`,
                message: `${newPlayer.name} player is waiting for approval.`,
                userId: admin.id,
                path
            });

            // Fetch updated notifications for the admin
            const notifications = await getNotificationsService(admin.id);

            // Emit notification to clients
            io.emit("newPlayerNotification", {
                message: "A new player has been created.",
                player: notifications,
            });
        } else {
            console.warn("Admin user not found. Skipping notification.");
        }

        return res.status(201).json({
            data: newPlayer,
            error: false,
            msg: "Player created successfully",
        });
    } catch (err) {
        console.error("Error creating player:", err);
        next(err);
    }
};


export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id); // Player ID
        const payload = req.body; // Extract gameIds separately from other payload data
        const files: any = req.files;

        // Handle avatar upload
        if (files?.avatar?.length > 0) {
            const avatar = files.avatar[0];
            const avatarUrl = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "player/avatars" },
                    (error: any, result: any) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                ).end(avatar.buffer);
            });
            payload.avatar = avatarUrl;
        }

        // Handle additional images upload
        if (files?.["images[]"]?.length > 0) {
            const imagePromises = files["images[]"].map((image: any) =>
                new Promise<string>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: "player/images" },
                        (error: any, result: any) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    ).end(image.buffer);
                })
            );

            const imagesUrls = await Promise.all(imagePromises);
            payload.images = imagesUrls;
        }

        console.log(payload);
        const gameIds: number[] = payload.games || []; 
        // Call update service with player data and game IDs    
        const updatedPlayer = await updatePlayerService(id, payload, gameIds);

        return res.status(200).json({
            data: updatedPlayer,
            error: false,
            msg: "Player updated successfully",
        });
    } catch (err) {
        next(err);
    }
};


export const deletePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await deletePlayerService(id);

        return res.status(200).json({
            error: false,
            msg: "Player deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};


export const updateStatusPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id); 
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: true,
                msg: "Status is required",
            });
        }

        const updatedPlayer = await updateStatusPlayerService(id, status);
        return res.status(200).json({
            data: updatedPlayer,
            error: false,
            msg: "Player status updated successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const getPlayerData = async (
    req: customPlayerRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      return res.status(200).json({
        data: req.player,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  };

export const getPlayersClient = async (req: Request, res: Response, next: NextFunction) => {
try {
    const gameId = parseInt(req.params.gameId);
    const players = await getPlayersClientService({gameId});
    return res.status(200).json({
        data: players,
        error: false,
    });
} catch (err) {
    next(err);
}
};

