import { createContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "৳",
    delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const cartModificationRef = useRef(0); // Track local modifications to prevent stale server updates

  const addToCart = async (itemId) => {
    toast.success("Product Added to cart.");

    // Update modification timestamp
    cartModificationRef.current = Date.now();

    setCartItems((prevCart) => {
      const cartData = structuredClone(prevCart);
      if (cartData[itemId]) {
        cartData[itemId] += 1;
      } else {
        cartData[itemId] = 1;
      }
      return cartData;
    });

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId },
          { headers: { token } },
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getWishlistData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/wishlist", {
        headers: { token },
      });
      if (data.success) {
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    console.log("Wishlist Data:", wishlist);
  }, [wishlist]);

  const toggleWishlist = async (productId) => {
    if (!token) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/toggle-wishlist",
        { productId },
        { headers: { token } },
      );

      if (data.success) {
        // Update local wishlist state
        const isInWishlist = wishlist.some((item) => item._id === productId);

        if (isInWishlist) {
          setWishlist(wishlist.filter((item) => item._id !== productId));
          toast.success("Removed from wishlist");
        } else {
          // Find product and add to wishlist
          const product = products.find((p) => p._id === productId);
          if (product) {
            setWishlist([...wishlist, product]);
          }
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
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
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    // Update modification timestamp
    cartModificationRef.current = Date.now();

    setCartItems((prevCart) => {
      const cartData = structuredClone(prevCart);
      if (quantity <= 0) {
        delete cartData[itemId];
      } else {
        cartData[itemId] = quantity;
      }
      return cartData;
    });

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, quantity },
          { headers: { token } },
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
    const requestStartTime = Date.now();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } },
      );
      if (data.success) {
        // Only update if no local modifications happened since the request started
        if (cartModificationRef.current < requestStartTime) {
          setCartItems(data.cartData);
        } else {
          console.log("Discarding stale cart data from server due to local modifications.");
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  useEffect(() => {
    getProductsData();
  }, []);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !token) {
      setToken(storedToken);
    }
  }, []);

  // Fetch data whenever token is available
  useEffect(() => {
    if (token) {
      getProfileData();
      getWishlistData();
      getUserCart(token);
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    getUserCart,
    backendUrl,
    setToken,
    token,
    logout,
    userData,
    setUserData,
    getProfileData,
    wishlist,
    setWishlist,
    toggleWishlist,
    getWishlistData,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
