import mongoose from "mongoose";
import crypto from "crypto";

const CHAT_RETENTION_DAYS = 7;
const CHAT_RETENTION_MS = CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;

const supportCitationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "reference",
      trim: true,
      maxlength: 64,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    url: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: false },
);

const supportMetaSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      default: "llm",
      trim: true,
      maxlength: 64,
    },
    intent: {
      type: String,
      default: "general",
      trim: true,
      maxlength: 64,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    handoffRecommended: {
      type: Boolean,
      default: false,
    },
    citations: {
      type: [supportCitationSchema],
      default: [],
    },
    actionType: {
      type: String,
      default: "answer",
      trim: true,
      maxlength: 64,
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
    promptVersion: {
      type: String,
      default: "support-v2",
      trim: true,
      maxlength: 64,
    },
    feedback: {
      type: String,
      default: "",
      trim: true,
      maxlength: 32,
    },
  },
  { _id: false },
);

const supportMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "admin"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    meta: {
      type: supportMetaSchema,
      default: undefined,
    },
  },
  { _id: false },
);

const supportChatSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: () => crypto.randomUUID(),
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: {
      type: [supportMessageSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + CHAT_RETENTION_MS),
    },
  },
  {
    timestamps: true,
  },
);

supportChatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
supportChatSchema.index({ userId: 1, updatedAt: -1 });

const supportChatModel =
  mongoose.models.support_chat ||
  mongoose.model("support_chat", supportChatSchema);

export { CHAT_RETENTION_DAYS, CHAT_RETENTION_MS };
export default supportChatModel;
