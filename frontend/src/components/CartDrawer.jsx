
import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";
import { assets } from "../assets/assets";

const CartDrawer = () => {
    const { isCartOpen, setIsCartOpen, cartItems, products, currency, updateQuantity, getCartAmount, navigate } =
        useContext(ShopContext);

    const totalAmount = getCartAmount();
    const cartData = [];

    // Process cart items similar to Cart.jsx
    for (const itemId in cartItems) {
        const product = products.find((p) => p._id === itemId);
        if (!product) continue;

        const qty = cartItems[itemId];
        const count = typeof qty === "number" ? qty : 0;

        if (count > 0) {
            cartData.push({
                _id: itemId,
                quantity: count,
                ...product,
            });
        }
    }

    return (
        <AnimatePresence>
            {isCartOpen && (
                <div className="relative z-[100]">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-screen w-[85%] sm:w-[400px] bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <img
                                    src={assets.cross_icon || assets.dropdown_icon} // Fallback if cross_icon missing
                                    className={`w-5 h-5 ${!assets.cross_icon && "rotate-180"}`}
                                    alt="Close"
                                />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cartData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        <img src={assets.cart_icon} className="w-8 h-8 opacity-50" alt="" />
                                    </div>
                                    <p className="text-gray-500">Your cart is empty</p>
                                    <button
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            navigate("/collection");
                                        }}
                                        className="text-orange-600 font-semibold hover:text-orange-700"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                cartData.map((item) => (
                                    <div key={item._id} className="flex gap-4">
                                        <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg p-2">
                                            <img
                                                src={item.image[0]}
                                                alt={item.name}
                                                className="w-full h-full object-contain mix-blend-multiply"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {currency}{item.price}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => updateQuantity(item._id, 0)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cartData.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-white space-y-4">
                                <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                                    <span>Subtotal</span>
                                    <span>{currency}{totalAmount}</span>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Shipping and taxes calculated at checkout.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            navigate("/place-order");
                                        }}
                                        className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Checkout Now
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            navigate("/cart");
                                        }}
                                        className="w-full py-3.5 bg-white text-gray-900 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        View Cart
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
