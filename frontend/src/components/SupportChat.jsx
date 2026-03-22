import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X, Trash2 } from "lucide-react";
import { ShopContext } from "../context/ShopContext";
import {
  clearSupportHistory,
  fetchSupportHistory,
  sendSupportMessage,
} from "../utils/supportChatApi";

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

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

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[70] h-14 w-14 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-colors"
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
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-[70] w-[92vw] max-w-sm rounded-2xl border border-surface-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-surface-900">
                  Support Chat
                </p>
                <p className="text-xs text-surface-500">
                  Logged-in users only • FAQ support
                </p>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-800 transition-colors"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="h-[420px] overflow-y-auto px-4 py-3">
              {loadingHistory ? (
                <p className="text-sm text-surface-500">
                  Loading conversation...
                </p>
              ) : !hasMessages ? (
                <div className="space-y-2 text-sm text-surface-600">
                  <p>Hi, how can we help you today?</p>
                  <p className="text-xs text-surface-400">
                    Ask about products, delivery info, return policy, or general
                    support.
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
                            : "bg-surface-100 text-surface-700"
                        } whitespace-pre-wrap break-words overflow-hidden`}
                      >
                        {renderMessageContent(messageItem.content)}
                      </div>
                    </div>
                  ))}
                  {sending && (
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
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="border-t border-surface-100 px-3 py-3">
              {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

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
                  className="rounded-xl bg-brand-500 p-2 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;
