import express from "express";
import { placeOrder, placeOrderStripe, allOrder, userOrders, updateStatus, verifyStripe } from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrder);
orderRouter.post("/status", adminAuth, updateStatus);

// Payment Methods
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);

// User Features
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/verifyStripe", authUser, verifyStripe);

export default orderRouter;