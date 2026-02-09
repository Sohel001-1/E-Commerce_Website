import React, { useState, useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartCount, navigate, token, logout } =
    useContext(ShopContext);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [visible]);

  const navLinkClass = ({ isActive }) =>
    `relative px-1 py-1 text-sm font-bold tracking-widest transition-all duration-300
     ${isActive ? "text-orange-600" : "text-gray-700 hover:text-orange-600"}
     after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-orange-600 after:transition-transform after:duration-300
     ${isActive ? "after:origin-left after:scale-x-100" : "hover:after:origin-left hover:after:scale-x-100"}`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src={assets.logo}
              className="h-20 w-20"
              alt="Japan Autos"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <NavLink to="/" className={navLinkClass}>HOME</NavLink>
            <NavLink to="/collection" className={navLinkClass}>COLLECTION</NavLink>
            <NavLink to="/about" className={navLinkClass}>ABOUT</NavLink>
            <NavLink to="/contact" className={navLinkClass}>CONTACT</NavLink>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <motion.button
              onClick={() => setShowSearch(true)}
              className="p-2.5 rounded-full text-gray-600 hover:bg-orange-50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img src={assets.search_icon} className="w-5" alt="" />
            </motion.button>

            <div className="relative group">
              <motion.button
                onClick={() => (token ? null : navigate("/login"))}
                className="p-2.5 rounded-full text-gray-600 hover:bg-orange-50 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <img src={assets.profile_icon} className="w-5" alt="" />
              </motion.button>
              {token && (
                <div className="absolute right-0 mt-3 hidden w-48 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/50 p-2 shadow-2xl group-hover:block">
                  <button onClick={() => navigate("/profile")} className="flex w-full px-4 py-2.5 text-sm hover:bg-gray-50 rounded-xl transition-colors">My Profile</button>
                  <button onClick={() => navigate("/orders")} className="flex w-full px-4 py-2.5 text-sm hover:bg-gray-50 rounded-xl transition-colors">Orders</button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={logout} className="flex w-full px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">Logout</button>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative p-2.5 rounded-full text-gray-600 group">
              <motion.img
                src={assets.cart_icon}
                className="w-5"
                alt=""
                whileHover={{ scale: 1.1 }}
              />
              <motion.span
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-white"
                key={getCartCount()}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {getCartCount()}
              </motion.span>
            </Link>

            <motion.button
              onClick={() => setVisible(true)}
              className="md:hidden p-2.5 text-gray-600"
              whileTap={{ scale: 0.9 }}
            >
              <img src={assets.menu_icon} className="w-6" alt="" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {visible && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVisible(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-screen w-[85%] max-w-xs bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
                <span className="text-xl font-bold tracking-tighter text-gray-900 uppercase">Menu</span>
                <motion.button
                  onClick={() => setVisible(false)}
                  className="p-2 rounded-full bg-gray-100"
                  whileTap={{ scale: 0.85 }}
                >
                  <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="Close" />
                </motion.button>
              </div>

              <nav className="flex-1 px-4 py-8 space-y-2 bg-white overflow-y-auto">
                {["HOME", "COLLECTION", "ABOUT", "CONTACT"].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <NavLink
                      onClick={() => setVisible(false)}
                      className={({ isActive }) =>
                        `block px-6 py-4 rounded-2xl text-base font-bold transition-all
                        ${isActive ? "bg-orange-600 text-white shadow-md shadow-orange-200" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`
                      }
                      to={label === "HOME" ? "/" : `/${label.toLowerCase()}`}
                    >
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="p-6 border-t border-gray-100 bg-white">
                {!token ? (
                  <motion.button
                    onClick={() => { setVisible(false); navigate("/login"); }}
                    className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold shadow-xl"
                    whileTap={{ scale: 0.98 }}
                  >
                    Log In
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => { setVisible(false); logout(); }}
                    className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-100"
                    whileTap={{ scale: 0.98 }}
                  >
                    Logout
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
