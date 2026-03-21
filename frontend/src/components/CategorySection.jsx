import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SkeletonGrid } from "./Skeleton";
import { staggerContainer, fadeUp } from "../utils/animations";
import { CATEGORY_DATA } from "../assets/data";

const SECTION_PRODUCT_LIMIT = 8;

const CategorySection = ({ categoryName, sectionTitle }) => {
  const { backendUrl } = useContext(ShopContext);
  const [filterProducts, setFilterProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || shouldLoad) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setShouldLoad(true);
        observer.disconnect();
      },
      {
        rootMargin: "300px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || hasLoaded || !backendUrl) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchSectionProducts = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/collection`, {
          params: {
            category: categoryName,
            limit: SECTION_PRODUCT_LIMIT,
          },
        });

        if (!isMounted || !data.success) {
          return;
        }

        setFilterProducts(data.products || []);
        setTotalProducts(data.pagination?.totalProducts || 0);
        setHasLoaded(true);
      } catch (error) {
        console.error(`Failed to load ${categoryName} section`, error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSectionProducts();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, categoryName, hasLoaded, shouldLoad]);

  const categoryInfo = CATEGORY_DATA.find(
    (c) => c.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
  );

  if (hasLoaded && !loading && filterProducts.length === 0) {
    return null;
  }

  return (
    <div ref={sectionRef} className="my-16">
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
            <Title text1={""} text2={`${sectionTitle} (${totalProducts})`} />
          </div>

          <Link 
            to={`/collection?category=${encodeURIComponent(categoryName)}`}
            className="sm:absolute sm:right-4 text-sm font-bold tracking-widest uppercase text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 transition-all flex items-center gap-1"
          >
            View More
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        <p className="w-full text-center mt-2 px-4 max-w-7xl mx-auto text-xs sm:text-sm md:text-base text-surface-500">
          Explore our carefully selected collection of premium automotive components.
        </p>
      </motion.div>

      {!shouldLoad ? (
        <div className="rounded-3xl border border-surface-200/70 bg-white/60 px-6 py-10 shadow-sm">
          <div className="h-4 w-40 rounded-full skeleton-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl skeleton-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : loading ? (
        <SkeletonGrid count={SECTION_PRODUCT_LIMIT} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4" />
      ) : (
        <>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6"
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
                stock={item.stock}
                salePrice={item.salePrice}
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
