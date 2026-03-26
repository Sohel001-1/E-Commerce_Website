import supportChatModel, {
  CHAT_RETENTION_MS,
} from "../models/supportChatModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import settingsModel from "../models/settingsModel.js";
import supportFaqModel from "../models/supportFaqModel.js";
import supportTicketModel from "../models/supportTicketModel.js";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_MESSAGES = 20;
const MAX_PRODUCT_MATCHES = 8;
const MAX_RECENT_ORDERS = 5;
const MAX_DISTINCT_VALUES = 25;
const LOW_CONFIDENCE_THRESHOLD = Number(
  process.env.SUPPORT_CONFIDENCE_THRESHOLD || 0.55,
);
const CLARIFY_CONFIDENCE_THRESHOLD = Number(
  process.env.SUPPORT_CLARIFY_CONFIDENCE_THRESHOLD || 0.72,
);
const PROMPT_VERSION = "support-v2";

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
  handoffCreated: 0,
  byIntent: {
    product: 0,
    shipping: 0,
    order: 0,
    faq: 0,
    unsupported: 0,
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
    /return policy|returns|warranty|guarantee|exchange policy|payment method|cash on delivery|cod|store policy/i.test(
      normalized,
    )
  ) {
    return "faq";
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

const classifySupportQuery = (message) => {
  const normalized = String(message || "").toLowerCase();
  const intent = detectSupportIntent(normalized);
  const isUnsupported =
    /\blegal\b|attorney|lawsuit|court|chargeback|fraud|stolen card|payment dispute/i.test(
      normalized,
    );

  return {
    intent: isUnsupported ? "unsupported" : intent,
    riskLevel: isUnsupported ? "high" : "normal",
    requiresHuman: isUnsupported,
  };
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

const LOW_PRICE_QUERY_TERMS = new Set([
  "cheap",
  "cheaper",
  "cheapest",
  "budget",
  "affordable",
  "lowest",
  "low",
  "inexpensive",
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
  const meaningfulKeywords = keywords.filter(
    (keyword) =>
      !GENERIC_QUERY_TERMS.has(keyword) && !LOW_PRICE_QUERY_TERMS.has(keyword),
  );
  return meaningfulKeywords.length > 0 ? meaningfulKeywords : keywords;
};

const isLowPriceProductQuery = (message) =>
  /\b(cheap|cheaper|cheapest|budget|affordable|lowest|low price|least expensive|best price)\b/i.test(
    String(message || ""),
  );

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

const getProductSearchText = (product) =>
  [
    product?.name,
    product?.brand,
    product?.category,
    product?.subCategory,
    product?.description,
    product?.unitSize,
    product?.sae,
    product?.oilType,
    product?.api,
    product?.acea,
    product?.appropriateUse,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

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

const getEnvFaqContext = () => {
  const raw = String(process.env.SUPPORT_FAQ_TEXT || "").trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((line, index) => ({
      id: `env-faq-${index + 1}`,
      title: line,
      question: line,
      answer: line,
      category: "General",
      tags: [],
      sourceVersion: "env-faq-v1",
      updatedAt: new Date(0).toISOString(),
    }));
};

const getFaqContext = async () => {
  const faqEntries = await supportFaqModel
    .find({ status: "active" })
    .sort({ priority: -1, updatedAt: -1 })
    .limit(30)
    .lean();

  if (faqEntries.length > 0) {
    return faqEntries.map((entry) => ({
      id: String(entry._id),
      title: entry.title,
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      tags: entry.tags || [],
      sourceVersion: entry.sourceVersion || "faq-v1",
      updatedAt: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : null,
    }));
  }

  return getEnvFaqContext();
};

const buildKnowledgeContext = async ({ userId, message }) => {
  const searchKeywords = getProductSearchKeywords(message);
  const productQuery = buildProductQuery(searchKeywords);
  const productBaseUrl = getProductBaseUrl();

  const [productCandidates, categories, subCategories, settings, recentOrders, faqEntries] = await Promise.all([
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
    getFaqContext(),
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
    faq: faqEntries,
    freshness: {
      catalogVersion:
        rankedProducts[0]?.updatedAt || rankedProducts[0]?.date
          ? new Date(rankedProducts[0]?.updatedAt || rankedProducts[0]?.date).toISOString()
          : null,
      faqVersion: faqEntries[0]?.sourceVersion || "faq-v1",
      ordersVersion: normalizedOrders[0]?.date || null,
    },
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

const getEffectivePriceValue = (product) => {
  const salePrice = toNumberOrNull(product?.salePrice);
  const price = toNumberOrNull(product?.price);

  if (salePrice && price && salePrice > 0 && salePrice < price) {
    return salePrice;
  }

  return price;
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

const getFaqMatchScore = (faqEntry, keywords) => {
  const haystack = [
    faqEntry?.title,
    faqEntry?.question,
    faqEntry?.answer,
    ...(Array.isArray(faqEntry?.tags) ? faqEntry.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.reduce((score, keyword) => {
    if (haystack.includes(keyword)) {
      return score + 1;
    }

    return score;
  }, 0);
};

const buildFaqReply = ({ message, knowledgeContext }) => {
  const faqEntries = Array.isArray(knowledgeContext?.faq) ? knowledgeContext.faq : [];
  if (faqEntries.length === 0) {
    return null;
  }

  const keywords = extractKeywords(message).filter((keyword) => keyword.length >= 3);
  if (keywords.length === 0 && detectSupportIntent(message) !== "faq") {
    return null;
  }

  const rankedFaqs = faqEntries
    .map((entry) => ({
      entry,
      score: getFaqMatchScore(entry, keywords),
    }))
    .filter((item) => item.score > 0 || detectSupportIntent(message) === "faq")
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (rankedFaqs.length === 0) {
    return null;
  }

  const topFaq = rankedFaqs[0];

  return {
    intent: "faq",
    sourceType: "faq",
    confidence: topFaq.score >= 2 ? 0.9 : 0.7,
    handoffRecommended: topFaq.score < 1,
    actionType: topFaq.score >= 2 ? "answer" : "clarify",
    conversationTags: ["faq", String(topFaq.entry.category || "general").toLowerCase()],
    citations: rankedFaqs.map(({ entry }) => ({
      type: "faq",
      label: entry.title,
      url: "",
    })),
    retrievalSummary: {
      sources: ["faq"],
      matchedFaqCount: rankedFaqs.length,
      faqVersion: topFaq.entry.sourceVersion || "faq-v1",
    },
    reply:
      topFaq.score >= 2
        ? `${topFaq.entry.answer}`
        : `I found a related policy answer, but I need one more detail to be accurate. Are you asking about ${topFaq.entry.category || "our policy"}?`,
  };
};

const buildUnsupportedReply = () => ({
  intent: "unsupported",
  sourceType: "policy",
  confidence: 0.2,
  handoffRecommended: true,
  actionType: "refuse",
  conversationTags: ["unsupported", "high-risk"],
  citations: [{ type: "policy", label: "Human review required for this topic" }],
  retrievalSummary: {
    sources: [],
    matchedProductCount: 0,
    matchedFaqCount: 0,
  },
  reply:
    "I cannot safely answer that request in chat. Please contact human support so a team member can review it directly.",
});

const buildRetrievalSummary = ({ knowledgeContext, sourceType }) => ({
  sources: [sourceType],
  matchedProductCount: Array.isArray(knowledgeContext?.products) ? knowledgeContext.products.length : 0,
  matchedOrderCount: Array.isArray(knowledgeContext?.recentOrders) ? knowledgeContext.recentOrders.length : 0,
  matchedFaqCount: Array.isArray(knowledgeContext?.faq) ? knowledgeContext.faq.length : 0,
  freshness: knowledgeContext?.freshness || {},
});

const buildConversationTags = ({ intent, handoffRecommended, sourceType }) =>
  [intent, sourceType, handoffRecommended ? "handoff" : "resolved"].filter(Boolean);

const buildHandoffState = ({ chatSession, createdTicket }) => ({
  available: true,
  recommended: Boolean(createdTicket) || false,
  ticketId: createdTicket ? String(createdTicket._id) : "",
  status: createdTicket ? createdTicket.status : "not_created",
});

const buildDirectDatabaseReply = ({ message, knowledgeContext }) => {
  const normalizedMessage = String(message || "").toLowerCase();
  const classification = classifySupportQuery(normalizedMessage);
  const intent = classification.intent;
  const products = Array.isArray(knowledgeContext?.products)
    ? knowledgeContext.products
    : [];
  const recentOrders = Array.isArray(knowledgeContext?.recentOrders)
    ? knowledgeContext.recentOrders
    : [];
  const shippingFees = knowledgeContext?.shippingFees || {};

  if (classification.requiresHuman) {
    return buildUnsupportedReply();
  }

  const faqReply = buildFaqReply({
    message: normalizedMessage,
    knowledgeContext,
  });

  if (faqReply) {
    return faqReply;
  }

  if (intent === "order") {
    if (recentOrders.length === 0) {
      return {
        intent,
        sourceType: "database-direct",
        confidence: 0.45,
        handoffRecommended: true,
        actionType: "offer_handoff",
        conversationTags: ["order", "missing-order"],
        retrievalSummary: {
          sources: ["orders"],
          matchedOrderCount: 0,
        },
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
      actionType: "answer",
      conversationTags: ["order", "resolved"],
      retrievalSummary: {
        sources: ["orders"],
        matchedOrderCount: recentOrders.length,
      },
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
      actionType: "answer",
      conversationTags: ["shipping", "resolved"],
      retrievalSummary: {
        sources: ["settings"],
      },
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
        actionType: "offer_handoff",
        conversationTags: ["product", "no-match"],
        retrievalSummary: {
          sources: ["catalog"],
          matchedProductCount: 0,
        },
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
            const searchableText = getProductSearchText(product);
            return strictKeywords.some((keyword) => searchableText.includes(keyword));
          })
        : products;

    const scoredProducts = strictProducts.map((product) => {
      const searchableText = getProductSearchText(product);
      const matchedKeywordCount = strictKeywords.filter((keyword) =>
        searchableText.includes(keyword),
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
          item.matchedKeywordCount >= Math.min(2, strictKeywords.length),
      )
      .map((item) => item.product);

    const productsToShow =
      strongProductMatches.length > 0
        ? strongProductMatches
        : strictKeywords.length > 0
          ? []
          : strictProducts;

    const preferLowestPrice = isLowPriceProductQuery(normalizedMessage);
    const sortedProductsToShow = [...productsToShow].sort((left, right) => {
      const leftInStock = toNumberOrNull(left?.stock) > 0 ? 1 : 0;
      const rightInStock = toNumberOrNull(right?.stock) > 0 ? 1 : 0;

      if (leftInStock !== rightInStock) {
        return rightInStock - leftInStock;
      }

      if (preferLowestPrice) {
        const leftPrice = getEffectivePriceValue(left) ?? Number.MAX_SAFE_INTEGER;
        const rightPrice = getEffectivePriceValue(right) ?? Number.MAX_SAFE_INTEGER;

        if (leftPrice !== rightPrice) {
          return leftPrice - rightPrice;
        }
      }

      return 0;
    });

    if (sortedProductsToShow.length === 0) {
      return {
        intent: "product",
        sourceType: "database-direct",
        confidence: 0.42,
        handoffRecommended: true,
        actionType: "clarify",
        conversationTags: ["product", "ambiguous"],
        retrievalSummary: {
          sources: ["catalog"],
          matchedProductCount: products.length,
        },
        citations: [{ type: "products", label: "No high-confidence product match" }],
        reply:
          "I could not confidently match your product request in our catalog. Please share the exact product name (or brand + grade), and I can connect you to human support if needed.",
      };
    }

    const lines = sortedProductsToShow.slice(0, 3).map((product, index) => {
      const stockText = toNumberOrNull(product.stock) > 0 ? `${product.stock} in stock` : "Out of stock";
      return `${index + 1}. ${product.name} | Price: ${getEffectivePriceText(product)} | Stock: ${stockText} | Link: ${product.url}`;
    });

    return {
      intent: "product",
      sourceType: "database-direct",
      confidence: sortedProductsToShow.length > 0 ? 0.92 : 0.55,
      handoffRecommended: sortedProductsToShow.length === 0,
      actionType: preferLowestPrice ? "recommend_products" : "recommend_products",
      conversationTags: ["product", preferLowestPrice ? "price-intent" : "browse"],
      retrievalSummary: {
        sources: ["catalog"],
        matchedProductCount: sortedProductsToShow.length,
        sortMode: preferLowestPrice ? "lowest-price" : "relevance",
      },
      citations: sortedProductsToShow.slice(0, 3).map((product) => ({
        type: "product",
        label: product.name,
        url: product.url,
      })),
      reply: `${preferLowestPrice ? "Here are the lowest-priced matching products from our database:" : "Based on our product database, here are the closest matches:"}\n${lines.join("\n")}`,
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

const createSupportTicket = async ({
  userId,
  chatSession,
  latestUserMessage,
  assistantMeta,
}) => {
  const existing = await supportTicketModel.findOne({
    userId,
    sessionId: chatSession.sessionId,
    status: { $in: ["new", "assigned", "needs_user_reply"] },
  });

  if (existing) {
    return existing;
  }

  const ticket = await supportTicketModel.create({
    userId,
    sessionId: chatSession.sessionId,
    status: "new",
    intent: assistantMeta.intent,
    actionType: assistantMeta.actionType,
    confidence: assistantMeta.confidence,
    reason: assistantMeta.handoff?.reason || "Assistant requested human follow-up",
    latestUserMessage,
    transcript: chatSession.messages,
    retrievalSummary: assistantMeta.retrievalSummary || {},
    handoff: assistantMeta.handoff || {},
    conversationTags: assistantMeta.conversationTags || [],
  });

  supportMetrics.handoffCreated += 1;
  return ticket;
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
    const requestStartedAt = Date.now();

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

    const classification = classifySupportQuery(normalizedMessage);
    const intent = classification.intent;
    let model = "database-direct";
    let sourceType = "database-direct";
    let confidence = 0.5;
    let handoffRecommended = false;
    let citations = [];
    let reply = "";
    let actionType = "answer";
    let retrievalSummary = buildRetrievalSummary({
      knowledgeContext,
      sourceType: "database-direct",
    });
    let conversationTags = [intent];

    if (directReply) {
      reply = directReply.reply;
      sourceType = directReply.sourceType || "database-direct";
      confidence = clampConfidence(directReply.confidence, 0.8);
      handoffRecommended = Boolean(directReply.handoffRecommended);
      citations = dedupeCitations(directReply.citations);
      actionType = directReply.actionType || "answer";
      retrievalSummary =
        directReply.retrievalSummary ||
        buildRetrievalSummary({ knowledgeContext, sourceType });
      conversationTags =
        directReply.conversationTags ||
        buildConversationTags({ intent, handoffRecommended, sourceType });
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
      actionType =
        confidence < LOW_CONFIDENCE_THRESHOLD
          ? "offer_handoff"
          : confidence < CLARIFY_CONFIDENCE_THRESHOLD
            ? "clarify"
            : "answer";
      retrievalSummary = buildRetrievalSummary({ knowledgeContext, sourceType });
      conversationTags = buildConversationTags({ intent, handoffRecommended, sourceType });
      supportMetrics.llmFallback += 1;
    }

    if (handoffRecommended) {
      supportMetrics.handoffRecommended += 1;
      reply = `${reply}\n\nIf you want, I can connect you to human support for a precise answer.`;
      if (actionType === "answer") {
        actionType = "offer_handoff";
      }
    }

    const finalReply = appendCitationBlockToReply(reply, citations);
    const handoff = {
      available: true,
      recommended: handoffRecommended,
      status: "not_created",
      ticketId: "",
      reason: handoffRecommended
        ? "Low confidence or human review recommended"
        : "",
    };

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
      actionType,
      latencyMs: Date.now() - requestStartedAt,
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
          actionType,
          retrievalSummary,
          handoff,
          conversationTags,
          promptVersion: PROMPT_VERSION,
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
      actionType,
      retrievalSummary,
      handoff,
      conversationTags,
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

const createSupportHandoff = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    const chatSession = await getOrCreateSession({ userId, sessionId });
    const latestAssistantMessage = [...chatSession.messages]
      .reverse()
      .find((item) => item.role === "assistant");
    const latestUserMessage = [...chatSession.messages]
      .reverse()
      .find((item) => item.role === "user");

    if (!latestAssistantMessage?.meta) {
      return res.json({
        success: false,
        message: "No assistant response is available to hand off yet.",
      });
    }

    const ticket = await createSupportTicket({
      userId,
      chatSession,
      latestUserMessage: latestUserMessage?.content || "",
      assistantMeta: latestAssistantMessage.meta,
    });

    latestAssistantMessage.meta.handoff = {
      ...(latestAssistantMessage.meta.handoff || {}),
      available: true,
      recommended: true,
      ticketId: String(ticket._id),
      status: ticket.status,
      reason:
        latestAssistantMessage.meta.handoff?.reason ||
        "Human follow-up requested by customer",
    };
    latestAssistantMessage.meta.actionType = "handoff_created";

    await chatSession.save();

    res.json({
      success: true,
      handoff: latestAssistantMessage.meta.handoff,
      ticket,
      sessionId: chatSession.sessionId,
      messages: chatSession.messages,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const submitSupportFeedback = async (req, res) => {
  try {
    const { userId, sessionId, messageCreatedAt, feedback } = req.body;
    const allowedFeedback = new Set(["helpful", "not_helpful", "escalated"]);
    if (!allowedFeedback.has(String(feedback || ""))) {
      return res.json({ success: false, message: "Invalid feedback value" });
    }

    const chatSession = await getOrCreateSession({ userId, sessionId });
    const targetMessage = chatSession.messages.find(
      (item) =>
        item.role === "assistant" &&
        item.createdAt &&
        new Date(item.createdAt).toISOString() === new Date(messageCreatedAt).toISOString(),
    );

    if (!targetMessage) {
      return res.json({ success: false, message: "Support message not found" });
    }

    targetMessage.meta = {
      ...(targetMessage.meta || {}),
      feedback,
    };

    if (feedback === "escalated") {
      const ticket = await createSupportTicket({
        userId,
        chatSession,
        latestUserMessage:
          [...chatSession.messages].reverse().find((item) => item.role === "user")?.content || "",
        assistantMeta: {
          ...(targetMessage.meta || {}),
          handoff: {
            ...(targetMessage.meta?.handoff || {}),
            reason: "Escalated via user feedback",
          },
        },
      });

      targetMessage.meta.handoff = {
        ...(targetMessage.meta?.handoff || {}),
        available: true,
        recommended: true,
        ticketId: String(ticket._id),
        status: ticket.status,
        reason: "Escalated via user feedback",
      };
      targetMessage.meta.actionType = "handoff_created";
    }

    await chatSession.save();

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

const __testables = {
  buildDirectDatabaseReply,
  buildFaqReply,
  buildUnsupportedReply,
  detectSupportIntent,
  classifySupportQuery,
  getProductSearchKeywords,
};

export {
  getSupportHistory,
  sendSupportMessage,
  clearSupportSession,
  createSupportHandoff,
  submitSupportFeedback,
  __testables,
};
