import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$", delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) { toast.error("Select Product Size !"); return; }
    toast.success("Product Added to cart.");
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) cartData[itemId][size] += 1;
      else cartData[itemId][size] = 1;
    } else { cartData[itemId] = {}; cartData[itemId][size] = 1; }
    setCartItems(cartData);
    if (token) {
      try { await axios.post(backendUrl + "/api/cart/add", { itemId, size }, { headers: { token } }) }
      catch (error) { toast.error(error.message) }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try { if (cartItems[items][item] > 0) totalCount += cartItems[items][item] } catch (e) {}
      }
    }
    return totalCount;
  };

  const getProductsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/product/list");
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (error) { toast.error(error.message) }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    if (token) {
      try { await axios.post(backendUrl + "/api/cart/update", { itemId, size, quantity }, { headers: { token } }) }
      catch (error) { toast.error(error.message) }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((p) => p._id === items);
      for (const item in cartItems[items]) {
        try { if (cartItems[items][item] > 0) totalAmount += itemInfo.price * cartItems[items][item] } catch (e) {}
      }
    }
    return totalAmount;
  };

  const getUserCart = async (token) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/cart/get", {}, { headers: { token } });
      if (data.success) setCartItems(data.cartData);
    } catch (error) { toast.error(error.message) }
  };

  const logout = () => {
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  useEffect(() => { getProductsData() }, []);
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
  }, []);

  const value = {
    products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch,
    cartItems, addToCart, setCartItems, getCartCount, updateQuantity, getCartAmount,
    navigate, backendUrl, setToken, token, logout 
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;