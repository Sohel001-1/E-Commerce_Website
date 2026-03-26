import express from "express";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import supportRateLimit from "../middleware/supportRateLimit.js";
import {
  clearSupportSession,
  createSupportHandoff,
  getSupportHistory,
  sendSupportMessage,
  submitSupportFeedback,
} from "../controllers/supportController.js";
import {
  deleteSupportFaq,
  listSupportFaqs,
  listSupportTickets,
  replyToSupportTicket,
  saveSupportFaq,
  updateSupportTicket,
} from "../controllers/supportAdminController.js";

const supportRouter = express.Router();

supportRouter.post("/history", authUser, supportRateLimit, getSupportHistory);
supportRouter.post("/message", authUser, supportRateLimit, sendSupportMessage);
supportRouter.post("/clear", authUser, supportRateLimit, clearSupportSession);
supportRouter.post("/handoff", authUser, supportRateLimit, createSupportHandoff);
supportRouter.post("/feedback", authUser, supportRateLimit, submitSupportFeedback);

supportRouter.get("/admin/faqs", adminAuth, listSupportFaqs);
supportRouter.post("/admin/faqs", adminAuth, saveSupportFaq);
supportRouter.post("/admin/faqs/delete", adminAuth, deleteSupportFaq);
supportRouter.get("/admin/tickets", adminAuth, listSupportTickets);
supportRouter.post("/admin/tickets/status", adminAuth, updateSupportTicket);
supportRouter.post("/admin/tickets/reply", adminAuth, replyToSupportTicket);

export default supportRouter;
