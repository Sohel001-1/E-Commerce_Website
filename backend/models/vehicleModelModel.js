import mongoose from "mongoose";

const vehicleModelSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleBrand",
      required: true,
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
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
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    date: {
      type: Number,
      default: Date.now,
    },
  },
  { timestamps: true },
);

vehicleModelSchema.index({ brandId: 1, slug: 1 }, { unique: true });
vehicleModelSchema.index({ brandId: 1, isActive: 1, sortOrder: 1, name: 1 });
vehicleModelSchema.index({ brandSlug: 1, slug: 1, yearFrom: 1, yearTo: 1 });

const vehicleModelModel =
  mongoose.models.VehicleModel ||
  mongoose.model("VehicleModel", vehicleModelSchema);

export default vehicleModelModel;
