import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import bannerRouter from "./routes/bannerRoute.js";
import inquiryRouter from "./routes/inquiryRoute.js";
import settingsRouter from "./routes/settingsRoute.js";
import supportRouter from "./routes/supportRoute.js";
import vehicleRouter from "./routes/vehicleRoute.js";

const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vehicleMediaDir = path.resolve(__dirname, "public", "vehicle-media");

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/vehicle-media", express.static(vehicleMediaDir));

// Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/support", supportRouter);
app.use("/api/vehicle", vehicleRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }

  console.error("Unhandled request error:", err?.message || err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ✅ SAFE BOOTSTRAP
const startServer = async () => {
  try {
    await connectDB(); // ⬅️ MUST WAIT
    connectCloudinary();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
