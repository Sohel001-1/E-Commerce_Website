import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SkeletonGrid } from "./Skeleton";
import { staggerContainer, fadeUp } from "../utils/animations";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      const bestProduct = products.filter((item) => item.bestseller);
      setBestSeller(bestProduct.slice(0, 15));
      setLoading(false);
    }
  }, [products]);

  return (
    <div className="my-16">
      <motion.div
        className="text-center text-3xl py-8"
        {...fadeUp}
        whileInView={fadeUp.animate}
        viewport={{ once: true }}
      >
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 mb-3 max-w-7xl mx-auto px-4 border-b pb-4">
          <div className="flex items-center gap-4">
            <Title text1={""} text2={"BEST-SELLERS"} />
          </div>

          <Link 
            to={`/collection`}
            className="sm:absolute sm:right-4 text-sm font-bold tracking-widest uppercase text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 transition-all flex items-center gap-1"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        <p className="w-full text-center mt-2 px-4 max-w-7xl mx-auto text-xs sm:text-sm md:text-base text-surface-500">
          Premium auto parts selected for reliability and performance.
        </p>
      </motion.div>
      {loading ? (
        <SkeletonGrid count={15} />
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {bestSeller.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              name={item.name}
              image={item.image}
              price={item.price}
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};
export default BestSeller;
