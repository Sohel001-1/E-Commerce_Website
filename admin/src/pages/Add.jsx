import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Engine");
  const [subCategory, setSubCategory] = useState("General");
  const [bestseller, setBestseller] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMultipleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files[0]) setImage1(files[0]);
    if (files[1]) setImage2(files[1]);
    if (files[2]) setImage3(files[2]);
    if (files[3]) setImage4(files[3]);

    if (files.length > 4) {
      toast.info("Only first 4 images were added");
    }
  };

  const ImageUploadSlot = ({ id, image, setImage }) => (
    <div className="relative">
      <label htmlFor={id}>
        <img
          className="w-20 cursor-pointer border border-dashed border-gray-400 p-1"
          src={!image ? assets.upload_area : URL.createObjectURL(image)}
          alt=""
        />
        <input
          onChange={(e) => setImage(e.target.files[0])}
          type="file"
          id={id}
          hidden
        />
      </label>
      {image && (
        <div
          onClick={() => setImage(false)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer"
        >
          ✕
        </div>
      )}
    </div>
  );

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setPrice("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setBestseller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col gap-4 w-full">

      <div>
        <p className="mb-2">Upload Images</p>
        <div className="flex gap-3">
          <ImageUploadSlot id="image1" image={image1} setImage={setImage1} />
          <ImageUploadSlot id="image2" image={image2} setImage={setImage2} />
          <ImageUploadSlot id="image3" image={image3} setImage={setImage3} />
          <ImageUploadSlot id="image4" image={image4} setImage={setImage4} />
        </div>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        className="border px-3 py-2"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Product Description"
        className="border px-3 py-2"
        required
      />

      <div className="flex gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2"
        >
          <option value="Engine">Engine</option>
          <option value="Brake">Brake</option>
          <option value="Suspension">Suspension</option>
          <option value="Ignition">Ignition</option>
          <option value="Electrical">Electrical</option>
          <option value="Body">Body</option>
          <option value="Wheels">Wheels</option>
        </select>

        <select
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="border px-3 py-2"
        >
          <option value="Tires">Tires</option>
          <option value="Engine Mounts">Engine Mounts</option>
          <option value="Spark Plugs">Spark Plugs</option>
          <option value="Batteries">Batteries</option>
          <option value="Headlights">Headlights</option>
          <option value="General">General</option>
        
        </select>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="border px-3 py-2 w-28"
          required
        />
      </div>

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller((p) => !p)}
        />
        Add to Bestseller
      </label>

      <button
        disabled={loading}
        className="bg-black text-white px-6 py-2 w-fit"
      >
        {loading ? "ADDING..." : "ADD PRODUCT"}
      </button>
    </form>
  );
};

export default Add;
