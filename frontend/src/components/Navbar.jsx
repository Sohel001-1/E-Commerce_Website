import React, { useState, useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartCount, navigate, token, logout } = useContext(ShopContext);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [visible]);

  const navLinkClass = ({ isActive }) =>
    `relative px-1 py-1 text-sm font-bold tracking-widest transition-all duration-300
     ${isActive ? "text-orange-600" : "text-gray-700 hover:text-orange-600"}
     after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-orange-600 after:transition-transform after:duration-300
     ${isActive ? "after:origin-left after:scale-x-100" : "hover:after:origin-left hover:after:scale-x-100"}`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
            <img src={assets.logo} className="h-16 w-auto object-contain" alt="Japan Autos" />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <NavLink to="/" className={navLinkClass}>HOME</NavLink>
            <NavLink to="/collection" className={navLinkClass}>COLLECTION</NavLink>
            <NavLink to="/about" className={navLinkClass}>ABOUT</NavLink>
            <NavLink to="/contact" className={navLinkClass}>CONTACT</NavLink>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={() => setShowSearch(true)} className="p-2.5 rounded-full text-gray-600 hover:bg-orange-50 hover:text-orange-600">
              <img src={assets.search_icon} className="w-5" alt="Search" />
            </button>

            <div className="relative group">
              <button onClick={() => (token ? null : navigate("/login"))} className="p-2.5 rounded-full text-gray-600 hover:bg-orange-50 hover:text-orange-600">
                <img src={assets.profile_icon} className="w-5" alt="Profile" />
              </button>
              {token && (
                <div className="absolute right-0 mt-3 hidden w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl group-hover:block animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => navigate("/profile")} className="flex w-full px-4 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50">My Profile</button>
                  <button onClick={() => navigate("/orders")} className="flex w-full px-4 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50">Orders</button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={logout} className="flex w-full px-4 py-2.5 text-sm font-semibold text-red-500 rounded-xl hover:bg-red-50">Logout</button>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative p-2.5 rounded-full text-gray-600 hover:bg-orange-50 group">
              <img src={assets.cart_icon} className="w-5" alt="Cart" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-white">
                {getCartCount()}
              </span>
            </Link>

            <button onClick={() => setVisible(true)} className="md:hidden p-2.5 text-gray-600">
              <img src={assets.menu_icon} className="w-6" alt="Menu" />
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${visible ? "visible" : "invisible"}`}>
        <div onClick={() => setVisible(false)} className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} />

        <div className={`absolute right-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}>
          
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
            <span className="text-xl font-bold tracking-tighter text-gray-900">MENU</span>
            <button onClick={() => setVisible(false)} className="p-2 rounded-full bg-gray-100">
              <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="Close" />
            </button>
          </div>

          {/* This container pushes the button to the bottom */}
          <nav className="flex-1 px-4 py-6 space-y-2 bg-white overflow-y-auto">
            {["HOME", "COLLECTION", "ABOUT", "CONTACT"].map((label) => (
              <NavLink
                key={label}
                onClick={() => setVisible(false)}
                className={({ isActive }) => 
                  `block px-6 py-4 rounded-2xl text-base font-bold transition-all 
                  ${isActive ? "bg-orange-600 text-white shadow-md" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`
                }
                to={label === "HOME" ? "/" : `/${label.toLowerCase()}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Fixed Bottom Button Section */}
          <div className="p-6 border-t border-gray-100 bg-white mt-auto">
            {!token ? (
              <button 
                onClick={() => { setVisible(false); navigate("/login"); }} 
                className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold shadow-xl active:scale-95 transition-transform"
              >
                Log In
              </button>
            ) : (
              <button 
                onClick={() => { setVisible(false); logout(); }} 
                className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 transition-transform shadow-lg"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;




// import React, { useState, useContext, useEffect } from "react";
// import { assets } from "../assets/assets";
// import { Link, NavLink } from "react-router-dom";
// import { ShopContext } from "../context/ShopContext";

// const Navbar = () => {
//   const [visible, setVisible] = useState(false);
//   const {
//     setShowSearch,
//     getCartCount,
//     navigate,
//     token,
//     logout,
//   } = useContext(ShopContext);

//   // Prevent background scroll when mobile menu is open
//   useEffect(() => {
//     document.body.style.overflow = visible ? "hidden" : "auto";
//     return () => (document.body.style.overflow = "auto");
//   }, [visible]);

//   const navLinkClass = ({ isActive }) =>
//     `relative px-1 py-2 text-sm tracking-wide transition-colors
//      ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}
//      after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-gray-900 after:transition-transform
//      ${isActive ? "after:scale-x-100" : "hover:after:scale-x-100"}`;

//   return (
//     <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
//       <div className="mx-auto max-w-6xl px-4">
//         <div className="flex items-center justify-between py-4">
//           {/* Logo */}
//           <Link to="/" className="flex items-center gap-2">
//            <img src={assets.logo} className="h-20 w-20" alt="Japan Autos" />

//           </Link>

//           {/* Desktop Nav */}
//           <nav className="hidden sm:flex items-center gap-6">
//             <NavLink to="/" className={navLinkClass}>
//               HOME
//             </NavLink>
//             <NavLink to="/collection" className={navLinkClass}>
//               COLLECTION
//             </NavLink>
//             <NavLink to="/about" className={navLinkClass}>
//               ABOUT
//             </NavLink>
//             <NavLink to="/contact" className={navLinkClass}>
//               CONTACT
//             </NavLink>
//           </nav>

//           {/* Actions */}
//           <div className="flex items-center gap-3 sm:gap-4">
//             {/* Search */}
//             <button
//               onClick={() => setShowSearch(true)}
//               className="p-2 rounded-full hover:bg-gray-100 transition"
//               aria-label="Search"
//             >
//               <img src={assets.search_icon} className="w-5" alt="" />
//             </button>

//             {/* Profile */}
//             <div className="relative group">
//               <button
//                 onClick={() => (token ? null : navigate("/login"))}
//                 className="p-2 rounded-full hover:bg-gray-100 transition"
//                 aria-label="Account"
//               >
//                 <img src={assets.profile_icon} className="w-5" alt="" />
//               </button>

//               {token && (
//                 <div className="absolute right-0 mt-2 hidden w-44 overflow-hidden rounded-xl border bg-white shadow-lg group-hover:block">
//                   <div className="p-2 text-sm text-gray-700">
//                     <button
//                       className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50"
//                       onClick={() => navigate("/profile")}
//                     >
//                       My Profile
//                     </button>
//                     <button
//                       className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50"
//                       onClick={() => navigate("/orders")}
//                     >
//                       Orders
//                     </button>
//                     <button
//                       className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-red-600"
//                       onClick={logout}
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Cart */}
//             <Link
//               to="/cart"
//               className="relative p-2 rounded-full hover:bg-gray-100 transition"
//               aria-label="Cart"
//             >
//               <img src={assets.cart_icon} className="w-5" alt="" />
//               <span className="absolute -right-1 -bottom-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-[10px] leading-none">
//                 {getCartCount()}
//               </span>
//             </Link>

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setVisible(true)}
//               className="sm:hidden p-2 rounded-full hover:bg-gray-100 transition"
//               aria-label="Open menu"
//             >
//               <img src={assets.menu_icon} className="w-5" alt="" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Drawer */}
//       <div
//         className={`fixed inset-0 z-50 sm:hidden transition ${
//           visible ? "visible" : "invisible"
//         }`}
//       >
//         {/* Backdrop */}
//         <div
//           onClick={() => setVisible(false)}
//           className={`absolute inset-0 bg-black/30 transition-opacity ${
//             visible ? "opacity-100" : "opacity-0"
//           }`}
//         />

//         {/* Panel */}
//         <div
//           className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl transition-transform ${
//             visible ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           <div className="flex items-center justify-between px-5 py-4 border-b">
//             <p className="font-semibold text-gray-900">Menu</p>
//             <button
//               onClick={() => setVisible(false)}
//               className="p-2 rounded-full hover:bg-gray-100 transition"
//               aria-label="Close menu"
//             >
//               <img
//                 className="h-4 rotate-180"
//                 src={assets.dropdown_icon}
//                 alt=""
//               />
//             </button>
//           </div>

//           <div className="flex flex-col p-3 text-gray-700">
//             <NavLink
//               onClick={() => setVisible(false)}
//               className="px-4 py-3 rounded-lg hover:bg-gray-50"
//               to="/"
//             >
//               HOME
//             </NavLink>
//             <NavLink
//               onClick={() => setVisible(false)}
//               className="px-4 py-3 rounded-lg hover:bg-gray-50"
//               to="/collection"
//             >
//               COLLECTION
//             </NavLink>
//             <NavLink
//               onClick={() => setVisible(false)}
//               className="px-4 py-3 rounded-lg hover:bg-gray-50"
//               to="/about"
//             >
//               ABOUT
//             </NavLink>
//             <NavLink
//               onClick={() => setVisible(false)}
//               className="px-4 py-3 rounded-lg hover:bg-gray-50"
//               to="/contact"
//             >
//               CONTACT
//             </NavLink>

//             <div className="mt-4 border-t pt-4">
//               {!token ? (
//                 <button
//                   onClick={() => {
//                     setVisible(false);
//                     navigate("/login");
//                   }}
//                   className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white hover:opacity-90 transition"
//                 >
//                   Login
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => {
//                     setVisible(false);
//                     logout();
//                   }}
//                   className="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:opacity-90 transition"
//                 >
//                   Logout
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
