import express from "express";
import authUser from "../middleware/auth.js";
import supportRateLimit from "../middleware/supportRateLimit.js";
import {
  clearSupportSession,
  getSupportHistory,
  sendSupportMessage,
} from "../controllers/supportController.js";

const supportRouter = express.Router();

supportRouter.post("/history", authUser, supportRateLimit, getSupportHistory);
supportRouter.post("/message", authUser, supportRateLimit, sendSupportMessage);
supportRouter.post("/clear", authUser, supportRateLimit, clearSupportSession);

export default supportRouter;
