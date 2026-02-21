import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProductItem = ({ id, image, name, price, index = 0 }) => {
  const { currency, wishlist, toggleWishlist, products } = useContext(ShopContext);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const stock = products?.find((p) => p._id === id)?.stock || 0;
  const salePrice = products?.find((p) => p._id === id)?.salePrice || 0;

  useEffect(() => {
    // Check if this product is in wishlist
    if (wishlist && id) {
      const inWishlist = wishlist.some((item) => item._id === id);
      setIsInWishlist(inWishlist);
    }
  }, [wishlist, id]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <div>
      <Link className="group block" to={`/product/${id}`}>
        <div className="relative overflow-hidden aspect-square rounded-2xl bg-surface-100 shadow-card hover:shadow-card-hover transition-all duration-500">
          {!imgLoaded && <div className="absolute inset-0 skeleton-pulse" />}
          <img
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            src={image[0]}
            alt={name}
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Sale Badge */}
          {salePrice > 0 && (
            <div className="absolute top-0 left-0 bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 shadow-md">
              Save: {price - salePrice}{currency}
            </div>
          )}

          {/* Wishlist Heart Button */}
          <motion.button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${isInWishlist
              ? "bg-red-500/90 text-white scale-100"
              : "bg-white/80 text-surface-600 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className="w-5 h-5"
              fill={isInWishlist ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.button>

          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
            <div className="glass rounded-xl px-3 py-2.5 text-center">
              <span className="text-xs font-bold text-brand-500 tracking-wider uppercase">
                View Details
              </span>
            </div>
          </div>
        </div>
        <div className="pt-3 pb-1 flex justify-between items-start">
          <p className="text-sm font-medium text-gray-900 group-hover:text-surface-900 transition-colors line-clamp-2 pr-2">
            {name}
          </p>
          {stock <= 0 ? (
            <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded whitespace-nowrap font-bold">Out of Stock</span>
          ) : stock <= 5 ? (
            <span className="text-[10px] bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded whitespace-nowrap font-bold">Low Stock</span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {salePrice > 0 ? (
            <>
              <p className="text-sm font-bold text-red-600">
                {currency}{salePrice}
              </p>
              <p className="text-xs text-gray-400 line-through">
                {currency}{price}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-black">
              {currency}{price}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;
