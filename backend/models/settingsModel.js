import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  insideChittagongFee: { type: Number, required: true, default: 0 },
  outsideChittagongFee: { type: Number, required: true, default: 0 },
});

const settingsModel = mongoose.models.setting || mongoose.model("setting", settingsSchema);

export default settingsModel;
