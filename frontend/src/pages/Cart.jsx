import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, fadeUp } from "../utils/animations";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity } =
    useContext(ShopContext);
  const navigate = useNavigate();

  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];

      for (const itemId in cartItems) {
        const qty = cartItems[itemId];
        if (qty > 0) {
          tempData.push({
            _id: itemId,
            quantity: qty,
          });
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, products]);

  const clearCart = () => {
    if (!window.confirm("Clear all items from cart?")) return;

    cartData.forEach((item) => {
      updateQuantity(item._id, 0);
    });
  };

  return (
    <div className="pt-14">
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>

        <motion.button
          onClick={clearCart}
          className="btn-secondary text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={cartData.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          CLEAR CART
        </motion.button>
      </div>

      <div>
        {cartData.length === 0 ? (
          <motion.div className="py-20 text-center" {...fadeUp}>
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-surface-500 text-lg font-display font-semibold">Your cart is empty</p>
            <p className="text-surface-400 text-sm mt-2">
              Explore our collection to find amazing auto parts
            </p>
            <motion.button
              onClick={() => navigate("/collection")}
              className="btn-primary mt-6"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Browse Collection
            </motion.button>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <AnimatePresence>
              {cartData.map((item, index) => {
                const productData = products.find(
                  (product) => product._id === item._id,
                );

                return (
                  <motion.div
                    key={item._id}
                    variants={staggerItem}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                    className="py-4 border-b border-surface-100 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
                  >
                    <div className="flex items-start gap-4 sm:gap-6">
                      <img
                        className="w-16 sm:w-20 rounded-xl object-cover shadow-card"
                        src={productData?.image?.[0]}
                        alt={productData?.name}
                      />
                      <div>
                        <p className="text-xs sm:text-base font-display font-semibold text-surface-800">
                          {productData?.name}
                        </p>
                        <div className="flex items-center gap-5 mt-2">
                          <p className="text-brand-500 font-bold">
                            {currency}
                            {productData?.price}
                          </p>
                        </div>
                      </div>
                    </div>

                    <input
                      onChange={(e) =>
                        e.target.value === ""
                          ? null
                          : updateQuantity(item._id, Number(e.target.value))
                      }
                      className="input-glass max-w-10 sm:max-w-20 px-2 sm:px-3 py-2 text-center text-sm"
                      type="number"
                      min={1}
                      value={item.quantity}
                    />

                    <motion.img
                      onClick={() => updateQuantity(item._id, 0)}
                      className="w-4 mr-4 sm:w-5 cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                      src={assets.bin_icon}
                      alt="Delete"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {cartData.length > 0 && (
        <motion.div className="flex justify-end my-16" {...fadeUp}>
          <div className="w-full sm:w-[450px] glass-card p-8 rounded-3xl">
            <CartTotal />
            <div className="w-full flex justify-end gap-3 mt-8">
              <motion.button
                onClick={() => navigate("/collection")}
                className="btn-secondary text-sm px-6 py-3 uppercase"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Shopping
              </motion.button>

              <motion.button
                onClick={() => navigate("/place-order")}
                className="btn-primary btn-shimmer text-sm px-6 py-3 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cartData.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Checkout
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;
