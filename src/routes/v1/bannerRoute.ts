import { Router } from "express";
import { createBanner, deleteBanner, getBanners, updateBanner } from "../../controllers/banner";
import { isAdmin } from "../../middleware";
import multer from "multer";

const bannerRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to get all banners
bannerRouter.get("/", getBanners);

// Route to create a new banner
bannerRouter.post(
  "/add-banner",
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  createBanner
);

// Route to update an existing banner
bannerRouter.put(
  "/update-banner/:id",
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  updateBanner
);

// Route to delete a banner
bannerRouter.delete("/delete-banner/:id", isAdmin, deleteBanner);

export default bannerRouter;
