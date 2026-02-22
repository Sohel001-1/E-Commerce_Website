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
      subCategory,
      price,
      salePrice,
      brand,
      countryOfOrigin,
      countryOfImport,
      unitSize,
      sae,
      oilType,
      acea,
      appropriateUse,
      stock,
      api,
      bestseller,
    } = req.body;

    if (!name || !description || !category || !subCategory || price === undefined || !brand) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, category, subCategory, price, brand",
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
      subCategory: String(subCategory).trim(),
      brand: String(brand).trim(),
      countryOfOrigin: countryOfOrigin ? String(countryOfOrigin).trim() : "N/A",
      countryOfImport: countryOfImport ? String(countryOfImport).trim() : "N/A",
      unitSize: unitSize ? String(unitSize).trim() : "N/A",
      sae: sae ? String(sae).trim() : "N/A",
      oilType: oilType ? String(oilType).trim() : "N/A",
      api: api ? String(api).trim() : "N/A",
      acea: acea ? String(acea).trim() : "N/A",
      appropriateUse: appropriateUse ? String(appropriateUse).trim() : "N/A",
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      stock: stock ? Number(stock) : 0,
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
      salePrice,
      brand,
      countryOfOrigin,
      countryOfImport,
      unitSize,
      sae,
      oilType,
      acea,
      appropriateUse,
      stock,
      api,
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
    if (brand !== undefined) updateData.brand = String(brand).trim();
    if (countryOfOrigin !== undefined) updateData.countryOfOrigin = String(countryOfOrigin).trim();
    if (countryOfImport !== undefined) updateData.countryOfImport = String(countryOfImport).trim();
    if (unitSize !== undefined) updateData.unitSize = String(unitSize).trim();
    if (sae !== undefined) updateData.sae = String(sae).trim();
    if (oilType !== undefined) updateData.oilType = String(oilType).trim();
    if (api !== undefined) updateData.api = String(api).trim();
    if (acea !== undefined) updateData.acea = String(acea).trim();
    if (appropriateUse !== undefined) updateData.appropriateUse = String(appropriateUse).trim();
    if (price !== undefined) updateData.price = Number(price);
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (bestseller !== undefined) updateData.bestseller = parseBoolean(bestseller);

    if ("price" in updateData && Number.isNaN(updateData.price)) {
      return res.status(400).json({ success: false, message: "Price must be a number" });
    }

    // Determine preserved existing images (sent as array from frontend)
    let preservedImages = [];
    if (req.body.existingImages) {
      try {
        preservedImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        // handle string single values if not json array 
        preservedImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      }
    }
    // Filter out null/empty values
    preservedImages = preservedImages.filter(img => img && typeof img === 'string');

    // Handle new image uploads
    const files = req.files || {};
    const image1 = files.image1?.[0];
    const image2 = files.image2?.[0];
    const image3 = files.image3?.[0];
    const image4 = files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    let newlyUploadedUrls = [];
    if (images.length > 0) {
      newlyUploadedUrls = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    // update to the combined pool of old retained images + new images
    // Note: If no new images and no existing images provided, we don't wipe out the images unless strictly told to 
    // BUT since we are building an edit UI where removing all existing images + no new images = empty array, we will update it if expected.
    // If the frontend explicitly sends `existingImages`, we assume they intend to update the image list.
    if (req.body.existingImages !== undefined || images.length > 0) {
      updateData.image = [...preservedImages, ...newlyUploadedUrls];
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
