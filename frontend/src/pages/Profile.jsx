import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { token, backendUrl, userData, getProfileData, navigate, products } =
    useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("profile");

  // State for Profile Editing
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isDefault: false,
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!userData) {
    return (
      <div className="border-t pt-14 flex justify-center items-center min-h-[500px]">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setPhone(userData.phone || "");
    }
  }, [userData]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/order/userorders",
          {},
          { headers: { token } },
        );
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/user/wishlist",
          {},
          { headers: { token } },
        );
        if (data.success) {
          setWishlist(data.wishlist || []);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (token) fetchWishlist();
  }, [token]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        backendUrl + "/api/user/update-profile",
        { name, phone },
        { headers: { token } },
      );

      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);
        await axios.post(backendUrl + "/api/user/upload-image", imageFormData, {
          headers: { token },
        });
      }

      if (res.data.success) {
        toast.success("Profile Updated");
        setImage(false);
        getProfileData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        // Update existing address
        await axios.post(
          backendUrl + "/api/user/address/update",
          { addressId: editingAddressId, address: addressForm },
          { headers: { token } },
        );
        toast.success("Address updated");
      } else {
        // Add new address
        await axios.post(
          backendUrl + "/api/user/address/add",
          { address: addressForm },
          { headers: { token } },
        );
        toast.success("Address added");
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        isDefault: false,
      });
      getProfileData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const res = await axios.post(
        backendUrl + "/api/user/change-password",
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { token } },
      );
      if (res.data.success) {
        toast.success("Password changed successfully");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/user/wishlist/toggle",
        { productId },
        { headers: { token } },
      );
      if (res.data.success) {
        toast.success("Removed from wishlist");
        setWishlist(wishlist.filter((item) => item._id !== productId));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="border-t pt-14">
      <div className="flex flex-col sm:flex-row gap-12">
        {/* --- SIDEBAR TABS --- */}
        <div className="flex flex-col gap-2 w-full sm:w-64">
          <p className="text-gray-500 text-sm mb-4 font-semibold">
            ACCOUNT SETTINGS
          </p>
          {["profile", "addresses", "orders", "wishlist", "security"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-black text-white rounded"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 rounded"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="flex-1 mb-10">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form
              onSubmit={updateProfile}
              className="flex flex-col gap-6 max-w-lg"
            >
              <h2 className="text-3xl font-semibold">My Profile</h2>

              {/* Image Upload Section */}
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : userData.profileImage || assets.profile_icon
                  }
                  alt="Profile"
                />
                <label
                  htmlFor="profile-pic"
                  className="cursor-pointer bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition"
                >
                  Change Photo
                  <input
                    onChange={(e) => setImage(e.target.files[0])}
                    type="file"
                    id="profile-pic"
                    hidden
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">Full Name</p>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                  type="text"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">
                  Email Address
                </p>
                <input
                  value={userData.email || ""}
                  className="border border-gray-200 bg-gray-50 rounded px-3.5 py-2 w-full cursor-not-allowed"
                  type="email"
                  disabled
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">
                  Phone Number
                </p>
                <input
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                  className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                  type="tel"
                  placeholder="01XXX-XXXXXX"
                />
              </div>

              <button
                type="submit"
                className="bg-black text-white px-8 py-3 text-sm font-semibold w-fit rounded hover:bg-gray-800 transition"
              >
                SAVE CHANGES
              </button>
            </form>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-semibold">Manage Addresses</h2>
                  <p className="text-gray-500 text-sm">
                    Saved delivery locations
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setEditingAddressId(null);
                    setAddressForm({
                      street: "",
                      city: "",
                      state: "",
                      zip: "",
                      country: "",
                      isDefault: false,
                    });
                  }}
                  className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition"
                >
                  {showAddressForm ? "Cancel" : "+ Add Address"}
                </button>
              </div>

              {/* Display Addresses */}
              {userData.addresses && userData.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="border rounded-lg p-4 relative hover:shadow-lg transition bg-white"
                    >
                      {addr.isDefault && (
                        <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                          Default
                        </span>
                      )}
                      <div className="flex flex-col gap-2">
                        <p className="font-semibold text-sm text-gray-800">
                          {addr.street}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        <p className="text-sm text-gray-500">{addr.country}</p>

                        <div className="flex gap-2 mt-4 pt-3 border-t flex-wrap">
                          <button
                            onClick={() => {
                              setEditingAddressId(addr._id);
                              setAddressForm(addr);
                              setShowAddressForm(true);
                            }}
                            className="text-sm text-blue-600 hover:underline font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await axios.post(
                                  backendUrl + "/api/user/delete-address",
                                  { addressId: addr._id },
                                  { headers: { token } },
                                );
                                toast.success("Address deleted");
                                getProfileData();
                              } catch (error) {
                                toast.error(error.message);
                              }
                            }}
                            className="text-sm text-red-600 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                          {!addr.isDefault && (
                            <button
                              onClick={async () => {
                                try {
                                  await axios.post(
                                    backendUrl +
                                      "/api/user/set-default-address",
                                    { addressId: addr._id },
                                    { headers: { token } },
                                  );
                                  toast.success("Default address updated");
                                  getProfileData();
                                } catch (error) {
                                  toast.error(error.message);
                                }
                              }}
                              className="text-sm text-green-600 hover:underline font-semibold"
                            >
                              Set Default
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No addresses saved yet.</p>
              )}

              {/* Add/Edit Address Form */}
              {showAddressForm && (
                <form
                  onSubmit={saveAddress}
                  className="border rounded-lg p-6 bg-gray-50 max-w-lg space-y-4"
                >
                  <p className="text-lg font-semibold text-gray-800">
                    {editingAddressId ? "Edit Address" : "Add New Address"}
                  </p>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={addressForm.street}
                      onChange={handleAddressChange}
                      className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        className="border border-gray-300 rounded px-3.5 py-2 focus:outline-none focus:border-black"
                        placeholder="Dhaka"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        className="border border-gray-300 rounded px-3.5 py-2 focus:outline-none focus:border-black"
                        placeholder="DK"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={addressForm.zip}
                        onChange={handleAddressChange}
                        className="border border-gray-300 rounded px-3.5 py-2 focus:outline-none focus:border-black"
                        placeholder="1000"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        className="border border-gray-300 rounded px-3.5 py-2 focus:outline-none focus:border-black"
                        placeholder="Bangladesh"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          isDefault: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2 text-sm font-semibold rounded hover:bg-gray-800 transition w-fit"
                  >
                    {editingAddressId ? "Update Address" : "Add Address"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-3xl font-semibold">My Orders</h2>
                <p className="text-gray-500 text-sm">View all your orders</p>
              </div>

              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="border rounded-lg p-4 bg-white hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Order #{order._id.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`text-sm px-3 py-1 rounded font-semibold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b">
                        <div>
                          <p className="text-xs text-gray-500">Items</p>
                          <p className="font-semibold">
                            {order.items?.length || 0} items
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="font-semibold">৳{order.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment</p>
                          <p className="font-semibold text-sm">
                            {order.paymentMethod || "COD"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/product/${order.items?.[0]?._id || ""}`)
                        }
                        className="text-sm text-blue-600 hover:underline font-semibold"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No orders yet</p>
                  <button
                    onClick={() => navigate("/collection")}
                    className="mt-4 bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-3xl font-semibold">My Wishlist</h2>
                <p className="text-gray-500 text-sm">Products you love</p>
              </div>

              {wishlist && wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((product) => (
                    <div
                      key={product._id}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
                    >
                      <img
                        src={product.image?.[0] || assets.placeholder}
                        alt={product.name}
                        className="w-full h-40 object-cover cursor-pointer"
                        onClick={() => navigate(`/product/${product._id}`)}
                      />
                      <div className="p-4">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {product.name}
                        </p>
                        <p className="text-gray-500 text-xs mb-2">
                          {product.category}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-gray-900">
                            ৳{product.price}
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
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="flex flex-col gap-6 max-w-lg">
              <div>
                <h2 className="text-3xl font-semibold">Security Settings</h2>
                <p className="text-gray-500 text-sm">Change your password</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-700">
                    Current Password
                  </p>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        oldPassword: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-700">
                    New Password
                  </p>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                    placeholder="Enter new password (min 8 characters)"
                    minLength="8"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </p>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 text-sm font-semibold rounded hover:bg-gray-800 transition"
                >
                  CHANGE PASSWORD
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
