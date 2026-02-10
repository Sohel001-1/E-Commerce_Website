import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  uploadProfileImage,
  toggleWishlist,
  getWishlist,
  changePassword,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

// Public Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

// Protected Profile Routes
// Note: authUser middleware extracts the userId from the token
userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.post("/update-profile", authUser, updateUserProfile);

// Address Management Routes
userRouter.post("/add-address", authUser, addAddress);
userRouter.post("/address/delete", authUser, deleteAddress);
userRouter.post("/address/default", authUser, setDefaultAddress);

// Image Upload Route
userRouter.post("/upload-image", authUser, uploadProfileImage);

// Wishlist Routes
userRouter.post("/toggle-wishlist", authUser, toggleWishlist);
userRouter.get("/wishlist", authUser, getWishlist);

// Password Change Route
userRouter.post("/change-password", authUser, changePassword);

export default userRouter;
