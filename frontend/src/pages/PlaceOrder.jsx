import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeUp, slideLeft, slideRight } from "../utils/animations";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Please login to place an order.");

    try {
      let orderItems = [];

      for (const itemId in cartItems) {
        const qty = cartItems[itemId];
        if (qty > 0) {
          const itemInfo = structuredClone(
            products.find((p) => p._id === itemId),
          );
          if (itemInfo) {
            itemInfo.quantity = qty;
            orderItems.push(itemInfo);
          }
        }
      }

      if (orderItems.length === 0) {
        return toast.error("Your cart is empty.");
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      switch (method) {
        case "cod": {
          const res = await axios.post(
            `${backendUrl}/api/order/place`,
            orderData,
            {
              headers: { token },
            },
          );
          if (res.data.success) {
            setCartItems({});
            navigate("/orders");
          } else toast.error(res.data.message);
          break;
        }

        case "stripe": {
          const resStripe = await axios.post(
            `${backendUrl}/api/order/stripe`,
            orderData,
            {
              headers: { token },
            },
          );
          if (resStripe.data.success)
            window.location.replace(resStripe.data.session_url);
          else toast.error(resStripe.data.message);
          break;
        }

        default:
          break;
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh]"
    >
      <motion.div className="flex flex-col gap-4 w-full sm:max-w-[480px]" {...slideLeft}>
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="input-glass"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="input-glass"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="input-glass"
          type="email"
          placeholder="Email"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="input-glass"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="input-glass"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="input-glass"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="input-glass"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="input-glass"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="input-glass"
          type="number"
          placeholder="Phone"
        />
      </motion.div>

      <motion.div className="mt-8 sm:mt-0" {...slideRight}>
        <div className="glass-card p-8 rounded-3xl">
          <CartTotal />
        </div>

        <div className="mt-8">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="flex gap-3 flex-col lg:flex-row mt-4">
            <motion.div
              onClick={() => setMethod("stripe")}
              className={`flex items-center gap-3 glass-card p-4 cursor-pointer transition-all duration-300 ${
                method === "stripe" ? "border-brand-500 shadow-glow" : "hover:border-surface-300"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-4 h-4 border-2 rounded-full transition-colors ${
                  method === "stripe" ? "bg-brand-500 border-brand-500" : "border-surface-300"
                }`}
              />
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </motion.div>
            <motion.div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 glass-card p-4 cursor-pointer transition-all duration-300 ${
                method === "cod" ? "border-brand-500 shadow-glow" : "hover:border-surface-300"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-4 h-4 border-2 rounded-full transition-colors ${
                  method === "cod" ? "bg-brand-500 border-brand-500" : "border-surface-300"
                }`}
              />
              <p className="text-surface-500 text-sm font-semibold mx-4 uppercase">
                Cash on delivery
              </p>
            </motion.div>
          </div>
          <div className="w-full text-end mt-8">
            <motion.button
              type="submit"
              className="btn-primary btn-shimmer text-sm px-12 py-3 uppercase"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Place Order
            </motion.button>
          </div>
        </div>
      </motion.div>
    </form>
  );
};
export default PlaceOrder;
