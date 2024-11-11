import { NextFunction, Response } from "express";
import { customRequest } from "../types/customDefinition";
import { createBannerService, deleteBannerService, getBannersService, updateBannerService } from "../services/bannerService";
import { v2 as cloudinary } from "cloudinary";

export const getBanners = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const banners = await getBannersService();
    return res.status(200).json({
      data: banners,
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (
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
            folder: "banners", // You can set your folder name here
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

    const banner = await createBannerService(payload);

    return res.status(200).json({
      data: banner,
      error: false,
      msg: "Banner created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateBanner = async (
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
            folder: "banners", // You can set your folder name here
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

    const updatedBanner = await updateBannerService(id, payload);

    return res.status(200).json({
      data: updatedBanner,
      error: false,
      msg: "Banner updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await deleteBannerService(id);
    return res.status(200).json({
      error: false,
      msg: "Banner deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
