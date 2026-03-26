import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const EMPTY_FORM = {
  id: "",
  title: "",
  question: "",
  answer: "",
  category: "General",
  tags: "",
  status: "active",
  priority: 0,
};

const SupportKnowledge = ({ token }) => {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/support/admin/faqs`, {
        headers: { token },
      });

      if (data.success) {
        setFaqs(data.faqs || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveFaq = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/support/admin/faqs`,
        form,
        { headers: { token } },
      );

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success(form.id ? "FAQ updated" : "FAQ created");
      setForm(EMPTY_FORM);
      fetchFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteFaq = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/support/admin/faqs/delete`,
        { id },
        { headers: { token } },
      );

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("FAQ deleted");
      if (form.id === id) {
        setForm(EMPTY_FORM);
      }
      fetchFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [token]);

  return (
    <div className="flex-1 p-6 sm:ml-[18vw]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Support Knowledge</h2>
        <p className="text-sm text-gray-500">Manage the curated FAQ and policy answers used by the assistant.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={saveFaq} className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="FAQ title"
              className="rounded border px-3 py-2"
              required
            />
            <input
              value={form.question}
              onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
              placeholder="Customer question"
              className="rounded border px-3 py-2"
              required
            />
            <textarea
              value={form.answer}
              onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
              placeholder="Grounded answer"
              rows={6}
              className="rounded border px-3 py-2"
              required
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="Category"
                className="rounded border px-3 py-2"
              />
              <input
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="Tags (comma separated)"
                className="rounded border px-3 py-2"
              />
              <input
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                placeholder="Priority"
                type="number"
                className="rounded border px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="rounded border px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
              <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                {form.id ? "Update FAQ" : "Create FAQ"}
              </button>
              {form.id ? (
                <button
                  type="button"
                  onClick={() => setForm(EMPTY_FORM)}
                  className="rounded border px-4 py-2 text-sm text-gray-600"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">FAQ Entries</h3>
            <button
              type="button"
              onClick={fetchFaqs}
              className="rounded bg-gray-100 px-3 py-2 text-xs text-gray-600 hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <p className="text-sm text-gray-500">No FAQ entries yet.</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq._id} className="rounded border p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{faq.title}</p>
                      <p className="text-xs text-gray-500">{faq.category} | {faq.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: faq._id,
                            title: faq.title,
                            question: faq.question,
                            answer: faq.answer,
                            category: faq.category,
                            tags: Array.isArray(faq.tags) ? faq.tags.join(", ") : "",
                            status: faq.status,
                            priority: faq.priority ?? 0,
                          })
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteFaq(faq._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{faq.question}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportKnowledge;
