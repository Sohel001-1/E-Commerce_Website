import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [brand, setBrand] = useState([]); // Added brand state to prevent conflict with subCategory
  const [sortType, setSortType] = useState("relavent");

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

  // Dedicated toggle function for the Brand filter
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

    // Apply Brand filter separately using the brand state
    if (brand.length > 0) {
      productsCopy = productsCopy.filter((item) => brand.includes(item.brand));
    }

    setFilterProducts(productsCopy);
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

  // Added 'brand' to the dependency array to trigger updates when brands are selected
  useEffect(() => {
    applyFilter();
  }, [category, subCategory, brand, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter Options */}
      <div className="min-w-60">
        <p onClick={() => setShowFilter(!showFilter)} className="my-2 text-xl flex items-center cursor-pointer gap-2">FILTER</p>
        <img onClick={() => setShowFilter(!showFilter)} className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`} src={assets.dropdown_icon} alt="" />
        
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 rounded-xl py-3 mt-6 ${showFilter ? "" : "hidden"} sm:block`}>
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Engine"} onChange={toggleCategory} /> Engine</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Brake"} onChange={toggleCategory} /> Brakes</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Suspension"} onChange={toggleCategory} /> Suspension</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Ignition"} onChange={toggleCategory} /> Ignition</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Electrical"} onChange={toggleCategory} /> Electrical</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Body"} onChange={toggleCategory} /> Body</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Wheels"} onChange={toggleCategory} /> Wheels</p>
          </div>
        </div>

        {/* Sub Category Filter (TYPE) */}
        <div className={`border border-gray-300 pl-5 rounded-xl py-3 my-5 ${showFilter ? "" : "hidden"} sm:block`}>
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Tires"} onChange={toggleSubCategory} /> Tires</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Brake pads"} onChange={toggleSubCategory} /> Brake pads</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Brake pipes"} onChange={toggleSubCategory} /> Brake pipes</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Master Cylinder"} onChange={toggleSubCategory} /> Master Cylinder</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Caliper repair kit"} onChange={toggleSubCategory} /> Caliper repair kit</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Engine mount"} onChange={toggleSubCategory} /> Engine mount</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Bush"} onChange={toggleSubCategory} /> Bush</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Thermostate"} onChange={toggleSubCategory} /> Thermostate</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Link rod"} onChange={toggleSubCategory} /> Link rod</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Insulator"} onChange={toggleSubCategory} /> Insulator</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Ball"} onChange={toggleSubCategory} /> Ball</p>
          </div>
        </div>

        {/* Brand Filter - Updated to use toggleBrand */}
        <div className={`border border-gray-300 pl-5 rounded-xl py-3 my-5 ${showFilter ? "" : "hidden"} sm:block`}>
          <p className="mb-3 text-sm font-medium">Brand</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"3M"} onChange={toggleBrand} /> 3M</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"555"} onChange={toggleBrand} /> 555</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"AISIN"} onChange={toggleBrand} /> AISIN</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"Autolite"} onChange={toggleBrand} /> Autolite</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"AUTOPROFI"} onChange={toggleBrand} /> AUTOPROFI</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"bluechem"} onChange={toggleBrand} /> bluechem</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"BIZOL"} onChange={toggleBrand} /> BIZOL</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"AbBlue"} onChange={toggleBrand} /> AbBlue</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"AUTOGLYM"} onChange={toggleBrand} /> AUTOGLYM</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"BOSCH"} onChange={toggleBrand} /> BOSCH</p>
            <p className="flex gap-2"><input className="w-3" type="checkbox" value={"CAT"} onChange={toggleBrand} /> CAT</p>
          </div>
        </div>
      </div>

      {/* Product Display Area */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          <select onChange={(e) => setSortType(e.target.value)} className="border-2 border-gray-300 text-sm px-2 rounded-xl">
            <option value="relavent">Sort by : Relavent</option>
            <option value="low-high">Sort by : Low To High</option>
            <option value="high-low">Sort by : High To Low</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((items, index) => (
            <ProductItem key={index} name={items.name} id={items._id} price={items.price} image={items.image} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;