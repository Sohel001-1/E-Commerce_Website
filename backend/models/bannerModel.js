import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String, // Cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    cta: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: { // "image" for now, as existing banners are type: "image", "video", or "icon"
      type: String,
      default: "image",
    },
    date: {
      type: Number,
      default: Date.now,
    },
  },
  { timestamps: true }
);

bannerSchema.index({ date: -1 });

const bannerModel =
  mongoose.models.Banner || mongoose.model("Banner", bannerSchema);

export default bannerModel;
