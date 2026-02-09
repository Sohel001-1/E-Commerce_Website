import express from "express";
import {
  addProduct,
  updateProduct,   // ✅ add this
  listProduct,
  removeProduct,
  singleProduct,
} from "../controllers/productController.js";

import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// ✅ route for adding product
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

// ✅ route for updating product (EDIT FEATURE)
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

// ✅ route for listing products
productRouter.get("/list", listProduct);

// ✅ route for removing product
productRouter.delete("/remove/:id", adminAuth, removeProduct); // protect delete
productRouter.post("/remove", adminAuth, removeProduct);       // protect post remove

// ✅ route for single product info
productRouter.get("/single/:id", singleProduct); // better REST style
productRouter.post("/single", singleProduct);    // keep if your frontend uses it

export default productRouter;
