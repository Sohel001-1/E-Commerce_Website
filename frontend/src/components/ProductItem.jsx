import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link className="group block" to={`/product/${id}`}>
        <div className="relative overflow-hidden aspect-square rounded-2xl bg-gray-100 shadow-md hover:shadow-xl transition-all duration-500">
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            src={image[0]}
            alt={name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <div className="bg-white/80 backdrop-blur-md rounded-xl px-3 py-2 border border-white/40 shadow-lg">
              <span className="text-xs font-semibold text-orange-600">View Details</span>
            </div>
          </div>
        </div>
        <div className="pt-3 pb-1">
          <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-2">{name}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {currency}{price}
        </p>
      </Link>
    </motion.div>
  );
};

export default ProductItem;
