import test from "node:test";
import assert from "node:assert/strict";

import { __testables } from "../controllers/supportController.js";

const {
  buildDirectDatabaseReply,
  classifySupportQuery,
} = __testables;

const buildProduct = (overrides = {}) => ({
  id: overrides.id || "prod-1",
  name: overrides.name || "Shell Helix HX7 4L",
  brand: overrides.brand || "Shell",
  category: overrides.category || "Oils and Fluids",
  subCategory: overrides.subCategory || "Engine Oil",
  price: overrides.price ?? 3200,
  salePrice: overrides.salePrice ?? 0,
  stock: overrides.stock ?? 5,
  unitSize: overrides.unitSize || "4L",
  sae: overrides.sae || "10W-40",
  oilType: overrides.oilType || "Synthetic",
  api: overrides.api || "SN",
  acea: overrides.acea || "N/A",
  appropriateUse: overrides.appropriateUse || "FOR CAR",
  url: overrides.url || "http://localhost:5173/product/prod-1",
});

test("returns lowest-priced engine oil matches for broad price-driven queries", () => {
  const knowledgeContext = {
    products: [
      buildProduct({
        id: "oil-2",
        name: "Mobil Super 4L",
        brand: "Mobil",
        price: 2800,
        url: "http://localhost:5173/product/oil-2",
      }),
      buildProduct({
        id: "oil-1",
        name: "Shell Helix HX7 4L",
        brand: "Shell",
        price: 3200,
        url: "http://localhost:5173/product/oil-1",
      }),
      buildProduct({
        id: "coolant-1",
        name: "Toyota Super Coolant",
        brand: "Toyota",
        subCategory: "Coolant",
        category: "Oils and Fluids",
        price: 1800,
        url: "http://localhost:5173/product/coolant-1",
      }),
    ],
  };

  const result = buildDirectDatabaseReply({
    message: "what are cheapest engine oil do you have?",
    knowledgeContext,
  });

  assert.ok(result);
  assert.equal(result.intent, "product");
  assert.equal(result.handoffRecommended, false);
  assert.match(result.reply, /lowest-priced matching products/i);
  assert.match(result.reply, /1\. Mobil Super 4L/);
  assert.doesNotMatch(result.reply, /Toyota Super Coolant/);
});

test("falls back to handoff when no product confidently matches the request", () => {
  const knowledgeContext = {
    products: [
      buildProduct({
        id: "brake-1",
        name: "Brembo Brake Fluid",
        brand: "Brembo",
        subCategory: "Brake Fluid",
        category: "Oils and Fluids",
        url: "http://localhost:5173/product/brake-1",
      }),
    ],
  };

  const result = buildDirectDatabaseReply({
    message: "cheapest engine oil",
    knowledgeContext,
  });

  assert.ok(result);
  assert.equal(result.intent, "product");
  assert.equal(result.handoffRecommended, true);
  assert.match(result.reply, /could not confidently match/i);
});

test("uses the discounted sale price when sorting low-price product matches", () => {
  const knowledgeContext = {
    products: [
      buildProduct({
        id: "oil-sale",
        name: "Castrol Magnatec 4L",
        brand: "Castrol",
        price: 3600,
        salePrice: 2500,
        url: "http://localhost:5173/product/oil-sale",
      }),
      buildProduct({
        id: "oil-regular",
        name: "Mobil Super 4L",
        brand: "Mobil",
        price: 2800,
        salePrice: 0,
        url: "http://localhost:5173/product/oil-regular",
      }),
    ],
  };

  const result = buildDirectDatabaseReply({
    message: "show me the cheapest engine oil",
    knowledgeContext,
  });

  assert.ok(result);
  assert.match(result.reply, /1\. Castrol Magnatec 4L/);
  assert.match(result.reply, /regular .*3600/);
});

test("answers grounded FAQ questions from curated FAQ knowledge", () => {
  const result = buildDirectDatabaseReply({
    message: "what is your return policy?",
    knowledgeContext: {
      products: [],
      recentOrders: [],
      shippingFees: {},
      faq: [
        {
          id: "faq-1",
          title: "Return policy",
          question: "What is your return policy?",
          answer: "Unused products can be returned within 3 days with proof of purchase.",
          category: "Returns",
          tags: ["return", "returns", "policy"],
          sourceVersion: "faq-v1",
        },
      ],
    },
  });

  assert.ok(result);
  assert.equal(result.intent, "faq");
  assert.equal(result.actionType, "answer");
  assert.equal(result.handoffRecommended, false);
  assert.match(result.reply, /returned within 3 days/i);
});

test("refuses unsupported high-risk support requests and recommends human review", () => {
  const result = buildDirectDatabaseReply({
    message: "I need legal advice about a chargeback dispute",
    knowledgeContext: {
      products: [],
      recentOrders: [],
      shippingFees: {},
      faq: [],
    },
  });

  assert.ok(result);
  assert.equal(result.intent, "unsupported");
  assert.equal(result.actionType, "refuse");
  assert.equal(result.handoffRecommended, true);
  assert.match(result.reply, /cannot safely answer/i);
});

test("classifies high-risk support topics for human review", () => {
  const result = classifySupportQuery("This is a payment dispute and legal issue");

  assert.equal(result.intent, "unsupported");
  assert.equal(result.requiresHuman, true);
  assert.equal(result.riskLevel, "high");
});
