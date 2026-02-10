import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { motion } from "framer-motion";
import { SkeletonGrid } from "./Skeleton";
import { staggerContainer, fadeUp } from "../utils/animations";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      const bestProduct = products.filter((item) => item.bestseller);
      setBestSeller(bestProduct.slice(0, 5));
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
        <Title text1={"BEST"} text2={"SELLERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-surface-500 mt-2">
          Premium auto parts selected for reliability and performance.
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
