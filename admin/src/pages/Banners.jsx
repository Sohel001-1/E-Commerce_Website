import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { subCategories } from "../assets/subCategories";

const Banners = ({ token }) => {
  const [image, setImage] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [cta, setCta] = useState("");
  const [category, setCategory] = useState("Oils and Fluids");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  
  const [banners, setBanners] = useState([]);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/banner/list");
      if (response.data.success) {
        setBanners(response.data.banners);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!editId && !image) return toast.error("Image not selected");
      setLoading(true);
      const formData = new FormData();

      if (editId) formData.append("id", editId);
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("cta", cta);
      formData.append("category", category);
      if (image) formData.append("image", image);

      const url = editId ? "/api/banner/update" : "/api/banner/add";

      const response = await axios.post(backendUrl + url, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        fetchBanners();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImage(false);
    setExistingImageUrl("");
    setTitle("");
    setSubtitle("");
    setCta("");
    setEditId(null);
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setCta(item.cta);
    setCategory(item.category);
    setImage(false);
    setExistingImageUrl(item.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeBanner = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/banner/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchBanners();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
        <div className="flex w-full items-center justify-between xl:w-[500px]">
           <h2 className="text-xl font-medium mb-2">{editId ? "Edit Banner" : "Add New Banner"}</h2>
           {editId && (
             <button type="button" onClick={resetForm} className="text-sm bg-gray-500 text-white px-3 py-1 rounded">Cancel Edit</button>
           )}
        </div>
        
        <div>
          <p className="mb-2">Upload Image {editId && "(Leave empty to keep existing)"}</p>
          <label htmlFor="image">
            <img
              className="w-48 cursor-pointer object-cover h-32 rounded-lg"
              src={!image ? (existingImageUrl || assets.upload_area) : URL.createObjectURL(image)}
              alt="banner upload"
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            accept="image/*"
          />
        </div>

        <div className="w-full sm:w-[500px]">
          <p className="mb-2">Title</p>
          <input
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Top-Grade Motor Oil"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="w-full sm:w-[500px]">
          <p className="mb-2">Subtitle</p>
          <input
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Clean emissions with authentic lubricants"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4 w-full sm:w-[500px]">
          <div className="flex-1">
            <p className="mb-2">CTA Button Text</p>
            <input
              className="w-full px-3 py-2"
              type="text"
              placeholder="View Oils"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <p className="mb-2">Category Link</p>
            <select
              className="w-full px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {Object.keys(subCategories).map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-40 py-3 mt-4 bg-black text-white ${loading ? "opacity-50" : ""}`}
        >
          {loading ? "SAVING..." : editId ? "UPDATE BANNER" : "ADD BANNER"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-medium mb-2">Existing Banners</h2>
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Title</b>
          <b>CTA</b>
          <b>Category</b>
          <b className="text-center">Edit</b>
          <b className="text-center">Remove</b>
        </div>
        {banners.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-24 h-16 object-cover rounded" src={item.image} alt="banner" />
            <p>{item.title}</p>
            <p>{item.cta}</p>
            <p>{item.category}</p>
            <p
              onClick={() => handleEdit(item)}
              className="text-right md:text-center cursor-pointer text-lg text-blue-500 font-bold"
            >
              ✎
            </p>
            <p
              onClick={() => removeBanner(item._id)}
              className="text-right md:text-center cursor-pointer text-lg text-red-500 font-bold"
            >
              X
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banners;
