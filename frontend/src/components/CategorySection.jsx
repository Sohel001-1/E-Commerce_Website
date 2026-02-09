// frontend/src/components/CategorySection.jsx
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";

const CategorySection = ({ categoryName, sectionTitle }) => {
  const { products } = useContext(ShopContext);
  const [filterProducts, setFilterProducts] = useState([]);

  useEffect(() => {
    // Filtering based on exact string match from MongoDB
    // We use .toLowerCase() to ensure the filter is robust against case differences
    const filtered = products.filter(
      (item) =>
        item.category.toLowerCase().trim() ===
        categoryName.toLowerCase().trim(),
    );
    setFilterProducts(filtered.slice(0, 5)); // Matches your 5-column desktop grid
  }, [products, categoryName]);

  if (filterProducts.length === 0) return null;

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={sectionTitle} text2={""} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore our carefully selected collection of premium automotive
          components.
        </p>
      </div>

      {/* Existing Responsive Grid Pattern */}
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
