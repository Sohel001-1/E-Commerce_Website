import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Plus, Minus, X, RotateCcw } from "lucide-react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { SkeletonGrid } from "../components/Skeleton";
import { CATEGORY_DATA } from "../assets/data";
import { subCategories } from "../assets/subCategories";

const collectionResponseCache = new Map();
const collectionPageStateCache = new Map();
const COLLECTION_RESTORE_STORAGE_KEY = "collection-return-state";

const arraysEqual = (left, right) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);
const normalizeValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const createInitialCollectionState = (searchParams, cachedState) => {
  if (cachedState) {
    return cachedState;
  }

  const categoryParam = searchParams.get("category");
  const subCategoryParam = searchParams.get("subCategory");

  return {
    showFilter: false,
    filterProducts: [],
    category: categoryParam ? [categoryParam] : [],
    subCategory: subCategoryParam ? [subCategoryParam] : [],
    brand: [],
    countryOfOrigin: [],
    countryOfImport: [],
    unitSize: [],
    sae: [],
    oilType: [],
    api: [],
    acea: [],
    appropriateUse: [],
    sortType: "relavent",
    loading: true,
    loadingMore: false,
    page: 1,
    hasMore: false,
    totalProducts: 0,
    unitSizeSearch: "",
    brandData: [],
    debouncedSearch: "",
  };
};

const matchesSelectedValues = (itemValue, selectedValues) => {
  if (selectedValues.length === 0) {
    return true;
  }

  const normalizedItemValue = normalizeValue(itemValue);
  return selectedValues.some(
    (selectedValue) => normalizeValue(selectedValue) === normalizedItemValue,
  );
};

const FILTER_KEYS = [
  "brand",
  "countryOfOrigin",
  "countryOfImport",
  "unitSize",
  "sae",
  "oilType",
  "api",
  "acea",
  "appropriateUse",
];

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
    className={`flex flex-col items-center justify-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
      checked
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
      className={`text-xs font-semibold text-center leading-tight uppercase tracking-wide ${
        checked ? "text-orange-700" : "text-gray-900"
      }`}
    >
      {label}
    </p>
  </div>
);

const CategoryCard = ({ category, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
      isActive
        ? "border-orange-500 bg-orange-50 shadow-lg"
        : "border-gray-300 hover:border-gray-400 bg-white"
    }`}
  >
    <div className="w-24 h-24 mb-3 flex items-center justify-center">
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-contain"
        style={{ imageRendering: "-webkit-optimize-contrast" }}
      />
    </div>
    <p
      className={`text-xs font-semibold text-center leading-tight uppercase tracking-wide ${
        isActive ? "text-orange-700" : "text-gray-900"
      }`}
    >
      {category.name}
    </p>
  </div>
);

const FilterSection = ({
  title,
  children,
  defaultOpen = false,
  layout = "list",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-surface-200 py-4 last:border-0">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
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
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div
          className={`min-h-0 ${
            layout === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2"
              : "flex flex-col gap-2 pt-1"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const Collection = () => {
  const { backendUrl, search, setSearch, showSearch, products } =
    useContext(ShopContext);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateCacheKey = `${location.pathname}${location.search}`;
  const restorePayloadRef = useRef(null);
  const initialStateRef = useRef(null);

  if (restorePayloadRef.current === null) {
    try {
      const rawRestorePayload = sessionStorage.getItem(
        COLLECTION_RESTORE_STORAGE_KEY,
      );
      restorePayloadRef.current = rawRestorePayload
        ? JSON.parse(rawRestorePayload)
        : false;
    } catch {
      restorePayloadRef.current = false;
    }
  }

  const shouldRestore =
    restorePayloadRef.current &&
    restorePayloadRef.current.path === stateCacheKey;

  if (!initialStateRef.current) {
    const cachedState = shouldRestore
      ? collectionPageStateCache.get(stateCacheKey)
      : null;
    initialStateRef.current = createInitialCollectionState(
      searchParams,
      cachedState,
    );
  }

  const initialState = initialStateRef.current;
  const [showFilter, setShowFilter] = useState(initialState.showFilter);
  const [filterProducts, setFilterProducts] = useState(
    initialState.filterProducts,
  );
  const [category, setCategory] = useState(initialState.category);
  const [subCategory, setSubCategory] = useState(initialState.subCategory);
  const [brand, setBrand] = useState(initialState.brand);
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    initialState.countryOfOrigin,
  );
  const [countryOfImport, setCountryOfImport] = useState(
    initialState.countryOfImport,
  );
  const [unitSize, setUnitSize] = useState(initialState.unitSize);
  const [sae, setSae] = useState(initialState.sae);
  const [oilType, setOilType] = useState(initialState.oilType);
  const [api, setApi] = useState(initialState.api);
  const [acea, setAcea] = useState(initialState.acea);
  const [appropriateUse, setAppropriateUse] = useState(
    initialState.appropriateUse,
  );
  const [sortType, setSortType] = useState(initialState.sortType);
  const [loading, setLoading] = useState(initialState.loading);
  const [loadingMore, setLoadingMore] = useState(initialState.loadingMore);
  const [page, setPage] = useState(initialState.page);
  const [hasMore, setHasMore] = useState(initialState.hasMore);
  const [totalProducts, setTotalProducts] = useState(
    initialState.totalProducts,
  );
  const [unitSizeSearch, setUnitSizeSearch] = useState(
    initialState.unitSizeSearch,
  );
  const [brandData, setBrandData] = useState(initialState.brandData);
  const [debouncedSearch, setDebouncedSearch] = useState(
    initialState.debouncedSearch,
  );
  const loaderRef = useRef(null);
  const requestIdRef = useRef(0);
  const isRestoringRef = useRef(Boolean(shouldRestore));
  const categoryParam = searchParams.get("category") || "";
  const subCategoryParam = searchParams.get("subCategory") || "";
  const searchParam = searchParams.get("search") || "";

  useEffect(() => {
    if (!shouldRestore) {
      const frameId = window.requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });

      sessionStorage.removeItem(COLLECTION_RESTORE_STORAGE_KEY);

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const savedScrollY = restorePayloadRef.current?.scrollY ?? 0;
    let attempts = 0;
    let frameId = 0;

    const restoreScroll = () => {
      const maxScrollY =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
        ) - window.innerHeight;

      window.scrollTo(0, Math.min(savedScrollY, Math.max(0, maxScrollY)));

      if (savedScrollY > maxScrollY && attempts < 20) {
        attempts += 1;
        frameId = window.requestAnimationFrame(restoreScroll);
      }
    };

    frameId = window.requestAnimationFrame(restoreScroll);
    sessionStorage.removeItem(COLLECTION_RESTORE_STORAGE_KEY);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldRestore]);

  useEffect(() => {
    collectionPageStateCache.set(stateCacheKey, {
      showFilter,
      filterProducts,
      category,
      subCategory,
      brand,
      countryOfOrigin,
      countryOfImport,
      unitSize,
      sae,
      oilType,
      api,
      acea,
      appropriateUse,
      sortType,
      loading,
      loadingMore,
      page,
      hasMore,
      totalProducts,
      unitSizeSearch,
      brandData,
      debouncedSearch,
    });
  }, [
    stateCacheKey,
    showFilter,
    filterProducts,
    category,
    subCategory,
    brand,
    countryOfOrigin,
    countryOfImport,
    unitSize,
    sae,
    oilType,
    api,
    acea,
    appropriateUse,
    sortType,
    loading,
    loadingMore,
    page,
    hasMore,
    totalProducts,
    unitSizeSearch,
    brandData,
    debouncedSearch,
  ]);

  useEffect(() => {
    // Only update global search state when the URL search parameter changes
    // or when the search bar visibility changes
    setSearch(searchParam || "");
  }, [searchParam, showSearch, setSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(
        searchParam.trim() || (showSearch ? search.trim() : ""),
      );
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search, showSearch, searchParam]);

  useEffect(() => {
    if (isRestoringRef.current) {
      return;
    }

    const nextCategory = categoryParam ? [categoryParam] : [];
    const nextSubCategory = subCategoryParam ? [subCategoryParam] : [];

    setCategory((prev) =>
      arraysEqual(prev, nextCategory) ? prev : nextCategory,
    );
    setSubCategory((prev) =>
      arraysEqual(prev, nextSubCategory) ? prev : nextSubCategory,
    );
  }, [categoryParam, subCategoryParam]);

  useEffect(() => {
    if (!showFilter || brandData.length > 0) {
      return;
    }

    let isMounted = true;

    import("../assets/brandAssets").then(({ brandAssets }) => {
      if (!isMounted) {
        return;
      }

      const nextBrandData = Object.entries(brandAssets).map(([key, image]) => ({
        name: key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        image,
      }));

      setBrandData(nextBrandData);
    });

    return () => {
      isMounted = false;
    };
  }, [showFilter, brandData.length]);

  const toggleArrayValue = (value, state, setState) => {
    if (state.includes(value)) {
      setState((prev) => prev.filter((item) => item !== value));
      return;
    }

    setState((prev) => [...prev, value]);
  };

  const toggleCategory = (e) => {
    toggleArrayValue(e.target.value, category, setCategory);
  };

  const toggleSubCategory = (e) => {
    toggleArrayValue(e.target.value, subCategory, setSubCategory);
  };

  const toggleBrand = (e) => {
    toggleArrayValue(e.target.value, brand, setBrand);
  };

  const buildCollectionParams = (pageToLoad) => {
    const params = {
      page: pageToLoad,
      limit: 24,
    };

    if (category.length > 0) params.category = category.join(",");
    if (subCategory.length > 0) params.subCategory = subCategory.join(",");
    if (brand.length > 0) params.brand = brand.join(",");
    if (countryOfOrigin.length > 0)
      params.countryOfOrigin = countryOfOrigin.join(",");
    if (countryOfImport.length > 0)
      params.countryOfImport = countryOfImport.join(",");
    if (unitSize.length > 0) params.unitSize = unitSize.join(",");
    if (sae.length > 0) params.sae = sae.join(",");
    if (oilType.length > 0) params.oilType = oilType.join(",");
    if (api.length > 0) params.api = api.join(",");
    if (acea.length > 0) params.acea = acea.join(",");
    if (appropriateUse.length > 0)
      params.appropriateUse = appropriateUse.join(",");
    if (debouncedSearch) params.search = debouncedSearch;
    if (sortType !== "relavent") params.sort = sortType;

    return params;
  };

  const getCollectionCacheKey = (pageToLoad) =>
    JSON.stringify(buildCollectionParams(pageToLoad));

  const fetchCollectionPage = async (pageToLoad, replaceResults) => {
    const requestId = ++requestIdRef.current;
    const cacheKey = getCollectionCacheKey(pageToLoad);

    if (replaceResults && collectionResponseCache.has(cacheKey)) {
      const cached = collectionResponseCache.get(cacheKey);
      setFilterProducts(cached.products);
      setTotalProducts(cached.totalProducts);
      setHasMore(cached.hasMore);
      setLoading(false);
    }

    if (replaceResults) {
      if (!collectionResponseCache.has(cacheKey)) {
        setLoading(true);
      }
    } else {
      setLoadingMore(true);
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/product/collection`, {
        params: buildCollectionParams(pageToLoad),
      });

      if (!data.success || requestId !== requestIdRef.current) {
        return;
      }

      collectionResponseCache.set(cacheKey, {
        products: data.products,
        totalProducts: data.pagination?.totalProducts || 0,
        hasMore: Boolean(data.pagination?.hasMore),
      });

      setFilterProducts((prev) =>
        replaceResults ? data.products : [...prev, ...data.products],
      );
      setTotalProducts(data.pagination?.totalProducts || 0);
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (error) {
      if (requestId === requestIdRef.current) {
        const fallbackProducts = applyClientFallbackFilters();
        setFilterProducts(fallbackProducts);
        setTotalProducts(fallbackProducts.length);
        setHasMore(false);
      }
      console.error("Failed to load collection products", error);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (isRestoringRef.current) {
      return;
    }

    setFilterProducts([]);
    setHasMore(false);
    setTotalProducts(0);
    const fallbackProducts = applyClientFallbackFilters();
    setFilterProducts(fallbackProducts);
    setTotalProducts(fallbackProducts.length);
    setLoading(fallbackProducts.length === 0);

    if (page !== 1) {
      setPage(1);
    }

    fetchCollectionPage(1, true);
  }, [
    backendUrl,
    debouncedSearch,
    sortType,
    category,
    subCategory,
    brand,
    countryOfOrigin,
    countryOfImport,
    unitSize,
    sae,
    oilType,
    api,
    acea,
    appropriateUse,
  ]);

  useEffect(() => {
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    if (page === 1) {
      return;
    }

    fetchCollectionPage(page, false);
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [target] = entries;
        if (target.isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore]);

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

  const applyClientFallbackFilters = () => {
    let productsCopy = products.slice();

    if (debouncedSearch) {
      const searchTerms = debouncedSearch
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      productsCopy = productsCopy.filter((item) => {
        const itemName = String(item.name || "").toLowerCase();
        return searchTerms.every((term) => itemName.includes(term));
      });
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.category, category),
      );
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.subCategory, subCategory),
      );
    }
    if (brand.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.brand, brand),
      );
    }
    if (countryOfOrigin.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.countryOfOrigin, countryOfOrigin),
      );
    }
    if (countryOfImport.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.countryOfImport, countryOfImport),
      );
    }
    if (unitSize.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.unitSize, unitSize),
      );
    }
    if (sae.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.sae, sae),
      );
    }
    if (oilType.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.oilType, oilType),
      );
    }
    if (api.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.api, api),
      );
    }
    if (acea.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.acea, acea),
      );
    }
    if (appropriateUse.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        matchesSelectedValues(item.appropriateUse, appropriateUse),
      );
    }

    if (sortType === "low-high") {
      productsCopy.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      productsCopy.sort((a, b) => b.price - a.price);
    }

    return productsCopy.slice(0, 24);
  };

  const getFilterOptions = (key) => {
    const options = [
      ...new Set(
        products
          .map((item) => item[key])
          .filter((value) => value && value !== "N/A" && value !== ""),
      ),
    ];

    return options.sort((a, b) => String(a).localeCompare(String(b)));
  };

  const getSubCategoryOptions = () => {
    if (category.length === 0) {
      return [];
    }

    const dynamicOptions = [
      ...new Set(
        products
          .filter((item) => matchesSelectedValues(item.category, category))
          .map((item) => String(item.subCategory || "").trim())
          .filter(Boolean),
      ),
    ].sort((left, right) => left.localeCompare(right));

    if (dynamicOptions.length > 0) {
      return dynamicOptions;
    }

    return category.flatMap((cat) => subCategories[cat] || []);
  };

  return (
    <div className="pt-10">
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilter(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full max-w-[820px] bg-white z-50 shadow-2xl flex flex-col"
            >
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

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-transparent">
                <FilterSection title="BRANDS" defaultOpen={false} layout="grid">
                  {brandData.length > 0
                    ? brandData
                        .filter((item) =>
                          getFilterOptions("brand").includes(item.name),
                        )
                        .map((item) => (
                          <FilterGridItem
                            key={item.name}
                            value={item.name}
                            onChange={toggleBrand}
                            label={item.name}
                            image={item.image}
                            checked={brand.includes(item.name)}
                          />
                        ))
                    : getFilterOptions("brand").map((item) => (
                        <FilterCheckbox
                          key={item}
                          value={item}
                          onChange={() =>
                            toggleArrayValue(item, brand, setBrand)
                          }
                          label={item}
                          checked={brand.includes(item)}
                        />
                      ))}
                </FilterSection>

                <FilterSection
                  title="CATEGORY"
                  defaultOpen={false}
                  layout="grid"
                >
                  {CATEGORY_DATA.map((item) => (
                    <CategoryCard
                      key={item.name}
                      category={item}
                      isActive={category.includes(item.name)}
                      onClick={() =>
                        toggleCategory({ target: { value: item.name } })
                      }
                    />
                  ))}
                </FilterSection>

                {category.length > 0 && (
                  <FilterSection title="SUB CATEGORY" defaultOpen={true}>
                    {getSubCategoryOptions().map((sub, index) => (
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

                {getFilterOptions("countryOfImport").length > 0 && (
                  <FilterSection title="COUNTRY OF IMPORT" defaultOpen={false}>
                    {getFilterOptions("countryOfImport").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() =>
                          toggleArrayValue(
                            item,
                            countryOfImport,
                            setCountryOfImport,
                          )
                        }
                        label={item}
                        checked={countryOfImport.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {getFilterOptions("countryOfOrigin").length > 0 && (
                  <FilterSection title="COUNTRY OF ORIGIN" defaultOpen={false}>
                    {getFilterOptions("countryOfOrigin").map((item) => (
                      <FilterCheckbox
                        key={item}
                        value={item}
                        onChange={() =>
                          toggleArrayValue(
                            item,
                            countryOfOrigin,
                            setCountryOfOrigin,
                          )
                        }
                        label={item}
                        checked={countryOfOrigin.includes(item)}
                      />
                    ))}
                  </FilterSection>
                )}

                {getFilterOptions("unitSize").length > 0 && (
                  <FilterSection title="UNIT SIZE" defaultOpen={false}>
                    <div className="px-2 pb-2">
                      <input
                        type="text"
                        placeholder="Search size..."
                        value={unitSizeSearch}
                        onChange={(e) => setUnitSizeSearch(e.target.value)}
                        className="w-full border border-surface-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto w-full px-2 scrollbar-thin scrollbar-thumb-surface-300">
                      {getFilterOptions("unitSize")
                        .filter((item) =>
                          item
                            .toLowerCase()
                            .includes(unitSizeSearch.toLowerCase()),
                        )
                        .map((item) => (
                          <FilterCheckbox
                            key={item}
                            value={item}
                            onChange={() =>
                              toggleArrayValue(item, unitSize, setUnitSize)
                            }
                            label={item}
                            checked={unitSize.includes(item)}
                          />
                        ))}
                    </div>
                  </FilterSection>
                )}

                {FILTER_KEYS.filter(
                  (key) =>
                    ![
                      "brand",
                      "countryOfOrigin",
                      "countryOfImport",
                      "unitSize",
                    ].includes(key),
                )
                  .map((key) => ({
                    key,
                    label: key.replace(/([A-Z])/g, " $1").toUpperCase(),
                    state:
                      key === "sae"
                        ? sae
                        : key === "oilType"
                          ? oilType
                          : key === "api"
                            ? api
                            : key === "acea"
                              ? acea
                              : appropriateUse,
                    setState:
                      key === "sae"
                        ? setSae
                        : key === "oilType"
                          ? setOilType
                          : key === "api"
                            ? setApi
                            : key === "acea"
                              ? setAcea
                              : setAppropriateUse,
                  }))
                  .filter(({ key }) => getFilterOptions(key).length > 0)
                  .map(({ key, label, state, setState }) => (
                    <FilterSection key={key} title={label} defaultOpen={false}>
                      {getFilterOptions(key).map((item) => (
                        <FilterCheckbox
                          key={item}
                          value={item}
                          onChange={() =>
                            toggleArrayValue(item, state, setState)
                          }
                          label={item}
                          checked={state.includes(item)}
                        />
                      ))}
                    </FilterSection>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <button
              onClick={() => setShowFilter(true)}
              className="group flex items-center gap-2.5 px-5 py-2.5 bg-white border border-brand-500 rounded text-brand-600 hover:bg-brand-50 transition-all shadow-sm active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wider uppercase text-surface-900 group-hover:text-brand-700">
                Filters
              </span>
            </button>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Title text1={"ALL"} text2={"COLLECTIONS"} />
              <span className="text-surface-500 text-sm font-medium">
                {totalProducts} Displaying
              </span>
            </div>
          </div>

          <select
            value={sortType}
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
          <div className="text-center py-20">
            <p className="text-surface-500 text-lg font-medium">
              No products found
            </p>
            <p className="text-surface-400 text-sm mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
              {filterProducts.map((item, index) => (
                <ProductItem
                  key={`${item._id}-${index}`}
                  id={item._id}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  stock={item.stock}
                  salePrice={item.salePrice}
                  index={index}
                />
              ))}
            </div>

            {hasMore && (
              <div
                ref={loaderRef}
                className="flex justify-center mt-10 mb-8 py-4"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            )}

            {!hasMore && loadingMore && (
              <div className="flex justify-center mt-10 mb-8 py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;
