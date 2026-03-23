import mongoose from "mongoose";

const vehicleBrandSchema = new mongoose.Schema(
  {
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
    logoUrl: {
      type: String,
      required: true,
      trim: true,
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

vehicleBrandSchema.index({ slug: 1 }, { unique: true });
vehicleBrandSchema.index({ isActive: 1, sortOrder: 1, name: 1 });

const vehicleBrandModel =
  mongoose.models.VehicleBrand ||
  mongoose.model("VehicleBrand", vehicleBrandSchema);

export default vehicleBrandModel;
