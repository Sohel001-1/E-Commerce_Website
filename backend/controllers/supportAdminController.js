import supportFaqModel from "../models/supportFaqModel.js";
import supportChatModel from "../models/supportChatModel.js";
import supportTicketModel from "../models/supportTicketModel.js";

const listSupportFaqs = async (req, res) => {
  try {
    const faqs = await supportFaqModel.find({}).sort({ priority: -1, updatedAt: -1 }).lean();
    res.json({ success: true, faqs });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const saveSupportFaq = async (req, res) => {
  try {
    const { id, title, question, answer, category, tags, status, priority } = req.body;
    if (!title || !question || !answer) {
      return res.json({
        success: false,
        message: "Title, question, and answer are required.",
      });
    }

    const payload = {
      title: String(title).trim(),
      question: String(question).trim(),
      answer: String(answer).trim(),
      category: String(category || "General").trim(),
      tags: Array.isArray(tags)
        ? tags.map((item) => String(item).trim()).filter(Boolean)
        : String(tags || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      status: status === "draft" ? "draft" : "active",
      priority: Number.isFinite(Number(priority)) ? Number(priority) : 0,
      sourceVersion: "faq-v1",
    };

    const faq = id
      ? await supportFaqModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      : await supportFaqModel.create(payload);

    res.json({ success: true, faq });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const deleteSupportFaq = async (req, res) => {
  try {
    const { id } = req.body;
    await supportFaqModel.findByIdAndDelete(id);
    res.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listSupportTickets = async (req, res) => {
  try {
    const status = String(req.query.status || "").trim();
    const query = status ? { status } : {};
    const tickets = await supportTicketModel.find(query).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, tickets });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateSupportTicket = async (req, res) => {
  try {
    const { id, status } = req.body;
    const allowedStatuses = new Set(["new", "assigned", "resolved", "needs_user_reply"]);
    if (!allowedStatuses.has(String(status || ""))) {
      return res.json({ success: false, message: "Invalid support status" });
    }

    const ticket = await supportTicketModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    res.json({ success: true, ticket });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const replyToSupportTicket = async (req, res) => {
  try {
    const { id, reply, status } = req.body;
    const normalizedReply = String(reply || "").trim();

    if (!normalizedReply) {
      return res.json({ success: false, message: "Reply text is required." });
    }

    const ticket = await supportTicketModel.findById(id);
    if (!ticket) {
      return res.json({ success: false, message: "Support ticket not found." });
    }

    const chatSession = await supportChatModel.findOne({
      userId: ticket.userId,
      sessionId: ticket.sessionId,
    });

    if (!chatSession) {
      return res.json({ success: false, message: "Support chat session not found." });
    }

    const nextStatus =
      status && ["assigned", "needs_user_reply", "resolved"].includes(String(status))
        ? String(status)
        : "needs_user_reply";

    const adminMessage = {
      role: "admin",
      content: normalizedReply,
      createdAt: new Date(),
      meta: {
        sourceType: "human-support",
        intent: ticket.intent || "general",
        confidence: 1,
        handoffRecommended: false,
        citations: [],
        actionType: nextStatus === "resolved" ? "answer" : "handoff_created",
        retrievalSummary: {},
        handoff: {
          available: true,
          recommended: false,
          ticketId: String(ticket._id),
          status: nextStatus,
        },
        conversationTags: ["human-support", nextStatus],
        promptVersion: "support-human-v1",
      },
    };

    chatSession.messages.push(adminMessage);
    await chatSession.save();

    ticket.status = nextStatus;
    ticket.latestAdminReply = normalizedReply;
    ticket.transcript = chatSession.messages;
    ticket.handoff = {
      ...(ticket.handoff || {}),
      ticketId: String(ticket._id),
      status: nextStatus,
      repliedByAdmin: true,
    };
    await ticket.save();

    res.json({
      success: true,
      ticket,
      messages: chatSession.messages,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  listSupportFaqs,
  saveSupportFaq,
  deleteSupportFaq,
  listSupportTickets,
  updateSupportTicket,
  replyToSupportTicket,
};
