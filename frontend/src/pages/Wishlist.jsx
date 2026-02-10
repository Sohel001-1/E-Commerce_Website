import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const Wishlist = () => {
  const {
    token,
    wishlist,
    toggleWishlist,
    navigate,
    currency,
    getWishlistData,
  } = useContext(ShopContext);

  // Fetch wishlist on mount and when token changes
  useEffect(() => {
    if (token) {
      getWishlistData();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="border-t pt-14 flex justify-center items-center min-h-[500px]">
        <p className="text-gray-500">Please login to view wishlist</p>
      </div>
    );
  }

  const removeFromWishlist = async (productId) => {
    await toggleWishlist(productId);
  };

  return (
    <div className="border-t pt-14">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">Products you love</p>
        </div>

        {wishlist && wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
              >
                <img
                  src={product.image?.[0] || assets.placeholder}
                  alt={product.name}
                  className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate(`/product/${product._id}`)}
                />
                <div className="p-4">
                  <p
                    className="font-semibold text-sm text-gray-800 truncate hover:text-blue-600 cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </p>
                  <p className="text-gray-500 text-xs mb-2">
                    {product.category}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900">
                      {currency}
                      {product.price}
                    </p>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Wishlist is empty</p>
            <button
              onClick={() => navigate("/collection")}
              className="mt-4 bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
