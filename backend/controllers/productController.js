import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

const parseSizes = (sizes) => {
  if (Array.isArray(sizes)) return sizes;
  if (typeof sizes === "string" && sizes.trim() !== "") {
    try {
      const parsed = JSON.parse(sizes);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [sizes]; // if it's just "M"
    }
  }
  return [];
};


// Helper: parse boolean safely (true/false OR "true"/"false")
const parseBoolean = (val) => val === true || val === "true";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      subcategory, // client sends this
      subCategory, // allow this too (optional)
      sizes,
      bestseller,
    } = req.body;

    const finalSubCategory = subCategory || subcategory;

    // Basic validation (keep it simple but safe)
    if (!name || !description || !category || !finalSubCategory || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, category, subCategory/subcategory, price",
      });
    }

    // Safe file reading (works even when you send JSON with no files)
    const files = req.files || {};
    const image1 = files.image1?.[0];
    const image2 = files.image2?.[0];
    const image3 = files.image3?.[0];
    const image4 = files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    // Only upload if images exist
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
      sizes: parseSizes(sizes),
      image: imagesUrl, // [] when testing without images
      date: Date.now(),
    };

    // Guard against invalid price
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

// (Optional) list products (safe default)
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ date: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// (Optional) remove product
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

// (Optional) single product info
const singleProduct = async (req, res) => {
  try {
    const id = req.params?.id || req.body?.id || req.body?.productId; // typical style: /product/:id
    if (!id) return res.status(400).json({ success: false, message: "Product id is required" });

    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addProduct, listProduct, removeProduct, singleProduct };
