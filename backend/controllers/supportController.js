import supportChatModel, {
  CHAT_RETENTION_MS,
} from "../models/supportChatModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import settingsModel from "../models/settingsModel.js";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_MESSAGES = 20;
const MAX_PRODUCT_MATCHES = 8;
const MAX_RECENT_ORDERS = 5;
const MAX_DISTINCT_VALUES = 25;
const LOW_CONFIDENCE_THRESHOLD = Number(
  process.env.SUPPORT_CONFIDENCE_THRESHOLD || 0.55,
);

const SYSTEM_PROMPT = `You are JAPAN AUTOS support assistant for customer help.
Rules:
- Answer using DATABASE_CONTEXT only for factual claims (products, stock, prices, categories, order status, shipping fees).
- Do not invent products, prices, stock, order statuses, links, or policies not present in DATABASE_CONTEXT.
- If information is missing in DATABASE_CONTEXT, clearly say it is unavailable and suggest the next step.
- For product-related answers, include the relevant product link(s) from DATABASE_CONTEXT when available.
- Keep responses concise, practical, plain text, and polite.`;

const supportMetrics = {
  totalMessages: 0,
  success: 0,
  failed: 0,
  databaseDirect: 0,
  llmFallback: 0,
  handoffRecommended: 0,
  byIntent: {
    product: 0,
    shipping: 0,
    order: 0,
    general: 0,
  },
};

const logSupportEvent = (event, payload = {}) => {
  console.log(
    JSON.stringify({
      scope: "support-chat",
      event,
      ts: new Date().toISOString(),
      ...payload,
    }),
  );
};

const clampConfidence = (value, fallback = 0.5) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(1, numericValue));
};

const detectSupportIntent = (message) => {
  const normalized = String(message || "").toLowerCase();

  if (
    /\border\b|tracking|shipment|shipped|delivery status|my order|payment status/i.test(
      normalized,
    )
  ) {
    return "order";
  }

  if (
    /shipping|delivery fee|inside chittagong|outside chittagong|courier/i.test(
      normalized,
    )
  ) {
    return "shipping";
  }

  if (
    /price|cost|stock|available|availability|product link|link|have\s+.*\b(oil|product)\b|\boil\b|\bsku\b/i.test(
      normalized,
    )
  ) {
    return "product";
  }

  return "general";
};

const normalizeCitation = (citation) => {
  const label = String(citation?.label || "").trim();
  if (!label) {
    return null;
  }

  return {
    type: String(citation?.type || "reference").trim() || "reference",
    label,
    url: String(citation?.url || "").trim(),
  };
};

const dedupeCitations = (citations) => {
  const items = Array.isArray(citations) ? citations : [];
  const seen = new Set();

  return items
    .map(normalizeCitation)
    .filter(Boolean)
    .filter((item) => {
      const key = `${item.type}|${item.label}|${item.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

const buildCitationBlock = (citations) => {
  const items = dedupeCitations(citations).slice(0, 5);
  if (items.length === 0) {
    return "";
  }

  const lines = items.map((item) => {
    if (item.url) {
      return `- ${item.label}: ${item.url}`;
    }
    return `- ${item.label}`;
  });

  return `\n\nSources:\n${lines.join("\n")}`;
};

const appendCitationBlockToReply = (reply, citations) => {
  const baseReply = String(reply || "").trim();
  const citationBlock = buildCitationBlock(citations);
  return citationBlock ? `${baseReply}${citationBlock}` : baseReply;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "please",
  "the",
  "this",
  "to",
  "us",
  "what",
  "when",
  "where",
  "which",
  "with",
  "you",
  "your",
]);

const GENERIC_QUERY_TERMS = new Set([
  "price",
  "stock",
  "available",
  "availability",
  "cost",
  "link",
  "product",
  "products",
  "show",
  "share",
  "tell",
  "give",
  "have",
]);

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractKeywords = (message) => {
  const words = String(message || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && !STOP_WORDS.has(item));

  return [...new Set(words)].slice(0, 10);
};

const getProductSearchKeywords = (message) => {
  const normalized = String(message || "").trim();
  const keywords = extractKeywords(normalized);
  const meaningfulKeywords = keywords.filter((keyword) => !GENERIC_QUERY_TERMS.has(keyword));
  return meaningfulKeywords.length > 0 ? meaningfulKeywords : keywords;
};

const buildProductQuery = (searchKeywords) => {
  const safeKeywords = Array.isArray(searchKeywords) ? searchKeywords : [];

  const regexes = safeKeywords.map((keyword) => new RegExp(escapeRegex(keyword), "i"));
  const searchFields = [
    "name",
    "brand",
    "category",
    "subCategory",
    "description",
    "sae",
    "oilType",
    "api",
    "acea",
    "appropriateUse",
  ];

  const orConditions = regexes.flatMap((regex) =>
    searchFields.map((field) => ({ [field]: regex })),
  );

  if (orConditions.length === 0) {
    return {};
  }

  return { $or: orConditions };
};

const getProductMatchScore = (product, searchKeywords) => {
  if (!Array.isArray(searchKeywords) || searchKeywords.length === 0) {
    return 0;
  }

  const name = String(product?.name || "").toLowerCase();
  const brand = String(product?.brand || "").toLowerCase();
  const category = String(product?.category || "").toLowerCase();
  const subCategory = String(product?.subCategory || "").toLowerCase();

  return searchKeywords.reduce((score, keyword) => {
    const token = String(keyword || "").toLowerCase();
    if (!token) {
      return score;
    }

    let nextScore = score;
    if (name.includes(token)) nextScore += 8;
    if (brand.includes(token)) nextScore += 6;
    if (subCategory.includes(token) || category.includes(token)) nextScore += 4;
    return nextScore;
  }, 0);
};

const toNumberOrNull = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

const formatOrderItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.slice(0, 5).map((item) => ({
    name: item?.name || "Unknown item",
    quantity: toNumberOrNull(item?.quantity) || 1,
    price: toNumberOrNull(item?.price),
    size: item?.size || "",
    color: item?.color || "",
  }));
};

const getProductBaseUrl = () => {
  const configured =
    process.env.SUPPORT_PRODUCT_URL_BASE ||
    process.env.FRONTEND_URL ||
    process.env.OPENROUTER_SITE_URL ||
    "http://localhost:5173";

  return configured.replace(/\/$/, "");
};

const getFaqContext = () => {
  const raw = String(process.env.SUPPORT_FAQ_TEXT || "").trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
};

const buildKnowledgeContext = async ({ userId, message }) => {
  const searchKeywords = getProductSearchKeywords(message);
  const productQuery = buildProductQuery(searchKeywords);
  const productBaseUrl = getProductBaseUrl();

  const [productCandidates, categories, subCategories, settings, recentOrders] = await Promise.all([
    productModel
      .find(productQuery)
      .sort({ bestseller: -1, updatedAt: -1, date: -1 })
      .limit(50)
      .select(
        "name brand category subCategory description price salePrice stock unitSize sae oilType api acea appropriateUse bestseller updatedAt date _id",
      )
      .lean(),
    productModel.distinct("category"),
    productModel.distinct("subCategory"),
    settingsModel.findOne({}).lean(),
    orderModel
      .find({ userId })
      .sort({ date: -1 })
      .limit(MAX_RECENT_ORDERS)
      .select("status amount paymentMethod payment trackingUrl date items")
      .lean(),
  ]);

  const rankedProducts = productCandidates
    .map((product) => ({
      product,
      score: getProductMatchScore(product, searchKeywords),
      isBestseller: product?.bestseller ? 1 : 0,
      updatedAt: Number(new Date(product?.updatedAt || product?.date || 0)),
    }))
    .filter((item) => searchKeywords.length === 0 || item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.isBestseller !== a.isBestseller) return b.isBestseller - a.isBestseller;
      return b.updatedAt - a.updatedAt;
    })
    .slice(0, MAX_PRODUCT_MATCHES)
    .map((item) => item.product);

  const normalizedProducts = rankedProducts.map((product) => ({
    id: String(product._id),
    name: product.name,
    brand: product.brand,
    category: product.category,
    subCategory: product.subCategory,
    price: toNumberOrNull(product.price),
    salePrice: toNumberOrNull(product.salePrice),
    stock: toNumberOrNull(product.stock),
    unitSize: product.unitSize || "N/A",
    sae: product.sae || "N/A",
    oilType: product.oilType || "N/A",
    api: product.api || "N/A",
    acea: product.acea || "N/A",
    appropriateUse: product.appropriateUse || "N/A",
    url: `${productBaseUrl}/product/${product._id}`,
  }));

  const normalizedOrders = recentOrders.map((order) => ({
    date: order?.date ? new Date(order.date).toISOString() : null,
    status: order?.status || "Unknown",
    amount: toNumberOrNull(order?.amount),
    paymentMethod: order?.paymentMethod || "Unknown",
    paid: Boolean(order?.payment),
    trackingUrl: order?.trackingUrl || "",
    items: formatOrderItems(order?.items),
  }));

  return {
    products: normalizedProducts,
    categories: (categories || []).filter(Boolean).slice(0, MAX_DISTINCT_VALUES),
    subCategories: (subCategories || []).filter(Boolean).slice(0, MAX_DISTINCT_VALUES),
    shippingFees: {
      insideChittagong: toNumberOrNull(settings?.insideChittagongFee),
      outsideChittagong: toNumberOrNull(settings?.outsideChittagongFee),
    },
    recentOrders: normalizedOrders,
    faq: getFaqContext(),
  };
};

const formatMoney = (value) => {
  const amount = toNumberOrNull(value);
  return amount === null ? "N/A" : `৳${amount}`;
};

const getEffectivePriceText = (product) => {
  const salePrice = toNumberOrNull(product?.salePrice);
  const price = toNumberOrNull(product?.price);

  if (salePrice && price && salePrice > 0 && salePrice < price) {
    return `${formatMoney(salePrice)} (regular ${formatMoney(price)})`;
  }

  return formatMoney(price);
};

const formatShortDate = (isoString) => {
  if (!isoString) {
    return "Unknown date";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toISOString().slice(0, 10);
};

const buildDirectDatabaseReply = ({ message, knowledgeContext }) => {
  const normalizedMessage = String(message || "").toLowerCase();
  const intent = detectSupportIntent(normalizedMessage);
  const products = Array.isArray(knowledgeContext?.products)
    ? knowledgeContext.products
    : [];
  const recentOrders = Array.isArray(knowledgeContext?.recentOrders)
    ? knowledgeContext.recentOrders
    : [];
  const shippingFees = knowledgeContext?.shippingFees || {};

  if (intent === "order") {
    if (recentOrders.length === 0) {
      return {
        intent,
        sourceType: "database-direct",
        confidence: 0.45,
        handoffRecommended: true,
        citations: [{ type: "orders", label: "No recent order records found" }],
        reply:
          "I could not find recent orders in your account. Please place an order first or contact support if you think this is incorrect.",
      };
    }

    const orderLines = recentOrders.slice(0, 3).map((order, index) => {
      const trackingText = order.trackingUrl ? ` | Tracking: ${order.trackingUrl}` : "";
      return `${index + 1}. Date: ${formatShortDate(order.date)} | Status: ${order.status} | Amount: ${formatMoney(order.amount)} | Payment: ${order.paymentMethod} (${order.paid ? "Paid" : "Unpaid"})${trackingText}`;
    });

    return {
      intent,
      sourceType: "database-direct",
      confidence: 0.96,
      handoffRecommended: false,
      citations: [
        {
          type: "orders",
          label: `${recentOrders.length} recent order record(s) from your account`,
        },
      ],
      reply: `Here are your recent orders from our database:\n${orderLines.join("\n")}`,
    };
  }

  if (intent === "shipping") {
    return {
      intent,
      sourceType: "database-direct",
      confidence: 0.97,
      handoffRecommended: false,
      citations: [
        {
          type: "settings",
          label: "Delivery fees from settings",
        },
      ],
      reply: `Current delivery fees from our settings:\n- Inside Chittagong: ${formatMoney(shippingFees.insideChittagong)}\n- Outside Chittagong: ${formatMoney(shippingFees.outsideChittagong)}`,
    };
  }

  if (intent === "product" || products.length > 0) {
    if (products.length === 0) {
      return {
        intent: "product",
        sourceType: "database-direct",
        confidence: 0.4,
        handoffRecommended: true,
        citations: [{ type: "products", label: "No product matched this query" }],
        reply:
          "I could not find a matching product in our database for your query. Please share the exact product name and I will check again.",
      };
    }

    const strictKeywords = getProductSearchKeywords(normalizedMessage).filter(
      (keyword) => keyword.length >= 3,
    );

    const strictProducts =
      strictKeywords.length > 0
        ? products.filter((product) => {
            const nameAndBrand = `${product?.name || ""} ${product?.brand || ""}`.toLowerCase();
            return strictKeywords.some((keyword) => nameAndBrand.includes(keyword));
          })
        : products;

    const scoredProducts = strictProducts.map((product) => {
      const nameAndBrand = `${product?.name || ""} ${product?.brand || ""}`.toLowerCase();
      const matchedKeywordCount = strictKeywords.filter((keyword) =>
        nameAndBrand.includes(keyword),
      ).length;
      const keywordCoverage =
        strictKeywords.length > 0
          ? matchedKeywordCount / strictKeywords.length
          : 1;

      return {
        product,
        matchedKeywordCount,
        keywordCoverage,
      };
    });

    const strongProductMatches = scoredProducts
      .filter(
        (item) =>
          strictKeywords.length === 0 ||
          item.matchedKeywordCount >= Math.min(2, strictKeywords.length) ||
          item.keywordCoverage >= 0.5,
      )
      .map((item) => item.product);

    const productsToShow =
      strongProductMatches.length > 0
        ? strongProductMatches
        : strictKeywords.length > 0
          ? []
          : strictProducts;

    if (productsToShow.length === 0) {
      return {
        intent: "product",
        sourceType: "database-direct",
        confidence: 0.42,
        handoffRecommended: true,
        citations: [{ type: "products", label: "No high-confidence product match" }],
        reply:
          "I could not confidently match your product request in our catalog. Please share the exact product name (or brand + grade), and I can connect you to human support if needed.",
      };
    }

    const lines = productsToShow.slice(0, 3).map((product, index) => {
      const stockText = toNumberOrNull(product.stock) > 0 ? `${product.stock} in stock` : "Out of stock";
      return `${index + 1}. ${product.name} | Price: ${getEffectivePriceText(product)} | Stock: ${stockText} | Link: ${product.url}`;
    });

    return {
      intent: "product",
      sourceType: "database-direct",
      confidence: productsToShow.length > 0 ? 0.92 : 0.55,
      handoffRecommended: productsToShow.length === 0,
      citations: productsToShow.slice(0, 3).map((product) => ({
        type: "product",
        label: product.name,
        url: product.url,
      })),
      reply: `Based on our product database, here are the closest matches:\n${lines.join("\n")}`,
    };
  }

  return null;
};

const extractAssistantText = (data) => {
  const choice = data?.choices?.[0];
  const message = choice?.message;

  if (typeof message?.content === "string" && message.content.trim()) {
    return message.content.trim();
  }

  if (Array.isArray(message?.content)) {
    const combined = message.content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join(" ")
      .trim();

    if (combined) {
      return combined;
    }
  }

  if (typeof choice?.text === "string" && choice.text.trim()) {
    return choice.text.trim();
  }

  return "";
};

const estimateLlmConfidence = ({ intent, knowledgeContext, reply }) => {
  const productsCount = Array.isArray(knowledgeContext?.products)
    ? knowledgeContext.products.length
    : 0;
  const ordersCount = Array.isArray(knowledgeContext?.recentOrders)
    ? knowledgeContext.recentOrders.length
    : 0;
  const hasShippingData =
    toNumberOrNull(knowledgeContext?.shippingFees?.insideChittagong) !== null ||
    toNumberOrNull(knowledgeContext?.shippingFees?.outsideChittagong) !== null;
  const replyText = String(reply || "").toLowerCase();

  if (intent === "product") {
    return productsCount > 0 ? 0.72 : 0.42;
  }

  if (intent === "order") {
    return ordersCount > 0 ? 0.74 : 0.38;
  }

  if (intent === "shipping") {
    return hasShippingData ? 0.76 : 0.44;
  }

  if (replyText.includes("not sure") || replyText.includes("unavailable")) {
    return 0.46;
  }

  return 0.64;
};

const buildLlmCitations = ({ intent, knowledgeContext }) => {
  if (intent === "product") {
    return (knowledgeContext?.products || []).slice(0, 3).map((product) => ({
      type: "product",
      label: product.name,
      url: product.url,
    }));
  }

  if (intent === "order") {
    const orderCount = (knowledgeContext?.recentOrders || []).length;
    return [{ type: "orders", label: `${orderCount} recent order record(s)` }];
  }

  if (intent === "shipping") {
    return [{ type: "settings", label: "Delivery fee settings" }];
  }

  const faqCount = (knowledgeContext?.faq || []).length;
  return faqCount > 0
    ? [{ type: "faq", label: `${faqCount} FAQ reference line(s)` }]
    : [];
};

const getModelFallbackList = () => {
  const configured = (process.env.OPENROUTER_MODELS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return configured;
  }

  return [
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemma-3-4b-it:free",
  ];
};

const getOrCreateSession = async ({ userId, sessionId }) => {
  const now = new Date();

  if (sessionId) {
    const existingBySession = await supportChatModel.findOne({
      userId,
      sessionId,
      expiresAt: { $gt: now },
    });

    if (existingBySession) {
      return existingBySession;
    }
  }

  const latestSession = await supportChatModel
    .findOne({ userId, expiresAt: { $gt: now } })
    .sort({ updatedAt: -1 });

  if (latestSession) {
    return latestSession;
  }

  return supportChatModel.create({
    userId,
    messages: [],
    expiresAt: new Date(Date.now() + CHAT_RETENTION_MS),
  });
};

const callOpenRouterWithFallback = async ({ message, history, knowledgeContext }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing on backend server");
  }

  const baseUrl =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const appName = process.env.OPENROUTER_APP_NAME || "Japan Autos Support";
  const siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost:5173";
  const requestTimeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS || 18000);
  const maxTokens = Number(process.env.OPENROUTER_MAX_TOKENS || 350);

  const modelList = getModelFallbackList();
  let lastError = null;
  const errorsByModel = [];

  for (const model of modelList) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const payloadMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `DATABASE_CONTEXT:\n${JSON.stringify(knowledgeContext)}`,
        },
        ...history,
        { role: "user", content: message },
      ];

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": appName,
        },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          temperature: 0.3,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data?.error?.message ||
          data?.message ||
          `OpenRouter request failed for ${model}`;
        errorsByModel.push(`${model}: ${errorMessage}`);
        lastError = new Error(errorMessage);
        continue;
      }

      const assistantReply = extractAssistantText(data);
      if (!assistantReply) {
        errorsByModel.push(`${model}: Empty response payload`);
        lastError = new Error(`Empty response from model ${model}`);
        continue;
      }

      return {
        model,
        reply: assistantReply,
      };
    } catch (error) {
      errorsByModel.push(`${model}: ${error.message}`);
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (errorsByModel.length > 0) {
    throw new Error(`All support models failed. ${errorsByModel.join(" | ")}`);
  }

  throw lastError || new Error("All OpenRouter models failed");
};

const getSupportHistory = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    const chatSession = await getOrCreateSession({ userId, sessionId });

    res.json({
      success: true,
      sessionId: chatSession.sessionId,
      messages: chatSession.messages,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const sendSupportMessage = async (req, res) => {
  try {
    const { userId, sessionId, message } = req.body;
    supportMetrics.totalMessages += 1;

    const normalizedMessage = String(message || "").trim();
    if (!normalizedMessage) {
      return res.json({ success: false, message: "Message is required" });
    }

    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.json({
        success: false,
        message: `Message is too long. Max ${MAX_MESSAGE_LENGTH} characters allowed.`,
      });
    }

    const chatSession = await getOrCreateSession({ userId, sessionId });

    const trimmedHistory = chatSession.messages
      .slice(-MAX_CONTEXT_MESSAGES)
      .map((item) => ({ role: item.role, content: item.content }));

    const knowledgeContext = await buildKnowledgeContext({
      userId,
      message: normalizedMessage,
    });

    const directReply = buildDirectDatabaseReply({
      message: normalizedMessage,
      knowledgeContext,
    });

    const intent = detectSupportIntent(normalizedMessage);
    let model = "database-direct";
    let sourceType = "database-direct";
    let confidence = 0.5;
    let handoffRecommended = false;
    let citations = [];
    let reply = "";

    if (directReply) {
      reply = directReply.reply;
      sourceType = directReply.sourceType || "database-direct";
      confidence = clampConfidence(directReply.confidence, 0.8);
      handoffRecommended = Boolean(directReply.handoffRecommended);
      citations = dedupeCitations(directReply.citations);
      supportMetrics.databaseDirect += 1;
    } else {
      const llmResult = await callOpenRouterWithFallback({
        message: normalizedMessage,
        history: trimmedHistory,
        knowledgeContext,
      });
      model = llmResult.model;
      reply = llmResult.reply;
      sourceType = "llm";
      confidence = clampConfidence(
        estimateLlmConfidence({ intent, knowledgeContext, reply }),
        0.6,
      );
      citations = dedupeCitations(buildLlmCitations({ intent, knowledgeContext }));
      handoffRecommended = confidence < LOW_CONFIDENCE_THRESHOLD;
      supportMetrics.llmFallback += 1;
    }

    if (handoffRecommended) {
      supportMetrics.handoffRecommended += 1;
      reply = `${reply}\n\nIf you want, I can connect you to human support for a precise answer.`;
    }

    const finalReply = appendCitationBlockToReply(reply, citations);

    supportMetrics.byIntent[intent] = (supportMetrics.byIntent[intent] || 0) + 1;
    supportMetrics.success += 1;

    logSupportEvent("message.success", {
      userId,
      sessionId: chatSession.sessionId,
      model,
      sourceType,
      intent,
      confidence,
      handoffRecommended,
      citationsCount: citations.length,
      metrics: supportMetrics,
    });

    chatSession.messages.push(
      {
        role: "user",
        content: normalizedMessage,
        createdAt: new Date(),
      },
      {
        role: "assistant",
        content: finalReply,
        meta: {
          sourceType,
          intent,
          confidence,
          handoffRecommended,
          citations,
        },
        createdAt: new Date(),
      },
    );

    chatSession.expiresAt = new Date(Date.now() + CHAT_RETENTION_MS);
    await chatSession.save();

    res.json({
      success: true,
      sessionId: chatSession.sessionId,
      model,
      reply: finalReply,
      sourceType,
      confidence,
      handoffRecommended,
      citations,
      messages: chatSession.messages,
    });
  } catch (error) {
    supportMetrics.failed += 1;
    logSupportEvent("message.failed", {
      error: error?.message || "Unknown support error",
      metrics: supportMetrics,
    });
    console.log(error);
    res.json({
      success: false,
      message:
        error?.name === "AbortError"
          ? "Support assistant timed out. Please try again."
          : error.message?.includes("Provider returned error")
            ? "Support provider is temporarily busy. Please try again in a few seconds."
            : error.message,
    });
  }
};

const clearSupportSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    if (sessionId) {
      await supportChatModel.deleteOne({ userId, sessionId });
    } else {
      await supportChatModel.deleteMany({ userId });
    }

    res.json({ success: true, message: "Support chat cleared" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getSupportHistory, sendSupportMessage, clearSupportSession };
