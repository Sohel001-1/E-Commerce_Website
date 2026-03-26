import mongoose from "mongoose";

const supportFaqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      maxlength: 80,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "active",
    },
    priority: {
      type: Number,
      default: 0,
    },
    sourceVersion: {
      type: String,
      default: "faq-v1",
      trim: true,
      maxlength: 64,
    },
  },
  { timestamps: true },
);

supportFaqSchema.index({ status: 1, category: 1, updatedAt: -1 });
supportFaqSchema.index({ title: "text", question: "text", answer: "text", tags: "text" });

const supportFaqModel =
  mongoose.models.support_faq || mongoose.model("support_faq", supportFaqSchema);

export default supportFaqModel;
