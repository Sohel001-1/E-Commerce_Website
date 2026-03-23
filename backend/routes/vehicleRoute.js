import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  listVehicleCatalog,
  listVehicleAdminCatalog,
  addVehicleBrand,
  updateVehicleBrand,
  removeVehicleBrand,
  addVehicleModel,
  updateVehicleModel,
  removeVehicleModel,
} from "../controllers/vehicleController.js";

const vehicleRouter = express.Router();

vehicleRouter.get("/catalog", listVehicleCatalog);
vehicleRouter.get("/admin/catalog", adminAuth, listVehicleAdminCatalog);

vehicleRouter.post("/brand/add", adminAuth, upload.single("logo"), addVehicleBrand);
vehicleRouter.post(
  "/brand/update",
  adminAuth,
  upload.single("logo"),
  updateVehicleBrand,
);
vehicleRouter.post("/brand/remove", adminAuth, removeVehicleBrand);

vehicleRouter.post("/model/add", adminAuth, upload.single("image"), addVehicleModel);
vehicleRouter.post(
  "/model/update",
  adminAuth,
  upload.single("image"),
  updateVehicleModel,
);
vehicleRouter.post("/model/remove", adminAuth, removeVehicleModel);

export default vehicleRouter;
