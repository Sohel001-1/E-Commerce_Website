const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 25;

const requestMap = new Map();

const supportRateLimit = (req, res, next) => {
  const userId = req.body?.userId;
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const key = userId ? `user:${userId}` : `ip:${ip}`;
  const now = Date.now();

  const entry = requestMap.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    requestMap.set(key, { windowStart: now, count: 1 });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.json({
      success: false,
      message:
        "Too many support chat requests. Please wait a moment and try again.",
    });
  }

  entry.count += 1;
  requestMap.set(key, entry);
  next();
};

export default supportRateLimit;
