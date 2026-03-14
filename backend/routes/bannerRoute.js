import express from "express";
import { addBanner, listBanners, removeBanner, updateBanner } from "../controllers/bannerController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const bannerRouter = express.Router();

bannerRouter.post("/add", adminAuth, upload.single("image"), addBanner);
bannerRouter.get("/list", listBanners);
bannerRouter.post("/update", adminAuth, upload.single("image"), updateBanner);
bannerRouter.post("/remove", adminAuth, removeBanner);

export default bannerRouter;
