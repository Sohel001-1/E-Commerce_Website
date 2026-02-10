import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "../utils/animations";
import { SkeletonGrid } from "../components/Skeleton";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [loading, setLoading] = useState(true);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleBrand = (e) => {
    if (brand.includes(e.target.value)) {
      setBrand((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setBrand((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    if (brand.length > 0) {
      productsCopy = productsCopy.filter((item) => brand.includes(item.brand));
    }

    setFilterProducts(productsCopy);
    setLoading(false);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, brand, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const FilterCheckbox = ({ value, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer group py-0.5">
      <input
        className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 transition-colors cursor-pointer"
        type="checkbox"
        value={value}
        onChange={onChange}
      />
      <span className="text-sm text-surface-600 group-hover:text-surface-800 transition-colors">{label}</span>
    </label>
  );

  const FilterSection = ({ title, children }) => (
    <div className={`glass-card p-5 rounded-2xl ${showFilter ? "" : "hidden"} sm:block`}>
      <p className="mb-3 text-xs font-bold tracking-wider text-surface-500 uppercase">{title}</p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 pt-10">
      <div className="min-w-60 space-y-4">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 text-xl font-display font-bold text-surface-800 sm:pointer-events-none"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden transition-transform duration-300 ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </button>

        <FilterSection title="CATEGORIES">
          <FilterCheckbox value="Engine" onChange={toggleCategory} label="Engine" />
          <FilterCheckbox value="Brake" onChange={toggleCategory} label="Brakes" />
          <FilterCheckbox value="Suspension" onChange={toggleCategory} label="Suspension" />
          <FilterCheckbox value="Ignition" onChange={toggleCategory} label="Ignition" />
          <FilterCheckbox value="Electrical" onChange={toggleCategory} label="Electrical" />
          <FilterCheckbox value="Body" onChange={toggleCategory} label="Body" />
          <FilterCheckbox value="Wheels" onChange={toggleCategory} label="Wheels" />
        </FilterSection>

        <FilterSection title="TYPE">
          <FilterCheckbox value="Tires" onChange={toggleSubCategory} label="Tires" />
          <FilterCheckbox value="Brake pads" onChange={toggleSubCategory} label="Brake pads" />
          <FilterCheckbox value="Brake pipes" onChange={toggleSubCategory} label="Brake pipes" />
          <FilterCheckbox value="Master Cylinder" onChange={toggleSubCategory} label="Master Cylinder" />
          <FilterCheckbox value="Caliper repair kit" onChange={toggleSubCategory} label="Caliper repair kit" />
          <FilterCheckbox value="Engine mount" onChange={toggleSubCategory} label="Engine mount" />
          <FilterCheckbox value="Bush" onChange={toggleSubCategory} label="Bush" />
          <FilterCheckbox value="Thermostate" onChange={toggleSubCategory} label="Thermostate" />
          <FilterCheckbox value="Link rod" onChange={toggleSubCategory} label="Link rod" />
          <FilterCheckbox value="Insulator" onChange={toggleSubCategory} label="Insulator" />
          <FilterCheckbox value="Ball" onChange={toggleSubCategory} label="Ball" />
        </FilterSection>

        <FilterSection title="BRAND">
          <FilterCheckbox value="3M" onChange={toggleBrand} label="3M" />
          <FilterCheckbox value="555" onChange={toggleBrand} label="555" />
          <FilterCheckbox value="AISIN" onChange={toggleBrand} label="AISIN" />
          <FilterCheckbox value="Autolite" onChange={toggleBrand} label="Autolite" />
          <FilterCheckbox value="AUTOPROFI" onChange={toggleBrand} label="AUTOPROFI" />
          <FilterCheckbox value="bluechem" onChange={toggleBrand} label="bluechem" />
          <FilterCheckbox value="BIZOL" onChange={toggleBrand} label="BIZOL" />
          <FilterCheckbox value="AbBlue" onChange={toggleBrand} label="AbBlue" />
          <FilterCheckbox value="AUTOGLYM" onChange={toggleBrand} label="AUTOGLYM" />
          <FilterCheckbox value="BOSCH" onChange={toggleBrand} label="BOSCH" />
          <FilterCheckbox value="CAT" onChange={toggleBrand} label="CAT" />
        </FilterSection>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center text-base sm:text-2xl mb-6">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="input-glass text-sm px-4 py-2.5 w-auto cursor-pointer"
          >
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low To High</option>
            <option value="high-low">Sort by: High To Low</option>
          </select>
        </div>

        {loading ? (
          <SkeletonGrid count={8} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : filterProducts.length === 0 ? (
          <motion.div
            className="text-center py-20"
            {...fadeUp}
          >
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-surface-500 text-lg font-medium">No products found</p>
            <p className="text-surface-400 text-sm mt-2">Try adjusting your filters or search terms</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {filterProducts.map((items, index) => (
              <ProductItem key={index} name={items.name} id={items._id} price={items.price} image={items.image} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Collection;
