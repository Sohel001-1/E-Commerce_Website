import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["new", "assigned", "resolved", "needs_user_reply"],
      default: "new",
      index: true,
    },
    intent: {
      type: String,
      default: "general",
      trim: true,
      maxlength: 64,
    },
    actionType: {
      type: String,
      default: "offer_handoff",
      trim: true,
      maxlength: 64,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    latestUserMessage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 4000,
    },
    latestAdminReply: {
      type: String,
      default: "",
      trim: true,
      maxlength: 4000,
    },
    transcript: {
      type: Array,
      default: [],
    },
    retrievalSummary: {
      type: Object,
      default: {},
    },
    handoff: {
      type: Object,
      default: {},
    },
    conversationTags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

supportTicketSchema.index({ status: 1, updatedAt: -1 });

const supportTicketModel =
  mongoose.models.support_ticket ||
  mongoose.model("support_ticket", supportTicketSchema);

export default supportTicketModel;
