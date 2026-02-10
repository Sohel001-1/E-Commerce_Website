import React, { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const inputRef = useRef(null);

  useEffect(() => {
    if (location.pathname.includes("collection")) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  useEffect(() => {
    if (showSearch && visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch, visible]);

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
            <div className="flex items-center gap-3 max-w-xl mx-auto glass-card rounded-2xl px-5 py-3 focus-within:border-orange-300 focus-within:shadow-glow transition-all duration-300">
              <img className="w-4 opacity-40" src={assets.search_icon} alt="search" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none bg-transparent text-sm text-surface-700 placeholder:text-surface-400"
                type="text"
                placeholder="Search for parts, brands, categories..."
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-surface-400 hover:text-surface-600 transition-colors"
                >
                  <img className="w-3" src={assets.cross_icon} alt="clear" />
                </button>
              )}
              <button
                onClick={() => setShowSearch(false)}
                className="p-1.5 rounded-full hover:bg-surface-100 transition-colors"
              >
                <img className="w-3 opacity-50" src={assets.cross_icon} alt="close" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
