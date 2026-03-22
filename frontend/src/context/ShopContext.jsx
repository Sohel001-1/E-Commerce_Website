import { createContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "৳";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [shippingFees, setShippingFees] = useState({ inside: 0, outside: 0 });
  const [selectedRegion, setSelectedRegion] = useState("inside");
  const delivery_fee =
    selectedRegion === "inside" ? shippingFees.inside : shippingFees.outside;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const cartModificationRef = useRef(0); // Track local modifications to prevent stale server updates

  const addToCart = async (itemId) => {
    const product = products.find((p) => p._id === itemId);
    if (!product) return;

    // Check stock
    let currentQty = cartItems[itemId] || 0;
    if (typeof currentQty === "object") {
      currentQty = Object.values(currentQty).reduce((a, b) => a + b, 0); // fallback if they used size objects
    }

    if (currentQty + 1 > product.stock) {
      return toast.error(
        product.stock <= 0
          ? "This item is out of stock."
          : `Only ${product.stock} items available in stock.`,
      );
    }

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
    setIsProductsLoading(true);
    try {
      let responseData = null;

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const { data } = await axios.get(backendUrl + "/api/product/list");
          responseData = data;
          break;
        } catch (error) {
          if (attempt === 2) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }

      if (responseData?.success) setProducts(responseData.products);
      else {
        setProducts([]);
        toast.error(responseData?.message || "Failed to load products");
      }
    } catch (error) {
      setProducts([]);
      toast.error(error.message);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const getSettingsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/settings");
      if (response.data.success && response.data.settings) {
        setShippingFees({
          inside: response.data.settings.insideChittagongFee || 0,
          outside: response.data.settings.outsideChittagongFee || 0,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const product = products.find((p) => p._id === itemId);
    if (product && quantity > product.stock) {
      return toast.error(`Only ${product.stock} items available in stock.`);
    }

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

      const activePrice =
        product.salePrice > 0 ? product.salePrice : product.price;
      totalAmount += activePrice * count;
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
          console.log(
            "Discarding stale cart data from server due to local modifications.",
          );
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
    getSettingsData();
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
    isProductsLoading,
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
    isCartOpen,
    setIsCartOpen,
    shippingFees,
    selectedRegion,
    setSelectedRegion,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
