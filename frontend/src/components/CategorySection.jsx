import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SkeletonGrid } from "./Skeleton";
import { staggerContainer, fadeUp } from "../utils/animations";
import { CATEGORY_DATA } from "../assets/data";

const CategorySection = ({ categoryName, sectionTitle }) => {
  const { products, isProductsLoading } = useContext(ShopContext);
  const [filterProducts, setFilterProducts] = useState([]);

  useEffect(() => {
    const filtered = products.filter(
      (item) =>
        item.category.toLowerCase().trim() ===
        categoryName.toLowerCase().trim(),
    );
    setFilterProducts(filtered.slice(0, 15));
  }, [products, categoryName]);

  if (!isProductsLoading && filterProducts.length === 0) return null;

  const categoryInfo = CATEGORY_DATA.find(
    (c) => c.name.toLowerCase().trim() === categoryName.toLowerCase().trim(),
  );

  return (
    <div className="my-16">
      <motion.div
        className="text-center py-8 text-3xl"
        {...fadeUp}
        whileInView={fadeUp.animate}
        viewport={{ once: true }}
      >
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 mb-3 max-w-7xl mx-auto px-4 border-b pb-4">
          <div className="flex items-center gap-4">
            {categoryInfo && categoryInfo.image && (
              <img
                src={categoryInfo.image}
                alt={categoryInfo.name}
                className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
              />
            )}
            <Title text1={""} text2={sectionTitle} />
          </div>

          <Link
            to={`/collection?category=${encodeURIComponent(categoryName)}`}
            className="sm:absolute sm:right-4 text-sm font-bold tracking-widest uppercase text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 transition-all flex items-center gap-1"
          >
            View More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
        <p className="w-full text-center mt-2 px-4 max-w-7xl mx-auto text-xs sm:text-sm md:text-base text-surface-500">
          Explore our carefully selected collection of premium automotive
          components.
        </p>
      </motion.div>

      {isProductsLoading ? (
        <SkeletonGrid count={15} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default CategorySection;
