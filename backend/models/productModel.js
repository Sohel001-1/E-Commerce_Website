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
      enum: [
        "N/A",
        // ML
        "100ML",
        "200ML",
        "300ML",
        "400ML",
        "500ML",
        "800ML",
        "946ML",
        "1200ML",
        // L
        "1L",
        "1.5L",
        "2L",
        "3L",
        "3.5L",
        "4L",
        "4.2L",
        "4.73L",
        "5L",
        "6L",
        "10L",
        "18L",
        "20L",
        "60L",
        "200L",
        "205L",
        "208L",
        // GM
        "400GM",
        "1KG",
        "5KG",
        "10KG",
        "15KG",
        "25KG",
        "180KG",
      ],
    },

    sae: {
      type: String,
      default: "N/A",
      enum: [
        "N/A",
        "0W-16",
        "0W-20",
        "0W-25",
        "0W-30",
        "0W-40",
        "5W-20",
        "5W-30",
        "5W-40",
        "5W-50",
        "5W-55",
        "10W-30",
        "10W-40",
        "10W-50",
        "10W-55",
        "10W-60",
        "15W-40",
        "15W-50",
        "15W-55",
        "15W-60",
        "20W-40",
        "20W-50",
        "20W-60",
        "25W-50",
        "SAE 30",
        "SAE 40",
        "SAE 50",
        "SAE 90",
        "80W-90",
      ],
    },

    oilType: {
      type: String,
      default: "N/A",
      enum: ["N/A", "MINERAL", "SEMI-SYNTHETIC", "SYNTHETIC", "FULL SYNTHETIC"],
    },

    api: {
      type: String,
      default: "N/A",
      enum: [
        "N/A",
        "ABOVE CURRENT STANDARD",
        "MEETS OE STANDARD",
        "SN",
        "SN+",
        "SN PLUS",
        "SN-RC",
        "SN PLUS-RC",
        "SN/CF",
        "SN/SM/SL/SJ",
        "SN/GF-5",
        "SN/CH-4",
        "SN/SM",
        "SN PLUS/CF",
        "SN PLUS/RC",
        "SL",
        "SL/CF",
        "SL/SJ/SH/SG",
        "SL/MA",
        "SL/MA/SG/CD",
        "SL/CG-4",
        "SL/CF-4/CF",
        "SL/CF/CG-4",
        "SJ",
        "SJ/CF",
        "SM",
        "SM/CF",
        "SG",
        "SG/SH/SJ/SL/SM",
        "SG/SH/SJ/SL/SM/SN",
        "SF",
        "SF/CD",
        "SF/CF",
        "SP",
        "SP-RC",
        "API SP/CF",
        "API SP/SN PLUS/SN",
        "CF",
        "CF/SF",
        "CF-4",
        "CF-4/SG",
        "CG-4",
        "CG 4/SLCH 4/SL",
        "CH-4",
        "CH 4/SL",
        "CH-4/SJ",
        "CH-4/CG-4/CF-4/SJ",
        "CH-4/CG-4/CF-4/SL",
        "CI-4",
        "CI-4 PLUS/ SL",
        "CI-4/DH-1",
        "CI-4/SL",
        "CI-4/CH-4/SL",
        "CJ-4/SM",
        "GL-5",
        "ILSAC GF-5",
        "ILSAC GF-6",
        "GF-6B",
      ],
    },

    acea: {
      type: String,
      default: "N/A",
      enum: [
        "N/A",
        // A/B Series
        "A1/B1",
        "A2/B2",
        "A3/B3",
        "A3/B4",
        "A5/B5",
        "A3-04/B4-04",
        "A3/B3-12",
        "A3/B3,B4",
        // C Series
        "C",
        "C2",
        "C3",
        "A3/B3,C3",
        // E Series
        "E2",
        "E3",
        "E5",
        "E7",
        "E2/B4",
        "E7/E5",
        "E7/E9",
        "E7/A3/B4",
        // Mixed Combinations
        "A3/B4,E2",
        "A3/B4,E7",
        "E3/A3/B3/B4",
        "E3/B3/A3",
        "A3/B3,A3/B4,E7",
        "A3/B4/E3",
        "A3/B3/E2",
        // Other Standards
        "ILSAC GF-5",
        "ILSAC GF-6A",
        "GF-5",
        "GF-6",
        "JASO MA",
        "JASO MA2",
        "JASO MB",
        "JASO SG+",
        "DEXOS GEN2",
        // General
        "ABOVE CURRENT STANDARD",
        "MEETS OE STANDARD",
      ],
    },

    appropriateUse: {
      type: String,
      default: "N/A",
      enum: ["N/A", "FOR CAR", "FOR BIKE", "FOR CAR & BIKE", "FOR COMMERCIAL", "FOR INDUSTRIAL"],
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
