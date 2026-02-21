import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import { SkeletonProductDetail } from "../components/Skeleton";
import { motion } from "framer-motion";
import { fadeUp, slideLeft, slideRight } from "../utils/animations";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const {
    products,
    currency,
    addToCart,
    wishlist,
    toggleWishlist,
    navigate,
    token,
    setIsCartOpen,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const fetchProductData = () => {
    const found = products.find((item) => item._id === productId);
    if (found) {
      setProductData(found);
      setImage(found.image?.[0] || "");
    }
  };

  useEffect(() => {
    fetchProductData();
    setImgLoaded(false);
  }, [productId, products]);

  useEffect(() => {
    // Check if product is in wishlist
    if (productId && wishlist) {
      const inWishlist = wishlist.some((item) => item._id === productId);
      setIsInWishlist(inWishlist);
    }
  }, [productId, wishlist]);

  const handleAddToCart = () => {
    if (!productData) return;
    addToCart(productData._id);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = async () => {
    if (!productData) return;
    await toggleWishlist(productData._id);
  };

  const handleOrderNow = () => {
    if (!token) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }
    if (!productData) return;

    // Add to cart and navigate to checkout
    addToCart(productData._id);
    setTimeout(() => {
      navigate("/place-order");
    }, 300);
  };

  if (!productData) return <SkeletonProductDetail />;

  return (
    <div className="pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-8 lg:gap-14 flex-col sm:flex-row">
        <motion.div
          className="flex-1 flex flex-col-reverse gap-3 sm:flex-row"
          {...slideLeft}
        >
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full gap-2">
            {productData.image?.map((item, index) => (
              <motion.img
                key={index}
                onClick={() => {
                  setImage(item);
                  setImgLoaded(false);
                }}
                src={item}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-xl border-2 transition-all duration-300 object-cover ${image === item
                  ? "border-brand-500 shadow-glow"
                  : "border-transparent hover:border-surface-200"
                  }`}
                alt={`${productData.name} ${index + 1}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%] relative">
            {!imgLoaded && (
              <div className="absolute inset-0 rounded-2xl skeleton-pulse" />
            )}
            {image ? (
              <motion.img
                className={`w-full h-auto rounded-2xl shadow-card transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                src={image}
                alt={productData.name}
                onLoad={() => setImgLoaded(true)}
                layoutId={`product-${productId}`}
              />
            ) : (
              <div className="w-full aspect-square bg-surface-100 rounded-2xl" />
            )}
          </div>
        </motion.div>

        <motion.div className="flex-1" {...slideRight}>
          <h1 className="font-display font-bold text-2xl lg:text-3xl mt-2 text-surface-900">
            {productData.name}
          </h1>

          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {productData.salePrice > 0 ? (
                <>
                  <span className="text-4xl font-bold text-red-600">{currency}{productData.salePrice}</span>
                  <span className="text-2xl font-bold text-gray-400 line-through flex items-center">{currency}{productData.price}</span>
                  <span className="bg-purple-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">Save: {productData.price - productData.salePrice}{currency}</span>
                </>
              ) : (
                <span className="text-4xl font-bold text-surface-900">{currency}{productData.price}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {productData.stock <= 0 ? (
                <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold border border-red-200">Out of Stock</span>
              ) : productData.stock <= 5 ? (
                <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold border border-yellow-300">Low Stock: {productData.stock} left</span>
              ) : (
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold border border-green-200">In Stock</span>
              )}
            </div>
          </div>

          <p className="mt-5 text-surface-500 md:w-4/5 leading-relaxed">
            {productData.description}
          </p>

          <div className="flex gap-3 mt-8">
            <motion.button
              onClick={handleAddToCart}
              disabled={productData.stock <= 0}
              className={`btn-primary btn-shimmer text-sm tracking-wider uppercase flex-1 ${productData.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={productData.stock > 0 ? { scale: 1.03 } : {}}
              whileTap={productData.stock > 0 ? { scale: 0.97 } : {}}
            >
              {productData.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </motion.button>

            <motion.button
              onClick={handleToggleWishlist}
              className={`px-5 py-3 rounded-lg border-2 transition-all ${isInWishlist
                ? "bg-red-50 border-red-500 text-red-500 hover:bg-red-100"
                : "bg-white border-surface-300 text-surface-600 hover:border-red-500 hover:text-red-500"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                className="w-6 h-6"
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

          <motion.button
            onClick={handleOrderNow}
            disabled={productData.stock <= 0}
            className={`w-full mt-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 text-sm font-bold tracking-wider uppercase rounded-lg shadow-lg ${productData.stock <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all'}`}
            whileHover={productData.stock > 0 ? { scale: 1.02 } : {}}
            whileTap={productData.stock > 0 ? { scale: 0.98 } : {}}
          >
            {productData.stock <= 0 ? "UNAVAILABLE" : "🚀 ORDER NOW"}
          </motion.button>

          <hr className="mt-8 sm:w-4/5 border-surface-200" />

          <div className="mt-8">
            <h3 className="text-lg font-bold text-surface-900 mb-4">Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm sm:w-4/5">
              {productData.brand && productData.brand !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">Brand</span>
                  <span className="font-medium text-surface-900">{productData.brand}</span>
                </div>
              )}
              {productData.unitSize && productData.unitSize !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">Unit Size</span>
                  <span className="font-medium text-surface-900">{productData.unitSize}</span>
                </div>
              )}
              {productData.sae && productData.sae !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">SAE Viscosity</span>
                  <span className="font-medium text-surface-900">{productData.sae}</span>
                </div>
              )}
              {productData.oilType && productData.oilType !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">Oil Type</span>
                  <span className="font-medium text-surface-900">{productData.oilType}</span>
                </div>
              )}
              {productData.api && productData.api !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">API Standard</span>
                  <span className="font-medium text-surface-900">{productData.api}</span>
                </div>
              )}
              {productData.acea && productData.acea !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">ACEA Standard</span>
                  <span className="font-medium text-surface-900">{productData.acea}</span>
                </div>
              )}
              {productData.appropriateUse && productData.appropriateUse !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">Appropriate Use</span>
                  <span className="font-medium text-surface-900">{productData.appropriateUse}</span>
                </div>
              )}
              {productData.countryOfOrigin && productData.countryOfOrigin !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">Origin</span>
                  <span className="font-medium text-surface-900">{productData.countryOfOrigin}</span>
                </div>
              )}
              {productData.countryOfImport && productData.countryOfImport !== "N/A" && (
                <div className="flex justify-between border-b border-surface-100 py-1">
                  <span className="text-surface-500">Imported From</span>
                  <span className="font-medium text-surface-900">{productData.countryOfImport}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-surface-400 mt-5 flex flex-col gap-2">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Quality checked parts.
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Cash on delivery may be available.
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Easy return and exchange policy within 7 days.
            </p>
          </div>
        </motion.div>
      </div>

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;
