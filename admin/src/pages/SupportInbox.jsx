import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const STATUS_OPTIONS = ["new", "assigned", "needs_user_reply", "resolved"];

const SupportInbox = ({ token }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/support/admin/tickets`, {
        headers: { token },
      });

      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/support/admin/tickets/status`,
        { id, status },
        { headers: { token } },
      );

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("Support ticket updated");
      fetchTickets();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendReply = async (ticket) => {
    const reply = String(replyDrafts[ticket._id] || "").trim();
    if (!reply) {
      toast.error("Write a reply before sending.");
      return;
    }

    setSendingReplyId(ticket._id);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/support/admin/tickets/reply`,
        {
          id: ticket._id,
          reply,
          status: "needs_user_reply",
        },
        { headers: { token } },
      );

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("Reply sent to customer");
      setReplyDrafts((prev) => ({ ...prev, [ticket._id]: "" }));
      fetchTickets();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingReplyId("");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  return (
    <div className="flex-1 p-6 sm:ml-[18vw]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Support Inbox</h2>
          <p className="text-sm text-gray-500">Escalated support conversations that need human review.</p>
        </div>
        <button
          type="button"
          onClick={fetchTickets}
          className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading support inbox...</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          No escalated support tickets yet.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    User: {ticket.userId}
                  </p>
                  <p className="text-xs text-gray-500">
                    Session: {ticket.sessionId}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium capitalize text-orange-700">
                    {ticket.intent}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                    {ticket.status}
                  </span>
                </div>
              </div>

              <p className="mb-3 text-sm text-gray-700">
                {ticket.latestUserMessage || "No user message captured."}
              </p>

              <div className="mb-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-3">
                <p>Confidence: {Math.round((Number(ticket.confidence || 0) || 0) * 100)}%</p>
                <p>Action: {ticket.actionType}</p>
                <p>Updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
              </div>

              {ticket.reason ? (
                <p className="mb-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                  {ticket.reason}
                </p>
              ) : null}

              {ticket.latestAdminReply ? (
                <div className="mb-3 rounded border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Latest admin reply
                  </p>
                  <p>{ticket.latestAdminReply}</p>
                </div>
              ) : null}

              <div className="mb-4 rounded border bg-gray-50 p-3">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Reply to customer
                </label>
                <textarea
                  value={replyDrafts[ticket._id] || ""}
                  onChange={(event) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [ticket._id]: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Type a clear human-support reply here..."
                  className="w-full rounded border px-3 py-2 text-sm text-gray-700"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => sendReply(ticket)}
                    disabled={sendingReplyId === ticket._id}
                    className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {sendingReplyId === ticket._id ? "Sending..." : "Send reply"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateTicketStatus(ticket._id, status)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      ticket.status === status
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportInbox;
