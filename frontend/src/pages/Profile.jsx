import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Profile = () => {
  const { token, backendUrl, userData, getProfileData, navigate } =
    useContext(ShopContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(false);

  // Fetch profile data when component mounts
  useEffect(() => {
    if (token && !userData) {
      getProfileData();
    }
  }, [token]);

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setPhone(userData.phone || "");
    }
  }, [userData]);

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

  if (!userData) {
    return (
      <div className="border-t pt-14 flex justify-center items-center min-h-[500px]">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const navigationCards = [
    {
      title: "📍 Addresses",
      description: "Manage your delivery addresses",
      path: "/addresses",
    },
    {
      title: "📦 Orders",
      description: "Track your orders",
      path: "/orders",
    },
    {
      title: "🛒 Cart",
      description: "View your shopping cart",
      path: "/cart",
    },
    {
      title: "❤️ Wishlist",
      description: "Your saved items",
      path: "/wishlist",
    },
    {
      title: "🔐 Account Security",
      description: "Change password",
      path: "/account",
    },
  ];

  return (
    <div className="border-t pt-14 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Profile Editing Section */}
        <div className="mb-16">
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
        </div>

        {/* Navigation Cards Section */}
        <div>
          <h2 className="text-3xl font-semibold mb-8">Account Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationCards.map((card, index) => (
              <motion.button
                key={index}
                onClick={() => navigate(card.path)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-left hover:shadow-lg transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-black transition">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end text-black group-hover:translate-x-2 transition">
                  <span>→</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
