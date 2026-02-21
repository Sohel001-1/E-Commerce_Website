import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";

const currency = "usd", deliveryCharge = 10;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Check stock
    for (const item of items) {
      const product = await productModel.findById(item._id || item.productId);
      if (!product || product.stock < item.quantity) {
        return res.json({ success: false, message: `Product ${item.name} is out of stock or insufficient quantity` });
      }
    }

    // Deduct stock
    for (const item of items) {
      await productModel.findByIdAndUpdate(item._id || item.productId, { $inc: { stock: -item.quantity } });
    }

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

    // Check stock
    for (const item of items) {
      const product = await productModel.findById(item._id || item.productId);
      if (!product || product.stock < item.quantity) {
        return res.json({ success: false, message: `Product ${item.name} is out of stock or insufficient quantity` });
      }
    }

    // Deduct stock
    for (const item of items) {
      await productModel.findByIdAndUpdate(item._id || item.productId, { $inc: { stock: -item.quantity } });
    }

    const newOrder = new orderModel({ userId, items, amount, address, paymentMethod: "Stripe", payment: false, date: Date.now() });
    await newOrder.save();

    const line_items = items.map((item) => {
      const activePrice = item.salePrice > 0 ? item.salePrice : item.price;
      return {
        price_data: { currency, product_data: { name: item.name }, unit_amount: activePrice * 100 },
        quantity: item.quantity,
      };
    });
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
      const order = await orderModel.findById(orderId);
      if (order) {
        // Restore stock because payment failed or cancelled
        for (const item of order.items) {
          await productModel.findByIdAndUpdate(item._id || item.productId, { $inc: { stock: item.quantity } });
        }
      }
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

    // Restore stock
    for (const item of order.items) {
      await productModel.findByIdAndUpdate(item._id || item.productId, { $inc: { stock: item.quantity } });
    }

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

// ✅ Place Physical Order (Admin POS Sale)
const placePhysicalOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod } = req.body;

    // Check stock
    for (const item of items) {
      const product = await productModel.findById(item._id || item.productId);
      if (!product || product.stock < item.quantity) {
        return res.json({ success: false, message: `Product ${item.name} is out of stock or insufficient quantity` });
      }
    }

    // Deduct stock
    for (const item of items) {
      await productModel.findByIdAndUpdate(item._id || item.productId, { $inc: { stock: -item.quantity } });
    }

    // Admin walk-in orders might not have a userId, so we'll use a placeholder or "adminPOS"
    const newOrder = new orderModel({
      userId: "adminPOS",
      items,
      amount,
      address: address || { firstName: "Walk-in", lastName: "Customer", street: "Store", city: "Store", state: "Store", zip: "00000", country: "Store", phone: "N/A" },
      paymentMethod: paymentMethod || "Physical POS",
      payment: true, // already paid at POS
      status: "Delivered", // Since they take it physically immediately
      date: Date.now()
    });

    await newOrder.save();
    res.json({ success: true, message: "Physical Sale Completed" });

  } catch (error) { res.json({ success: false, message: error.message }) }
};

export { placeOrder, placeOrderStripe, allOrder, userOrders, updateStatus, verifyStripe, cancelOrder, updateTracking, placePhysicalOrder };