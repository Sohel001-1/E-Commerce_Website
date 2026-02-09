import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity } =
    useContext(ShopContext);
  const navigate = useNavigate();

  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];

      // cartItems = { [productId]: quantity }
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

  // ✅ Clear whole cart (cancel cart)
  const clearCart = () => {
    if (!window.confirm("Clear all items from cart?")) return;

    cartData.forEach((item) => {
      updateQuantity(item._id, 0);
    });
  };

  return (
    <div className="border-t pt-14">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>

        {/* ✅ Cancel cart / clear all */}
        <button
          onClick={clearCart}
          className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
          disabled={cartData.length === 0}
        >
          CLEAR CART
        </button>
      </div>

      <div>
        {cartData.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">
              Explore our collection to find amazing auto parts
            </p>
          </div>
        ) : (
          cartData.map((item, index) => {
            const productData = products.find(
              (product) => product._id === item._id,
            );

            return (
              <div
                key={index}
                className="py-4 border-t border-b text-gray-600 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              >
                <div className="flex items-start gap-6">
                  <img
                    className="w-16 sm:w-20"
                    src={productData?.image?.[0]}
                    alt={productData?.name}
                  />
                  <div>
                    <p className="text-xs sm:text-lg font-medium">
                      {productData?.name}
                    </p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>
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
                  className="border border-gray-300 max-w-10 sm:max-w-20 px-2 sm:px-3 py-1 text-center rounded focus:outline-none focus:border-gray-600"
                  type="number"
                  min={1}
                  value={item.quantity}
                />

                {/* ✅ Remove (cancel this item) */}
                <img
                  onClick={() => updateQuantity(item._id, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
                  src={assets.bin_icon}
                  alt="Delete"
                />
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end flex justify-end gap-3">
            <button
              onClick={() => navigate("/collection")}
              className="border border-gray-300 text-sm my-8 px-8 py-3 uppercase hover:bg-gray-50 transition"
            >
              CONTINUE SHOPPING
            </button>

            <button
              onClick={() => navigate("/place-order")}
              className="bg-black text-white text-sm my-8 px-8 py-3 uppercase hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={cartData.length === 0}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
