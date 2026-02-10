import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile"; // 1. Import the Profile page
import Navbar from "./components/Navbar";
import ShopContextProvider from "./context/ShopContext";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchBar from "./components/SearchBar";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ShopContextProvider>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer position="bottom-right" autoClose={2000} />
        <Navbar />
        <SearchBar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/collection" element={<PageTransition><Collection /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/product/:productId" element={<PageTransition><Product /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/place-order" element={<PageTransition><PlaceOrder /></PageTransition>} />
            <Route path="/orders" element={<PageTransition><Orders /></PageTransition>} />
            
            {/* 2. Added the Profile Route with PageTransition */}
            <Route 
              path="/profile" 
              element={
                <PageTransition>
                  <Profile />
                </PageTransition>
              } 
            />
            
          </Routes>
        </AnimatePresence>
        <Footer />
      </div>
    </ShopContextProvider>
  );
};

export default App;