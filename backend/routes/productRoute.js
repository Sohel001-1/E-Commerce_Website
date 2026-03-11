import express from "express";
import {
  addProduct,
  updateProduct,
  listProduct,
  listCollectionProducts,
  getCollectionFilters,
  removeProduct,
  singleProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);

productRouter.post(
  "/update",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateProduct
);

productRouter.get("/list", listProduct);
productRouter.get("/collection", listCollectionProducts);
productRouter.get("/filters", getCollectionFilters);

productRouter.delete("/remove/:id", adminAuth, removeProduct);
productRouter.post("/remove", adminAuth, removeProduct);

productRouter.get("/single/:id", singleProduct);
productRouter.post("/single", singleProduct);

export default productRouter;
