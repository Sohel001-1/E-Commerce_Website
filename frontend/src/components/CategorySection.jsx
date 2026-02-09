import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";
import { motion } from "framer-motion";

const CategorySection = ({ categoryName, sectionTitle }) => {
  const { products } = useContext(ShopContext);
  const [filterProducts, setFilterProducts] = useState([]);

  useEffect(() => {
    const filtered = products.filter(
      (item) =>
        item.category.toLowerCase().trim() ===
        categoryName.toLowerCase().trim(),
    );
    setFilterProducts(filtered.slice(0, 5));
  }, [products, categoryName]);

  if (filterProducts.length === 0) return null;

  return (
    <div className="my-10">
      <motion.div
        className="text-center py-8 text-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Title text1={sectionTitle} text2={""} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore our carefully selected collection of premium automotive
          components.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {filterProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
