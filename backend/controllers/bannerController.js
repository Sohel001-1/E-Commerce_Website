import { v2 as cloudinary } from "cloudinary";
import bannerModel from "../models/bannerModel.js";

const addBanner = async (req, res) => {
  try {
    const { title, subtitle, cta, category } = req.body;

    if (!title || !subtitle || !cta || !category) {
       return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const imageFile = req.file;
    if (!imageFile) {
       return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const result = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
    });
    const imageUrl = result.secure_url;

    const bannerData = {
        title: String(title).trim(),
        subtitle: String(subtitle).trim(),
        cta: String(cta).trim(),
        category: String(category).trim(),
        image: imageUrl,
        date: Date.now(),
    };

    const banner = await bannerModel.create(bannerData);

    res.status(201).json({ success: true, message: "Banner Added", banner });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listBanners = async (req, res) => {
  try {
    const banners = await bannerModel.find({}).sort({ date: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeBanner = async (req, res) => {
  try {
    const id = req.params?.id || req.body?.id;
    if (!id) return res.status(400).json({ success: false, message: "Banner id is required" });

    const deleted = await bannerModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Banner not found" });

    res.json({ success: true, message: "Banner removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id, title, subtitle, cta, category } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "Banner id is required" });

    const updateData = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (subtitle !== undefined) updateData.subtitle = String(subtitle).trim();
    if (cta !== undefined) updateData.cta = String(cta).trim();
    if (category !== undefined) updateData.category = String(category).trim();

    const imageFile = req.file;
    if (imageFile) {
        const result = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
        });
        updateData.image = result.secure_url;
    }

    const updated = await bannerModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    return res.json({ success: true, message: "Banner Updated", banner: updated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { addBanner, listBanners, removeBanner, updateBanner };
