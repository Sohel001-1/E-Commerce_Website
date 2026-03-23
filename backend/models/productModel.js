import mongoose from "mongoose";

const vehicleFitmentSchema = new mongoose.Schema(
  {
    brandId: {
      type: String,
      required: true,
      trim: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    brandSlug: {
      type: String,
      required: true,
      trim: true,
    },
    modelId: {
      type: String,
      required: true,
      trim: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    modelSlug: {
      type: String,
      required: true,
      trim: true,
    },
    yearFrom: {
      type: Number,
      required: true,
    },
    yearTo: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

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

    salePrice: {
      type: Number,
      required: false,
      default: 0,
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
      trim: true,
    },

    oilType: {
      type: String,
      default: "N/A",
      trim: true,
    },

    api: {
      type: String,
      default: "N/A",
      trim: true,
    },

    acea: {
      type: String,
      default: "N/A",
      trim: true,
    },

    appropriateUse: {
      type: String,
      default: "N/A",
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    bestseller: {
      type: Boolean,
      default: false,
    },

    isUniversalFit: {
      type: Boolean,
      default: false,
    },

    date: {
      type: Number,
      default: Date.now,
    },

    vehicleFitments: {
      type: [vehicleFitmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, subCategory: 1, brand: 1, date: -1 });
productSchema.index({ category: 1, date: -1 });
productSchema.index({ subCategory: 1, date: -1 });
productSchema.index({ brand: 1, date: -1 });
productSchema.index({ bestseller: 1, date: -1 });
productSchema.index({ isUniversalFit: 1, date: -1 });
productSchema.index({
  "vehicleFitments.brandSlug": 1,
  "vehicleFitments.modelSlug": 1,
  "vehicleFitments.yearFrom": 1,
  "vehicleFitments.yearTo": 1,
  date: -1,
});
productSchema.index({ name: "text", brand: "text" });

const productModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
