import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X, Trash2 } from "lucide-react";
import { ShopContext } from "../context/ShopContext";
import {
  clearSupportHistory,
  fetchSupportHistory,
  requestSupportHandoff,
  sendSupportMessage,
  submitSupportFeedback,
} from "../utils/supportChatApi";

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

const ACTION_LABELS = {
  answer: "Resolved",
  clarify: "Need detail",
  recommend_products: "Recommendations",
  offer_handoff: "Human support available",
  handoff_created: "Escalated",
  refuse: "Human review required",
};

const ROLE_LABELS = {
  assistant: "AI Assistant",
  admin: "Human Support",
};

const FEEDBACK_LABELS = {
  helpful: "Helpful",
  not_helpful: "Not helpful",
  escalated: "Escalated",
};

const renderMessageContent = (content) => {
  const safeContent = String(content || "");
  const parts = safeContent.split(URL_REGEX);

  return parts.map((part, index) => {
    const isUrl = /^https?:\/\//i.test(part);

    if (!isUrl) {
      return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    }

    return (
      <a
        key={`link-${index}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all"
      >
        {part}
      </a>
    );
  });
};

const SupportChat = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [chatUnavailable, setChatUnavailable] = useState(false);
  const [busyMessageKey, setBusyMessageKey] = useState("");
  const sessionIdRef = useRef("");
  const bottomRef = useRef(null);

  const hasMessages = messages.length > 0;

  const resolveChatErrorMessage = (err, fallbackText) => {
    const status = err?.response?.status;

    if (status === 404) {
      return "Support chat API is not available on the current backend URL. Deploy backend support routes or switch VITE_BACKEND_URL to your updated backend.";
    }

    return err?.response?.data?.message || err?.message || fallbackText;
  };

  const placeholderText = useMemo(() => {
    if (sending) return "Sending...";
    return "Ask a support question...";
  }, [sending]);

  useEffect(() => {
    if (!isOpen || !token || !backendUrl) {
      return;
    }

    const loadHistory = async () => {
      setLoadingHistory(true);
      setError("");

      try {
        const data = await fetchSupportHistory({
          backendUrl,
          token,
          sessionId: sessionIdRef.current || undefined,
        });

        if (!data.success) {
          setError(data.message || "Failed to load support chat history.");
          return;
        }

        sessionIdRef.current = data.sessionId || "";
        setMessages(data.messages || []);
        setChatUnavailable(false);
      } catch (err) {
        const resolvedError = resolveChatErrorMessage(
          err,
          "Failed to load chat history.",
        );
        setError(resolvedError);
        setChatUnavailable(err?.response?.status === 404);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [isOpen, token, backendUrl]);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, sending]);

  if (!token) {
    return null;
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !backendUrl || chatUnavailable) {
      return;
    }

    setError("");
    setSending(true);
    setInput("");

    const optimisticUserMessage = {
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      const data = await sendSupportMessage({
        backendUrl,
        token,
        sessionId: sessionIdRef.current || undefined,
        message: text,
      });

      if (!data.success) {
        setError(data.message || "Could not get a support response.");
        return;
      }

      sessionIdRef.current = data.sessionId || "";
      setMessages(data.messages || []);
      setChatUnavailable(false);
    } catch (err) {
      const resolvedError = resolveChatErrorMessage(
        err,
        "Could not send message.",
      );
      setError(resolvedError);
      setChatUnavailable(err?.response?.status === 404);
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (!backendUrl || !sessionIdRef.current) {
      setMessages([]);
      return;
    }

    setError("");

    try {
      const data = await clearSupportHistory({
        backendUrl,
        token,
        sessionId: sessionIdRef.current,
      });

      if (!data.success) {
        setError(data.message || "Failed to clear chat.");
        return;
      }

      sessionIdRef.current = "";
      setMessages([]);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to clear chat.",
      );
    }
  };

  const handleFeedback = async (messageItem, feedback) => {
    if (!backendUrl || !sessionIdRef.current || !messageItem?.createdAt) {
      return;
    }

    const requestKey = `${messageItem.createdAt}-${feedback}`;
    setBusyMessageKey(requestKey);
    setError("");

    try {
      const data = await submitSupportFeedback({
        backendUrl,
        token,
        sessionId: sessionIdRef.current,
        messageCreatedAt: messageItem.createdAt,
        feedback,
      });

      if (!data.success) {
        setError(data.message || "Failed to save support feedback.");
        return;
      }

      setMessages(data.messages || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save support feedback.",
      );
    } finally {
      setBusyMessageKey("");
    }
  };

  const handleHandoff = async (messageItem) => {
    if (!backendUrl || !sessionIdRef.current) {
      return;
    }

    const requestKey = `${messageItem.createdAt}-handoff`;
    setBusyMessageKey(requestKey);
    setError("");

    try {
      const data = await requestSupportHandoff({
        backendUrl,
        token,
        sessionId: sessionIdRef.current,
      });

      if (!data.success) {
        setError(data.message || "Failed to request human support.");
        return;
      }

      sessionIdRef.current = data.sessionId || sessionIdRef.current;
      setMessages(data.messages || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to request human support.",
      );
    } finally {
      setBusyMessageKey("");
    }
  };

  const renderAssistantMeta = (messageItem) => {
    if (!["assistant", "admin"].includes(messageItem.role)) {
      return null;
    }

    const meta = messageItem.meta || {};
    const citations = Array.isArray(meta.citations) ? meta.citations : [];
    const handoff = meta.handoff || {};
    const feedback = meta.feedback || "";

    return (
      <div className="mt-3 space-y-2 border-t border-surface-200/70 pt-3 text-xs text-surface-500">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-2 py-1 font-medium text-surface-700">
            {ACTION_LABELS[meta.actionType] || "Support"}
          </span>
          <span className="rounded-full bg-white px-2 py-1 font-medium text-surface-700">
            {ROLE_LABELS[messageItem.role] || "Support"}
          </span>
          <span className="rounded-full bg-white px-2 py-1">
            Confidence: {Math.round((Number(meta.confidence || 0) || 0) * 100)}%
          </span>
          {meta.intent ? (
            <span className="rounded-full bg-white px-2 py-1 capitalize">
              {meta.intent}
            </span>
          ) : null}
        </div>

        {citations.length > 0 ? (
          <div className="space-y-1">
            <p className="font-medium text-surface-600">Sources</p>
            {citations.map((citation, index) => (
              <div key={`${citation.label}-${index}`}>
                {citation.url ? (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-all"
                  >
                    {citation.label}
                  </a>
                ) : (
                  <span>{citation.label}</span>
                )}
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {messageItem.role === "assistant"
            ? ["helpful", "not_helpful", "escalated"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFeedback(messageItem, value)}
              disabled={busyMessageKey === `${messageItem.createdAt}-${value}`}
              className={`rounded-full border px-2 py-1 ${
                feedback === value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-200 bg-white text-surface-500 hover:border-brand-300 hover:text-surface-700"
              }`}
            >
              {FEEDBACK_LABELS[value]}
            </button>
            ))
            : null}

          {handoff.available &&
          messageItem.role === "assistant" &&
          meta.actionType !== "handoff_created" &&
          handoff.status !== "resolved" ? (
            <button
              type="button"
              onClick={() => handleHandoff(messageItem)}
              disabled={busyMessageKey === `${messageItem.createdAt}-handoff`}
              className="rounded-full bg-brand-500 px-3 py-1 font-medium text-white hover:bg-brand-600"
            >
              Request human support
            </button>
          ) : null}
        </div>

        {handoff.ticketId ? (
          <p className="text-surface-600">
            Human support ticket: {handoff.ticketId} ({handoff.status})
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[70] h-14 w-14 rounded-full bg-brand-500 text-white shadow-lg transition-colors hover:bg-brand-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle support chat"
      >
        {isOpen ? (
          <X className="mx-auto" size={22} />
        ) : (
          <MessageCircle className="mx-auto" size={22} />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-[70] w-[92vw] max-w-sm rounded-2xl border border-surface-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-surface-900">Support Chat</p>
                <p className="text-xs text-surface-500">
                  Logged-in users only | AI + human support
                </p>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="h-[420px] overflow-y-auto px-4 py-3">
              {loadingHistory ? (
                <p className="text-sm text-surface-500">Loading conversation...</p>
              ) : !hasMessages ? (
                <div className="space-y-2 text-sm text-surface-600">
                  <p>Hi, how can we help you today?</p>
                  <p className="text-xs text-surface-400">
                    Ask about products, delivery, order status, returns, or store policy.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((messageItem, index) => (
                    <div
                      key={`${messageItem.createdAt || "time"}-${index}`}
                      className={`flex ${messageItem.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          messageItem.role === "user"
                            ? "bg-brand-500 text-white"
                            : messageItem.role === "admin"
                              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                              : "bg-surface-100 text-surface-700"
                        } whitespace-pre-wrap break-words overflow-hidden`}
                      >
                        {renderMessageContent(messageItem.content)}
                        {renderAssistantMeta(messageItem)}
                      </div>
                    </div>
                  ))}
                  {sending ? (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl bg-surface-100 px-3 py-2 text-sm text-surface-700">
                        <div className="flex items-center gap-2">
                          <span>Support is typing</span>
                          <span className="inline-flex items-center gap-1">
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-surface-500"
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-surface-500"
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                            />
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-surface-500"
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="border-t border-surface-100 px-3 py-3">
              {error ? <p className="mb-2 text-xs text-red-500">{error}</p> : null}

              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 rounded-xl border border-surface-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                  placeholder={placeholderText}
                  maxLength={2000}
                  disabled={sending || chatUnavailable}
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || chatUnavailable || !input.trim()}
                  aria-label="Send support message"
                  className="rounded-xl bg-brand-500 p-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;
