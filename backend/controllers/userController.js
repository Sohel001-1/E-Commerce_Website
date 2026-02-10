import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error occurred during login" });
  }
};
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password with minimum 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || "admin@japanautos.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";

    if (email === adminEmail && password === adminPassword) {
      const token = createToken("admin");
      return res.json({ success: true, token });
    }

    return res.json({ success: false, message: "Invalid admin credentials" });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error occurred during admin login",
    });
  }
};

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body; // Injected by authUser middleware
    const user = await userModel.findById(userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// UPDATE USER PROFILE (Name, Phone)
const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, phone } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name is required" });
    }

    await userModel.findByIdAndUpdate(userId, { name, phone });
    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// UPDATE ADDRESS
const updateAddress = async (req, res) => {
  try {
    const { userId, addressId, address } = req.body;
    const user = await userModel.findById(userId);

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );
    if (addressIndex === -1) {
      return res.json({ success: false, message: "Address not found" });
    }

    // Update address fields while preserving _id and isDefault if not provided
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex]._doc,
      ...address,
      _id: user.addresses[addressIndex]._id,
    };

    await user.save();
    res.json({ success: true, message: "Address Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// SET DEFAULT ADDRESS
const setDefaultAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;
    const user = await userModel.findById(userId);

    // Set all addresses to not default, then set the selected one as default
    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();
    res.json({ success: true, message: "Default Address Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await userModel.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(userId, { password: hashedPassword });
    res.json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ADDRESS MANAGEMENT: ADD ADDRESS
const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    const user = await userModel.findById(userId);

    // If it's the first address, make it default
    if (user.addresses.length === 0) {
      address.isDefault = true;
    } else if (address.isDefault) {
      // Unset other defaults if this one is set to default
      user.addresses.forEach((item) => (item.isDefault = false));
    }

    user.addresses.push(address);
    await user.save();
    res.json({ success: true, message: "Address Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;
    await userModel.findByIdAndUpdate(userId, {
      $pull: { addresses: { _id: addressId } },
    });
    res.json({ success: true, message: "Address Deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// UPLOAD PROFILE IMAGE
const uploadProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({ success: false, message: "No image provided" });
    }

    // Upload to Cloudinary (using the local path provided by multer)
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    await userModel.findByIdAndUpdate(userId, {
      profileImage: imageUpload.secure_url,
    });

    res.json({
      success: true,
      message: "Profile Image Updated",
      imageUrl: imageUpload.secure_url,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// TOGGLE WISHLIST (Add/Remove)
const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await userModel.findById(userId);

    if (user.wishlist.includes(productId)) {
      // Remove if already exists
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
      await user.save();
      return res.json({
        success: true,
        message: "Removed from Wishlist",
        action: "removed",
      });
    } else {
      // Add if not present
      user.wishlist.push(productId);
      await user.save();
      return res.json({
        success: true,
        message: "Added to Wishlist",
        action: "added",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET FULL WISHLIST (Populated with Product Details)
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId).populate("wishlist");
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// EXPORT ALL FUNCTIONS
export {
  loginUser,
  registerUser,
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
};
