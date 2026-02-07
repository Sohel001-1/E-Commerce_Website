import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Helper: parse boolean safely (true/false OR "true"/"false")
const parseBoolean = (val) => val === true || val === "true";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      subcategory, // client sends this sometimes
      subCategory, // allow this too
      bestseller,
    } = req.body;

    const finalSubCategory = subCategory || subcategory;

    if (!name || !description || !category || !finalSubCategory || price === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, category, subCategory/subcategory, price",
      });
    }

    const files = req.files || {};
    const image1 = files.image1?.[0];
    const image2 = files.image2?.[0];
    const image3 = files.image3?.[0];
    const image4 = files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    let imagesUrl = [];
    if (images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    const productData = {
      name: String(name).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      subCategory: String(finalSubCategory).trim(),
      price: Number(price),
      bestseller: parseBoolean(bestseller),
      image: imagesUrl,
      date: Date.now(),
    };

    if (Number.isNaN(productData.price)) {
      return res.status(400).json({ success: false, message: "Price must be a number" });
    }

    const product = await productModel.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product Added",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE PRODUCT (for Edit feature)
const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      category,
      subCategory,
      price,
      bestseller,
    } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Product id is required" });
    }

    // Build update object (only update fields that were provided)
    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (category !== undefined) updateData.category = String(category).trim();
    if (subCategory !== undefined) updateData.subCategory = String(subCategory).trim();
    if (price !== undefined) updateData.price = Number(price);
    if (bestseller !== undefined) updateData.bestseller = parseBoolean(bestseller);

    if ("price" in updateData && Number.isNaN(updateData.price)) {
      return res.status(400).json({ success: false, message: "Price must be a number" });
    }

    // Optional: allow updating images too (if you later add it in edit modal)
    const files = req.files || {};
    const image1 = files.image1?.[0];
    const image2 = files.image2?.[0];
    const image3 = files.image3?.[0];
    const image4 = files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    if (images.length > 0) {
      const imagesUrl = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
      updateData.image = imagesUrl; // replaces images (simple & clean)
    }

    const updated = await productModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({
      success: true,
      message: "Product Updated",
      product: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ date: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    const id = req.params?.id || req.body?.id;
    if (!id) return res.status(400).json({ success: false, message: "Product id is required" });

    const deleted = await productModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const id = req.params?.id || req.body?.id || req.body?.productId;
    if (!id) return res.status(400).json({ success: false, message: "Product id is required" });

    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addProduct, updateProduct, listProduct, removeProduct, singleProduct };
