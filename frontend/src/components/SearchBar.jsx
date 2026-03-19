import React, { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SUGGESTIONS = 3;

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch, products, navigate } =
    useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const location = useLocation();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setVisible(true); // Always visible
  }, [location]);

  useEffect(() => {
    if (showSearch && visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch, visible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const suggestions = normalizedSearch
    ? Array.from(
        new Set(
          products.flatMap((product) => [
            product.name,
            product.brand,
            product.category,
            product.subCategory,
            product.countryOfOrigin,
            product.countryOfImport,
            product.unitSize,
            product.sae,
            product.oilType,
            product.api,
            product.acea,
            product.appropriateUse,
          ])
        )
      )
        .filter((value) => value && String(value).trim())
        .map((value) => String(value).trim())
        .filter((value) => value.toLowerCase().includes(normalizedSearch))
        .sort((left, right) => {
          const leftValue = left.toLowerCase();
          const rightValue = right.toLowerCase();
          const leftStarts = leftValue.startsWith(normalizedSearch);
          const rightStarts = rightValue.startsWith(normalizedSearch);

          if (leftStarts !== rightStarts) {
            return leftStarts ? -1 : 1;
          }

          return left.localeCompare(right);
        })
        .slice(0, MAX_SUGGESTIONS)
    : [];

  const submitSearch = (value) => {
    const nextSearch = value.trim();
    if (!nextSearch) {
      return;
    }

    setSearch(nextSearch);
    setShowSearch(false);
    setActiveIndex(-1);
    navigate(`/collection?search=${encodeURIComponent(nextSearch)}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(suggestions.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        submitSearch(suggestions[activeIndex]);
        return;
      }

      submitSearch(search);
    }
  };

  useEffect(() => {
    setActiveIndex(-1);
  }, [search, showSearch]);

  return (
    <AnimatePresence>
      {showSearch && visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="overflow-hidden"
        >
          <div className="py-4">
            <div ref={containerRef} className="max-w-xl mx-auto">
              <div className="flex items-center justify-between bg-white rounded-full px-4 py-2 shadow-sm border border-surface-200 focus-within:border-orange-300 focus-within:shadow-glow transition-all duration-300">
                <div className="flex flex-col flex-1 pl-2">
                  <span className="text-[11px] font-bold text-surface-900 mb-0.5">
                    Inventory
                  </span>
                  <input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full outline-none bg-transparent text-sm text-surface-700 placeholder:text-surface-400"
                    type="text"
                    placeholder="Type any keywords"
                  />
                </div>
                <button
                  onClick={() => search ? submitSearch(search) : setShowSearch(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f97316] hover:bg-[#ea580c] transition-colors shrink-0 outline-none"
                >
                  <img
                    className="w-4 opacity-100 brightness-0 invert"
                    src={assets.search_icon}
                    alt="search"
                  />
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => submitSearch(suggestion)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                        index === activeIndex
                          ? "bg-brand-50 text-brand-700"
                          : "text-surface-700 hover:bg-surface-50"
                      }`}
                    >
                      <span>{suggestion}</span>
                      <span className="text-xs uppercase tracking-wider text-surface-400">
                        Match
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
