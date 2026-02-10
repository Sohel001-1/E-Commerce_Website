import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "৳", delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(false);

 const addToCart = async (itemId) => {
  toast.success("Product Added to cart.");

  let cartData = structuredClone(cartItems);

  // ✅ cartData[itemId] is now a number (quantity)
  if (cartData[itemId]) {
    cartData[itemId] += 1;
  } else {
    cartData[itemId] = 1;
  }

  setCartItems(cartData);

  if (token) {
    try {
      await axios.post(
        backendUrl + "/api/cart/add",
        { itemId }, // ✅ no size
        { headers: { token } }
      );
    } catch (error) {
      toast.error(error.message);
    }
  }
};

const getProfileData = async () => {
  try {
    const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } });
    if (data.success) {
      setUserData(data.userData);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
};


 const getCartCount = () => {
  let totalCount = 0;

  for (const itemId in cartItems) {
    const qty = cartItems[itemId];

    if (typeof qty === "number") {
      totalCount += qty;
    } else if (qty && typeof qty === "object") {
      // backward compatible if old data exists
      totalCount += Object.values(qty).reduce((a, b) => a + b, 0);
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

  const updateQuantity = async (itemId, quantity) => {
  let cartData = structuredClone(cartItems);

  if (quantity <= 0) {
    delete cartData[itemId];
  } else {
    cartData[itemId] = quantity;
  }

  setCartItems(cartData);

  if (token) {
    try {
      await axios.post(
        backendUrl + "/api/cart/update",
        { itemId, quantity }, // ✅ no size
        { headers: { token } }
      );
    } catch (error) {
      toast.error(error.message);
    }
  }
};

const getCartAmount = () => {
  let totalAmount = 0;

  for (const itemId in cartItems) {
    const product = products.find((p) => p._id === itemId);
    if (!product) continue;

    const qty = cartItems[itemId];

    const count =
      typeof qty === "number"
        ? qty
        : qty && typeof qty === "object"
        ? Object.values(qty).reduce((a, b) => a + b, 0)
        : 0;

    totalAmount += product.price * count;
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
  navigate, backendUrl, setToken, token, logout, 
  userData, setUserData, getProfileData // <--- ADD THESE
}

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;