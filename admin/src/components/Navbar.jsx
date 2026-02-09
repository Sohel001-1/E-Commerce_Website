import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center justify-between py-2 px-[4%] border-b border-gray-200">
      <img 
        className="w-[max(8%,80px)]" 
        src={assets.logo} 
        alt="Admin Panel Logo" 
      />
      <p className="text-2xl font-medium text-gray-600 sm:text-xl px-5">
        Admin Panel
      </p>
      <button
        onClick={() => setToken("")}
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 rounded-full text-sm transition-all duration-300 hover:bg-gray-700 active:scale-95"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;