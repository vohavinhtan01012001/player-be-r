import { NextFunction, Response } from "express";
import { customRequest } from "../types/customDefinition";
import { createGameService, deleteGameService, getGamesService, updateGameService } from "../services/gamesService";
import { v2 as cloudinary } from "cloudinary";

export const getGames = async (
    req: customRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const games = await getGamesService();
      return res.status(200).json({
        data: games,
        error: false,
      });
    } catch (err) {
      next(err);
    }
};
  
export const createGame = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const payload = req.body;
        const file: any = req.files;

        if (file && file.image && file.image.length > 0) {
            const image = file.image[0]; 
            const imageUrl = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "player",
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

            payload.image = imageUrl;
        } else {
            return res.status(400).json({
                error: true,
                msg: "No image provided",
            });
        }

        const game = await createGameService(payload);

        return res.status(200).json({
            data: game,
            error: false,
            msg: "Game created successfully",
        });
    } catch (err) {
        next(err);
    }
};
  

export const updateGame = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        const file: any = req.files;

        if (file && file.image && file.image.length > 0) {
            const image = file.image[0]; 
            const imageUpload = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "player",
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

            payload.image = imageUpload; 
        }

        const updatedGame = await updateGameService(id, payload);

        return res.status(200).json({
            data: updatedGame,
            error: false,
            msg: "Game updated successfully",
        });
    } catch (err) {
        next(err);
    }
};


export const deleteGame = async (
    req: customRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        await deleteGameService(id);
        return res.status(200).json({
            error: false,
            msg: "Game deleted successfully",
        });
    } catch (err) {
        next(err); 
    }
};