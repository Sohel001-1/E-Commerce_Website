import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import adminAuth from "../middleware/adminAuth.js";

const settingsRouter = express.Router();

settingsRouter.get("/", getSettings);
settingsRouter.post("/", adminAuth, updateSettings);

export default settingsRouter;
