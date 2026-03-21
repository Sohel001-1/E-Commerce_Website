import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const COLLECTION_RESTORE_STORAGE_KEY = "collection-return-state";

const ProductItem = ({ id, image, name, price, stock: propStock, salePrice: propSalePrice, index = 0 }) => {
  const { currency, wishlist, toggleWishlist, products, addToCart, setIsCartOpen, cartItems } = useContext(ShopContext);
  const location = useLocation();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const stock = propStock !== undefined ? propStock : (products?.find((p) => p._id === id)?.stock || 0);
  const salePrice = propSalePrice !== undefined ? propSalePrice : (products?.find((p) => p._id === id)?.salePrice || 0);
  const isInCart = cartItems ? !!cartItems[id] : false;

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

  const handleProductOpen = () => {
    const currentPath = `${location.pathname}${location.search}`;

    if (!location.pathname.startsWith("/collection")) {
      sessionStorage.removeItem(COLLECTION_RESTORE_STORAGE_KEY);
      return;
    }

    sessionStorage.setItem(
      COLLECTION_RESTORE_STORAGE_KEY,
      JSON.stringify({
        path: currentPath,
        scrollY: window.scrollY,
      })
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0) {
      return;
    }

    if (isInCart) {
      setIsCartOpen(true);
      return;
    }

    addToCart(id);
    setIsCartOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Link
        className="flex flex-col flex-grow group"
        to={`/product/${id}`}
        onClick={handleProductOpen}
        state={{
          returnTo: {
            pathname: location.pathname,
            search: location.search,
            scrollY: window.scrollY,
          },
        }}
      >
        <div className="relative overflow-hidden aspect-square rounded-2xl bg-surface-100 shadow-card hover:shadow-card-hover transition-all duration-500">
          {!imgLoaded && <div className="absolute inset-0 skeleton-pulse" />}
          <img
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            src={image[0]}
            alt={name}
            loading="lazy"
            decoding="async"
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

        </div>
        <div className="pt-3 pb-1 flex-grow flex justify-between items-start">
          <p className="text-sm font-medium text-gray-900 group-hover:text-surface-900 transition-colors pr-2">
            {name}
          </p>
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
      
      <div className="mt-4 pb-2">
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={`w-full py-2.5 rounded text-sm font-bold tracking-wider uppercase transition-colors ${
            stock <= 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-[#e87a27] hover:bg-[#d66b1e] text-white shadow-md'
          }`}
        >
          {stock <= 0 ? 'Out of Stock' : isInCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
