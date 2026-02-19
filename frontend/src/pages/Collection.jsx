import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { staggerContainer, fadeUp } from "../utils/animations";
import { SkeletonGrid } from "../components/Skeleton";
import { SlidersHorizontal, Plus, Minus, X, RotateCcw, Filter } from "lucide-react";
import { CATEGORY_DATA } from "../assets/data";
import { subCategories } from "../assets/subCategories";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [countryOfOrigin, setCountryOfOrigin] = useState([]);
  const [countryOfImport, setCountryOfImport] = useState([]);
  const [unitSize, setUnitSize] = useState([]);
  const [sae, setSae] = useState([]);
  const [oilType, setOilType] = useState([]);
  const [api, setApi] = useState([]);
  const [acea, setAcea] = useState([]);
  const [appropriateUse, setAppropriateUse] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
    // Optional: Reset subCategory when category changes? 
    // Usually better to keep selected subcategories if they still apply, 
    // or reset if they don't. For now, let's keep it simple.
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

  const toggleFilter = (value, state, setState) => {
    if (state.includes(value)) {
      setState((prev) => prev.filter((item) => item !== value));
    } else {
      setState((prev) => [...prev, value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category),
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory),
      );
    }


    if (brand.length > 0) {
      productsCopy = productsCopy.filter((item) => brand.includes(item.brand));
    }

    if (countryOfOrigin.length > 0) {
      productsCopy = productsCopy.filter((item) => countryOfOrigin.includes(item.countryOfOrigin));
    }
    if (countryOfImport.length > 0) {
      productsCopy = productsCopy.filter((item) => countryOfImport.includes(item.countryOfImport));
    }
    if (unitSize.length > 0) {
      productsCopy = productsCopy.filter((item) => unitSize.includes(item.unitSize));
    }
    if (sae.length > 0) {
      productsCopy = productsCopy.filter((item) => sae.includes(item.sae));
    }
    if (oilType.length > 0) {
      productsCopy = productsCopy.filter((item) => oilType.includes(item.oilType));
    }
    if (api.length > 0) {
      productsCopy = productsCopy.filter((item) => api.includes(item.api));
    }
    if (acea.length > 0) {
      productsCopy = productsCopy.filter((item) => acea.includes(item.acea));
    }
    if (appropriateUse.length > 0) {
      productsCopy = productsCopy.filter((item) => appropriateUse.includes(item.appropriateUse));
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
  }, [
    category,
    subCategory,
    brand,
    brand,
    countryOfOrigin,
    countryOfImport,
    unitSize,
    sae,
    oilType,
    api,
    acea,
    appropriateUse,
    search,
    showSearch,
    products,
  ]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subCategoryParam = searchParams.get("subCategory");

    if (categoryParam) {
      setCategory([categoryParam]);
    }
    if (subCategoryParam) {
      setSubCategory([subCategoryParam]);
    }
  }, [searchParams]);

  const resetFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setBrand([]);
    setCountryOfOrigin([]);
    setCountryOfImport([]);
    setUnitSize([]);
    setSae([]);
    setOilType([]);
    setApi([]);
    setAcea([]);
    setAppropriateUse([]);
    setSortType("relavent");
    setShowFilter(false);
  };

  // Helper to extract unique values from products for a given key
  const getUniqueData = (data, property) => {
    let newVal = data.map((curElem) => curElem[property]);
    return (newVal = ["All", ...new Set(newVal)]);
  };

  // We only want unique non-empty, non-N/A values
  const getFilterOptions = (key) => {
    const options = [
      ...new Set(
        products
          .map((item) => item[key])
          .filter((val) => val && val !== "N/A" && val !== "")
      ),
    ];
    return options;
  };

  // Placeholder data for categories and brands with images
  // In a real app, these would likely come from an API or a separate data file with real image paths
  const CATEGORY_DATA = [
    { name: "Suspension", image: assets.suspension },
    { name: "Fuel Supply System", image: assets.fuel_supply_system },
    { name: "Filters", image: assets.filters },
    { name: "Damping", image: assets.damping },
    { name: "Wheels", image: assets.wheels },
    { name: "Brakes", image: assets.brakes },
    { name: "Ignition", image: assets.ignition },
    { name: "Gasket and Sealing Rings", image: assets.gasket_and_sealing_rings },
    { name: "Steering", image: assets.steering },
    { name: "Belts, Chains and Rollers", image: assets.belts_chains_and_rollers },
    { name: "Engine", image: assets.engine },
    { name: "Interior", image: assets.interior },
    { name: "Body", image: assets.body },
    { name: "Electrics", image: assets.electrics },
    { name: "Clutch", image: assets.clutch },
    { name: "Oils and Fluids", image: assets.oils_and_fluids },
    { name: "Engine Cooling System", image: assets.engine_cooling_system },
    { name: "Wiper and Washer System", image: assets.wiper_and_washer_system },
    { name: "Exhaust", image: assets.exhaust },
    { name: "Heating and Ventilation", image: assets.heating_and_ventilation },
    { name: "Transmission", image: assets.transmission },
    { name: "Air Conditioning", image: assets.air_conditioning },
    { name: "Bearing", image: assets.bearing },
    { name: "Propshaft and Differentials", image: assets.propshaft_and_differentials },
    { name: "Sensors, Relay and Control Units", image: assets.sensors_relay_and_control_units },
    { name: "Car Accessories", image: assets.car_accessories },
    { name: "Repair Kits", image: assets.repair_kits },
    { name: "Tools and Equipment", image: assets.tools_and_equipment },
    { name: "Pipes and Hoses", image: assets.pipes_and_hoses },
    { name: "Auto Detailing and Care", image: assets.auto_detailing_and_care },
    { name: "Lighting", image: assets.lighting },
    { name: "Tuning", image: assets.tuning },

  ];

  const formatBrandLabel = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const BRAND_DATA = Object.entries(assets.brandAssets).map(
    ([key, image]) => ({
      name: formatBrandLabel(key),
      image,
    }),
  );

  const FilterCheckbox = ({ value, onChange, label, checked }) => (
    <label className="flex items-center gap-3 cursor-pointer group py-0.5">
      <input
        className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 transition-colors cursor-pointer"
        type="checkbox"
        value={value}
        onChange={onChange}
        checked={checked}
      />
      <span className="text-sm text-surface-600 group-hover:text-surface-800 transition-colors">
        {label}
      </span>
    </label>
  );

  const FilterGridItem = ({ value, onChange, label, image, checked }) => (
    <div
      onClick={() => onChange({ target: { value } })}
      className={`flex flex-col items-center justify-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${checked
        ? "border-orange-500 bg-orange-50 shadow-lg"
        : "border-gray-300 hover:border-gray-400 bg-white"
        }`}
    >
      <div className="w-24 h-24 mb-3 flex items-center justify-center">
        <img
          src={image}
          alt={label}
          loading="eager"
          decoding="sync"
          className="w-full h-full object-contain"
          style={{ imageRendering: "-webkit-optimize-contrast" }}
        />
      </div>
      <p
        className={`text-xs font-semibold text-center leading-tight uppercase tracking-wide ${checked ? "text-orange-700" : "text-gray-900"
          }`}
      >
        {label}
      </p>
    </div>
  );

  const CategoryCard = ({ category, isActive, onClick }) => (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${isActive
        ? "border-orange-500 bg-orange-50 shadow-lg"
        : "border-gray-300 hover:border-gray-400 bg-white"
        }`}
    >
      <div className="w-24 h-24 mb-3 flex items-center justify-center">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-contain"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
      </div>
      <p className={`text-xs font-semibold text-center leading-tight uppercase tracking-wide ${isActive ? "text-orange-700" : "text-gray-900"
        }`}>
        {category.name}
      </p>
    </div>
  );

  const FilterSection = ({ title, children, defaultOpen = false, layout = "list" }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="border-b border-surface-200 py-4 last:border-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full group mb-2"
        >
          <span className="text-sm font-bold tracking-wider text-surface-500 uppercase group-hover:text-surface-800 transition-colors">
            {title}
          </span>
          {isOpen ? (
            <Minus className="w-4 h-4 text-surface-400 group-hover:text-surface-600 transition-colors" />
          ) : (
            <Plus className="w-4 h-4 text-surface-400 group-hover:text-surface-600 transition-colors" />
          )}
        </button>
        <div
          className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className={`min-h-0 ${layout === "grid" ? "grid grid-cols-4 gap-2 pt-2" : "flex flex-col gap-2 pt-1"}`}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-10">
      <AnimatePresence>
        {showFilter && (
          <>
            {/* Sidebar Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilter(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[820px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-display font-medium text-surface-900">
                    FILTERS
                  </h2>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-3 py-1.5 border border-brand-200 text-brand-600 rounded text-xs font-bold tracking-wider uppercase hover:bg-brand-50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
                <button
                  onClick={() => setShowFilter(false)}
                  className="p-2 hover:bg-surface-100 rounded-full transition-colors text-surface-500 hover:text-surface-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-transparent">

                <FilterSection title="BRANDS" defaultOpen={false} layout="grid">
                  {BRAND_DATA.map((item) => (
                    <FilterGridItem
                      key={item.name}
                      value={item.name}
                      onChange={toggleBrand}
                      label={item.name}
                      image={item.image}
                      checked={brand.includes(item.name)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="CATEGORY" defaultOpen={false} layout="grid">
                  {CATEGORY_DATA.map((item) => (
                    <CategoryCard
                      key={item.name}
                      category={item}
                      isActive={category.includes(item.name)}
                      onClick={() => toggleCategory({ target: { value: item.name } })}
                    />
                  ))}
                </FilterSection>

                {/* Sub Category Filter - Only show if categories are selected */}
                {category.length > 0 && (
                  <FilterSection title="SUB CATEGORY" defaultOpen={true}>
                    {category.flatMap(cat => subCategories[cat] || []).map((sub, index) => (
                      <FilterCheckbox
                        key={`${sub}-${index}`}
                        value={sub}
                        onChange={toggleSubCategory}
                        label={sub}
                        checked={subCategory.includes(sub)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* New Advanced Filters */}

                {/* 3. Country of Import */}
                {getFilterOptions("countryOfImport").length > 0 && (
                  <FilterSection title="COUNTRY OF IMPORT" defaultOpen={false}>
                    {getFilterOptions("countryOfImport").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, countryOfImport, setCountryOfImport)}
                        label={item}
                        checked={countryOfImport.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* 4. Country of Origin */}
                {getFilterOptions("countryOfOrigin").length > 0 && (
                  <FilterSection title="COUNTRY OF ORIGIN" defaultOpen={false}>
                    {getFilterOptions("countryOfOrigin").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, countryOfOrigin, setCountryOfOrigin)}
                        label={item}
                        checked={countryOfOrigin.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* 5. Unit Size */}
                {getFilterOptions("unitSize").length > 0 && (
                  <FilterSection title="UNIT SIZE" defaultOpen={false}>
                    {getFilterOptions("unitSize").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, unitSize, setUnitSize)}
                        label={item}
                        checked={unitSize.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* 6. SAE */}
                {getFilterOptions("sae").length > 0 && (
                  <FilterSection title="SAE" defaultOpen={false}>
                    {getFilterOptions("sae").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, sae, setSae)}
                        label={item}
                        checked={sae.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* 7. Oil Type */}
                {getFilterOptions("oilType").length > 0 && (
                  <FilterSection title="OIL TYPE" defaultOpen={false}>
                    {getFilterOptions("oilType").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, oilType, setOilType)}
                        label={item}
                        checked={oilType.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* 8. API */}
                {getFilterOptions("api").length > 0 && (
                  <FilterSection title="API" defaultOpen={false}>
                    {getFilterOptions("api").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, api, setApi)}
                        label={item}
                        checked={api.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* 9. ACEA */}
                {getFilterOptions("acea").length > 0 && (
                  <FilterSection title="ACEA" defaultOpen={false}>
                    {getFilterOptions("acea").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, acea, setAcea)}
                        label={item}
                        checked={acea.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* 10. Appropriate Use */}
                {getFilterOptions("appropriateUse").length > 0 && (
                  <FilterSection title="APPROPRIATE USE" defaultOpen={false}>
                    {getFilterOptions("appropriateUse").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() => toggleFilter(item, appropriateUse, setAppropriateUse)}
                        label={item}
                        checked={appropriateUse.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Left Side: Filter Button + Title + Count */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowFilter(true)}
              className="group flex items-center gap-2.5 px-5 py-2.5 bg-white border border-brand-500 rounded text-brand-600 hover:bg-brand-50 transition-all shadow-sm active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wider uppercase text-surface-900 group-hover:text-brand-700">Filters</span>
            </button>

            <div className="flex items-baseline gap-2">
              <Title text1={"ALL"} text2={"COLLECTIONS"} />
              <span className="text-surface-500 text-sm font-medium">
                {filterProducts.length} Displaying
              </span>
            </div>
          </div>

          <select
            onChange={(e) => setSortType(e.target.value)}
            className="input-glass text-sm px-4 py-2.5 w-full sm:w-auto cursor-pointer"
          >
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low To High</option>
            <option value="high-low">Sort by: High To Low</option>
          </select>
        </div>

        {loading ? (
          <SkeletonGrid
            count={8}
            cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          />
        ) : filterProducts.length === 0 ? (
          <motion.div className="text-center py-20" {...fadeUp}>
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-surface-500 text-lg font-medium">
              No products found
            </p>
            <p className="text-surface-400 text-sm mt-2">
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filterProducts.map((items, index) => (
              <ProductItem
                key={index}
                name={items.name}
                id={items._id}
                price={items.price}
                image={items.image}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Collection;
