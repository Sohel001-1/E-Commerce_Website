import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import { SkeletonProductDetail } from "../components/Skeleton";
import { motion } from "framer-motion";
import { fadeUp, slideLeft, slideRight } from "../utils/animations";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);

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

  const handleAddToCart = () => {
    if (!productData) return;
    addToCart(productData._id);
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
                onClick={() => { setImage(item); setImgLoaded(false); }}
                src={item}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-xl border-2 transition-all duration-300 object-cover ${
                  image === item ? "border-brand-500 shadow-glow" : "border-transparent hover:border-surface-200"
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
                className={`w-full h-auto rounded-2xl shadow-card transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
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
          <h1 className="font-display font-bold text-2xl lg:text-3xl mt-2 text-surface-900">{productData.name}</h1>

          <p className="mt-5 text-3xl font-bold text-surface-900">
            {currency}
            {productData.price}
          </p>

          <p className="mt-5 text-surface-500 md:w-4/5 leading-relaxed">
            {productData.description}
          </p>

          <motion.button
            onClick={handleAddToCart}
            className="btn-primary btn-shimmer mt-8 text-sm tracking-wider uppercase"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ADD TO CART
          </motion.button>

          <hr className="mt-8 sm:w-4/5 border-surface-200" />

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
