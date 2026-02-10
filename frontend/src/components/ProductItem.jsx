import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerItem } from "../utils/animations";

const ProductItem = ({ id, image, name, price, index = 0 }) => {
  const { currency } = useContext(ShopContext);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link className="group block" to={`/product/${id}`}>
        <div className="relative overflow-hidden aspect-square rounded-2xl bg-surface-100 shadow-card hover:shadow-card-hover transition-all duration-500">
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton-pulse" />
          )}
          <img
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={image[0]}
            alt={name}
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
            <div className="glass rounded-xl px-3 py-2.5 text-center">
              <span className="text-xs font-bold text-brand-500 tracking-wider uppercase">View Details</span>
            </div>
          </div>
        </div>
        <div className="pt-3 pb-1">
          <p className="text-sm font-medium text-surface-700 group-hover:text-surface-900 transition-colors line-clamp-2">{name}</p>
        </div>
        <p className="text-sm font-bold text-surface-900">
          {currency}{price}
        </p>
      </Link>
    </motion.div>
  );
};

export default ProductItem;
