import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import ShopContextProvider from "./context/ShopContext";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchBar from "./components/SearchBar";
import CartDrawer from "./components/CartDrawer";

const Home = lazy(() => import("./pages/Home"));
const Collection = lazy(() => import("./pages/Collection"));
const Categories = lazy(() => import("./pages/Categories"));
const SubCategories = lazy(() => import("./pages/SubCategories"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const PlaceOrder = lazy(() => import("./pages/PlaceOrder"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const Addresses = lazy(() => import("./pages/Addresses"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Account = lazy(() => import("./pages/Account"));

const RouteFallback = () => (
  <div className="py-16">
    <div className="h-12 w-48 rounded-xl skeleton-pulse mb-8" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="aspect-[3/4] rounded-2xl skeleton-pulse" />
      ))}
    </div>
  </div>
);

const App = () => {
  const location = useLocation();

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== "/collection") {
      const frameId = window.requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    return undefined;
  }, [location.pathname, location.search]);

  return (
    <ShopContextProvider>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer position="bottom-right" autoClose={2000} />
        <Navbar />
        <SearchBar />
        <CartDrawer />
        <AnimatePresence mode="wait">
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageTransition>
                    <Home />
                  </PageTransition>
                }
              />
              <Route
                path="/collection"
                element={
                  <PageTransition>
                    <Collection />
                  </PageTransition>
                }
              />
              <Route
                path="/category"
                element={
                  <PageTransition>
                    <Categories />
                  </PageTransition>
                }
              />
              <Route
                path="/category/:categoryName"
                element={
                  <PageTransition>
                    <SubCategories />
                  </PageTransition>
                }
              />
              <Route
                path="/about"
                element={
                  <PageTransition>
                    <About />
                  </PageTransition>
                }
              />
              <Route
                path="/contact"
                element={
                  <PageTransition>
                    <Contact />
                  </PageTransition>
                }
              />
              <Route
                path="/product/:productId"
                element={
                  <PageTransition>
                    <Product />
                  </PageTransition>
                }
              />
              <Route
                path="/cart"
                element={
                  <PageTransition>
                    <Cart />
                  </PageTransition>
                }
              />
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <Login />
                  </PageTransition>
                }
              />
              <Route
                path="/place-order"
                element={
                  <PageTransition>
                    <PlaceOrder />
                  </PageTransition>
                }
              />
              <Route
                path="/orders"
                element={
                  <PageTransition>
                    <Orders />
                  </PageTransition>
                }
              />
              <Route
                path="/profile"
                element={
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                }
              />
              <Route
                path="/addresses"
                element={
                  <PageTransition>
                    <Addresses />
                  </PageTransition>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <PageTransition>
                    <Wishlist />
                  </PageTransition>
                }
              />
              <Route
                path="/account"
                element={
                  <PageTransition>
                    <Account />
                  </PageTransition>
                }
              />
            </Routes>
          </Suspense>
        </AnimatePresence>
        <Footer />
      </div>
    </ShopContextProvider>
  );
};

export default App;
