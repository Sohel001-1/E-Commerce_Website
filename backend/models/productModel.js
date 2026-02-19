import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: [String], // array of image URLs
      default: [],
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    countryOfOrigin: {
      type: String,
      default: "N/A",
    },

    countryOfImport: {
      type: String,
      default: "N/A",
    },

    unitSize: {
      type: String,
      default: "N/A",
    },

    sae: {
      type: String,
      default: "N/A",
    },

    oilType: {
      type: String,
      default: "N/A",
    },

    api: {
      type: String,
      default: "N/A",
    },

    acea: {
      type: String,
      default: "N/A",
    },

    appropriateUse: {
      type: String,
      default: "N/A",
    },

    bestseller: {
      type: Boolean,
      default: false,
    },

    date: {
      type: Number,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const productModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
