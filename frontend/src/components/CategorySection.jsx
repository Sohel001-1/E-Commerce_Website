import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";
import { motion } from "framer-motion";
import { SkeletonGrid } from "./Skeleton";
import { staggerContainer, fadeUp } from "../utils/animations";

const CategorySection = ({ categoryName, sectionTitle }) => {
  const { products } = useContext(ShopContext);
  const [filterProducts, setFilterProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(
        (item) =>
          item.category.toLowerCase().trim() ===
          categoryName.toLowerCase().trim(),
      );
      setFilterProducts(filtered.slice(0, 5));
      setLoading(false);
    }
  }, [products, categoryName]);

  if (!loading && filterProducts.length === 0) return null;

  return (
    <div className="my-16">
      <motion.div
        className="text-center py-8 text-3xl"
        {...fadeUp}
        whileInView={fadeUp.animate}
        viewport={{ once: true }}
      >
        <Title text1={sectionTitle} text2={""} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-surface-500 mt-2">
          Explore our carefully selected collection of premium automotive
          components.
        </p>
      </motion.div>

      {loading ? (
        <SkeletonGrid count={5} />
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CategorySection;
