import axios from "axios";

const withAuth = (token) => ({ headers: { token } });

const fetchSupportHistory = async ({ backendUrl, token, sessionId }) => {
  const { data } = await axios.post(
    `${backendUrl}/api/support/history`,
    { sessionId },
    withAuth(token),
  );
  return data;
};

const sendSupportMessage = async ({
  backendUrl,
  token,
  sessionId,
  message,
}) => {
  const { data } = await axios.post(
    `${backendUrl}/api/support/message`,
    { sessionId, message },
    withAuth(token),
  );
  return data;
};

const clearSupportHistory = async ({ backendUrl, token, sessionId }) => {
  const { data } = await axios.post(
    `${backendUrl}/api/support/clear`,
    { sessionId },
    withAuth(token),
  );
  return data;
};

const requestSupportHandoff = async ({ backendUrl, token, sessionId }) => {
  const { data } = await axios.post(
    `${backendUrl}/api/support/handoff`,
    { sessionId },
    withAuth(token),
  );
  return data;
};

const submitSupportFeedback = async ({
  backendUrl,
  token,
  sessionId,
  messageCreatedAt,
  feedback,
}) => {
  const { data } = await axios.post(
    `${backendUrl}/api/support/feedback`,
    { sessionId, messageCreatedAt, feedback },
    withAuth(token),
  );
  return data;
};

export {
  fetchSupportHistory,
  sendSupportMessage,
  clearSupportHistory,
  requestSupportHandoff,
  submitSupportFeedback,
};
