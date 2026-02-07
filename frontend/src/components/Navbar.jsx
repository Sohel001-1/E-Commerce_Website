import React, { useState, useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    logout,
  } = useContext(ShopContext);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [visible]);

  const navLinkClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm tracking-wide transition-colors
     ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}
     after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-gray-900 after:transition-transform
     ${isActive ? "after:scale-x-100" : "hover:after:scale-x-100"}`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
           <img src={assets.logo} className="h-20 w-20" alt="Japan Autos" />

          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass}>
              HOME
            </NavLink>
            <NavLink to="/collection" className={navLinkClass}>
              COLLECTION
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              ABOUT
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              CONTACT
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Search"
            >
              <img src={assets.search_icon} className="w-5" alt="" />
            </button>

            {/* Profile */}
            <div className="relative group">
              <button
                onClick={() => (token ? null : navigate("/login"))}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Account"
              >
                <img src={assets.profile_icon} className="w-5" alt="" />
              </button>

              {token && (
                <div className="absolute right-0 mt-2 hidden w-44 overflow-hidden rounded-xl border bg-white shadow-lg group-hover:block">
                  <div className="p-2 text-sm text-gray-700">
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50"
                      onClick={() => navigate("/profile")}
                    >
                      My Profile
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50"
                      onClick={() => navigate("/orders")}
                    >
                      Orders
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-red-600"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Cart"
            >
              <img src={assets.cart_icon} className="w-5" alt="" />
              <span className="absolute -right-1 -bottom-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-[10px] leading-none">
                {getCartCount()}
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setVisible(true)}
              className="sm:hidden p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Open menu"
            >
              <img src={assets.menu_icon} className="w-5" alt="" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 sm:hidden transition ${
          visible ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setVisible(false)}
          className={`absolute inset-0 bg-black/30 transition-opacity ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl transition-transform ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <p className="font-semibold text-gray-900">Menu</p>
            <button
              onClick={() => setVisible(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Close menu"
            >
              <img
                className="h-4 rotate-180"
                src={assets.dropdown_icon}
                alt=""
              />
            </button>
          </div>

          <div className="flex flex-col p-3 text-gray-700">
            <NavLink
              onClick={() => setVisible(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-50"
              to="/"
            >
              HOME
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-50"
              to="/collection"
            >
              COLLECTION
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-50"
              to="/about"
            >
              ABOUT
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-50"
              to="/contact"
            >
              CONTACT
            </NavLink>

            <div className="mt-4 border-t pt-4">
              {!token ? (
                <button
                  onClick={() => {
                    setVisible(false);
                    navigate("/login");
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white hover:opacity-90 transition"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={() => {
                    setVisible(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:opacity-90 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
