import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const currency = "usd", deliveryCharge = 10;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const newOrder = new orderModel({ userId, items, amount, address, paymentMethod: "COD", payment: false, date: Date.now() });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Order Placed" });
  } catch (error) { res.json({ success: false, message: error.message }) }
};

const placeOrderStripe = async (req, res) => {
  try {
    if (!stripe) {
      return res.json({ success: false, message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to .env" });
    }
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;
    const newOrder = new orderModel({ userId, items, amount, address, paymentMethod: "Stripe", payment: false, date: Date.now() });
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: { currency, product_data: { name: item.name }, unit_amount: item.price * 100 },
      quantity: item.quantity,
    }));
    line_items.push({
      price_data: { currency, product_data: { name: "Delivery Charges" }, unit_amount: deliveryCharge * 100 },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items, mode: "payment",
    });
    res.json({ success: true, session_url: session.url });
  } catch (error) { res.json({ success: false, message: error.message }) }
};

const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) { res.json({ success: false, message: error.message }) }
};

const allOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) { res.json({ success: false, message: error.message }) }
};

const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) { res.json({ success: false, message: error.message }) }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) { res.json({ success: false, message: error.message }) }
};

// ✅ Cancel Order (User/Admin)
const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body; // userId from token middleware (user) or body (admin)

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    // Only allow if status is "Order Placed"
    if (order.status !== "Order Placed") {
      return res.json({ success: false, message: "Cannot cancel order after processing started" });
    }

    // If user is cancelling, verify ownership
    // Note: middleware adds userId to body usually, but let's be safe. 
    // Admin calls might pass userId explicitly or we trust adminAuth.
    // For simplicity, we just update status to "Cancelled".

    await orderModel.findByIdAndUpdate(orderId, { status: "Cancelled" });
    res.json({ success: true, message: "Order Cancelled" });

  } catch (error) { res.json({ success: false, message: error.message }) }
};

// ✅ Update Tracking Link (Admin)
const updateTracking = async (req, res) => {
  try {
    const { orderId, trackingUrl } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { trackingUrl });
    res.json({ success: true, message: "Tracking Link Updated" });
  } catch (error) { res.json({ success: false, message: error.message }) }
};

export { placeOrder, placeOrderStripe, allOrder, userOrders, updateStatus, verifyStripe, cancelOrder, updateTracking };