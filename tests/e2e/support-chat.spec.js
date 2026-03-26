import { test, expect } from "@playwright/test";

const routeJson = async (route, body, status = 200) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
};

const buildAssistantMessage = ({
  content,
  actionType,
  intent,
  confidence,
  citations = [],
  handoff = {
    available: true,
    recommended: false,
    status: "not_created",
    ticketId: "",
  },
  feedback = "",
}) => ({
  role: "assistant",
  content,
  createdAt: "2026-03-26T10:00:00.000Z",
  meta: {
    sourceType: "database-direct",
    intent,
    confidence,
    handoffRecommended: handoff.recommended,
    citations,
    actionType,
    retrievalSummary: {},
    handoff,
    conversationTags: [intent],
    feedback,
  },
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("token", "e2e-token");
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/product\/list/, async (route) => {
    await routeJson(route, {
      success: true,
      products: [
        {
          _id: "oil-2",
          name: "Mobil Super 4L",
          description: "Synthetic engine oil for cars",
          price: 2800,
          salePrice: 0,
          stock: 5,
          image: [],
          category: "Oils and Fluids",
          subCategory: "Engine Oil",
          brand: "Mobil",
          bestseller: true,
        },
      ],
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/settings$/, async (route) => {
    await routeJson(route, {
      success: true,
      settings: {
        insideChittagongFee: 60,
        outsideChittagongFee: 120,
      },
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/user\/get-profile/, async (route) => {
    await routeJson(route, {
      success: true,
      user: {
        name: "E2E User",
        email: "e2e@example.com",
      },
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/user\/wishlist/, async (route) => {
    await routeJson(route, {
      success: true,
      wishlist: [],
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/cart\/get/, async (route) => {
    await routeJson(route, {
      success: true,
      cartData: {},
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/support\/history/, async (route) => {
    await routeJson(route, {
      success: true,
      sessionId: "session-e2e",
      messages: [],
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/support\/message/, async (route) => {
    const requestBody = route.request().postDataJSON();
    const userMessage = String(requestBody?.message || "");
    const lower = userMessage.toLowerCase();
    const userTurn = {
      role: "user",
      content: userMessage,
      createdAt: "2026-03-26T09:59:59.000Z",
    };

    if (lower.includes("return policy")) {
      await routeJson(route, {
        success: true,
        sessionId: "session-e2e",
        model: "database-direct",
        sourceType: "faq",
        confidence: 0.9,
        actionType: "answer",
        handoffRecommended: false,
        citations: [{ type: "faq", label: "Return policy", url: "" }],
        handoff: {
          available: true,
          recommended: false,
          status: "not_created",
          ticketId: "",
        },
        messages: [
          userTurn,
          buildAssistantMessage({
            content: "Unused products can be returned within 3 days with proof of purchase.",
            actionType: "answer",
            intent: "faq",
            confidence: 0.9,
            citations: [{ type: "faq", label: "Return policy", url: "" }],
          }),
        ],
      });
      return;
    }

    await routeJson(route, {
      success: true,
      sessionId: "session-e2e",
      model: "database-direct",
      sourceType: "database-direct",
      confidence: 0.92,
      actionType: "offer_handoff",
      handoffRecommended: true,
      citations: [
        {
          type: "product",
          label: "Mobil Super 4L",
          url: "http://localhost:5173/product/oil-2",
        },
      ],
      handoff: {
        available: true,
        recommended: true,
        status: "not_created",
        ticketId: "",
      },
      messages: [
        userTurn,
        buildAssistantMessage({
          content:
            "Here are the lowest-priced matching products from our database:\n" +
            "1. Mobil Super 4L | Price: 2800 | Stock: 5 in stock | Link: http://localhost:5173/product/oil-2",
          actionType: "offer_handoff",
          intent: "product",
          confidence: 0.92,
          citations: [
            {
              type: "product",
              label: "Mobil Super 4L",
              url: "http://localhost:5173/product/oil-2",
            },
          ],
          handoff: {
            available: true,
            recommended: true,
            status: "not_created",
            ticketId: "",
          },
        }),
      ],
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/support\/handoff/, async (route) => {
    await routeJson(route, {
      success: true,
      sessionId: "session-e2e",
      handoff: {
        available: true,
        recommended: true,
        status: "new",
        ticketId: "ticket-123",
      },
      messages: [
        {
          role: "user",
          content: "what are cheapest engine oil do you have?",
          createdAt: "2026-03-26T09:59:59.000Z",
        },
        buildAssistantMessage({
          content:
            "Here are the lowest-priced matching products from our database:\n" +
            "1. Mobil Super 4L | Price: 2800 | Stock: 5 in stock | Link: http://localhost:5173/product/oil-2",
          actionType: "handoff_created",
          intent: "product",
          confidence: 0.92,
          citations: [
            {
              type: "product",
              label: "Mobil Super 4L",
              url: "http://localhost:5173/product/oil-2",
            },
          ],
          handoff: {
            available: true,
            recommended: true,
            status: "new",
            ticketId: "ticket-123",
          },
        }),
      ],
    });
  });

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/support\/feedback/, async (route) => {
    const requestBody = route.request().postDataJSON();
    const feedback = requestBody?.feedback || "";

    await routeJson(route, {
      success: true,
      sessionId: "session-e2e",
      messages: [
        {
          role: "user",
          content: "what are cheapest engine oil do you have?",
          createdAt: "2026-03-26T09:59:59.000Z",
        },
        buildAssistantMessage({
          content:
            "Here are the lowest-priced matching products from our database:\n" +
            "1. Mobil Super 4L | Price: 2800 | Stock: 5 in stock | Link: http://localhost:5173/product/oil-2",
          actionType: feedback === "escalated" ? "handoff_created" : "offer_handoff",
          intent: "product",
          confidence: 0.92,
          feedback,
          citations: [
            {
              type: "product",
              label: "Mobil Super 4L",
              url: "http://localhost:5173/product/oil-2",
            },
          ],
          handoff: {
            available: true,
            recommended: true,
            status: feedback === "escalated" ? "new" : "not_created",
            ticketId: feedback === "escalated" ? "ticket-123" : "",
          },
        }),
      ],
    });
  });
});

test("logged-in user can ask the support chat for the cheapest engine oil and request handoff", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Toggle support chat").click();

  await page.getByPlaceholder("Ask a support question...").fill("what are cheapest engine oil do you have?");
  await page.getByLabel("Send support message").click();

  await expect(page.getByText("Human support available")).toBeVisible();
  await expect(
    page.getByText(/1\. Mobil Super 4L \| Price: 2800 \| Stock: 5 in stock/),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Request human support" })).toBeVisible();

  await page.getByRole("button", { name: "Request human support" }).click();
  await expect(page.getByText(/Human support ticket: ticket-123 \(new\)/)).toBeVisible();
});

test("logged-in user sees FAQ answers and can leave message feedback", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Toggle support chat").click();

  await page.getByPlaceholder("Ask a support question...").fill("what is your return policy?");
  await page.getByLabel("Send support message").click();

  await expect(page.getByText("Unused products can be returned within 3 days with proof of purchase.")).toBeVisible();
  await expect(page.getByText("Sources")).toBeVisible();

  const helpfulButton = page.locator("button").filter({ hasText: /^Helpful$/ });
  await helpfulButton.click();
  await expect(helpfulButton).toHaveClass(/border-brand-500/);
});

test("logged-in user can see a human admin reply inside the support chat", async ({ page }) => {
  await page.route(/http:\/\/(localhost|127\.0\.0\.1):4000\/api\/support\/history/, async (route) => {
    await routeJson(route, {
      success: true,
      sessionId: "session-e2e",
      messages: [
        {
          role: "user",
          content: "what are cheapest engine oil do you have?",
          createdAt: "2026-03-26T09:59:59.000Z",
        },
        buildAssistantMessage({
          content:
            "Here are the lowest-priced matching products from our database:\n" +
            "1. Mobil Super 4L | Price: 2800 | Stock: 5 in stock | Link: http://localhost:5173/product/oil-2",
          actionType: "handoff_created",
          intent: "product",
          confidence: 0.92,
          citations: [
            {
              type: "product",
              label: "Mobil Super 4L",
              url: "http://localhost:5173/product/oil-2",
            },
          ],
          handoff: {
            available: true,
            recommended: true,
            status: "needs_user_reply",
            ticketId: "ticket-123",
          },
        }),
        {
          role: "admin",
          content: "We currently have Mobil Super 4L at 2800. Tell us your car model and preferred grade so we can recommend the exact oil.",
          createdAt: "2026-03-26T10:05:00.000Z",
          meta: {
            sourceType: "human-support",
            intent: "product",
            confidence: 1,
            handoffRecommended: false,
            citations: [],
            actionType: "handoff_created",
            retrievalSummary: {},
            handoff: {
              available: true,
              recommended: false,
              status: "needs_user_reply",
              ticketId: "ticket-123",
            },
            conversationTags: ["human-support", "needs_user_reply"],
            promptVersion: "support-human-v1",
            feedback: "",
          },
        },
      ],
    });
  });

  await page.goto("/");
  await page.getByLabel("Toggle support chat").click();

  await expect(page.getByText("Human Support", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "We currently have Mobil Super 4L at 2800. Tell us your car model and preferred grade so we can recommend the exact oil.",
    ),
  ).toBeVisible();
  await expect(page.getByText(/ticket-123 \(needs_user_reply\)/).first()).toBeVisible();
});
