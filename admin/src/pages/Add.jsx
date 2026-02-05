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
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleMultipleImages = (e) => {
    const files = Array.from(e.target.files);
    
    if (files[0]) setImage1(files[0]);
    if (files[1]) setImage2(files[1]);
    if (files[2]) setImage3(files[2]);
    if (files[3]) setImage4(files[3]);
    
    if (files.length > 4) {
      toast.info("Only the first 4 images were added.");
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
        <input onChange={(e) => setImage(e.target.files[0])} type="file" id={id} hidden />
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
      formData.append("sizes", JSON.stringify(sizes));

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setPrice("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setSizes([]);
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

  const toggleSize = (size) => {
    setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size]);
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <div className="flex justify-between items-center w-full max-w-[500px] mb-2">
           <p>Upload Images</p>
           <label className="text-xs bg-blue-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-600">
             Bulk Upload
             <input type="file" multiple onChange={handleMultipleImages} hidden />
           </label>
        </div>
        
        <div className="flex gap-3">
          <ImageUploadSlot id="image1" image={image1} setImage={setImage1} />
          <ImageUploadSlot id="image2" image={image2} setImage={setImage2} />
          <ImageUploadSlot id="image3" image={image3} setImage={setImage3} />
          <ImageUploadSlot id="image4" image={image4} setImage={setImage4} />
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className="w-full max-w-[500px] px-3 py-2 border border-gray-300 outline-none" type="text" placeholder="Type here" required />
      </div>

      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full max-w-[500px] px-3 py-2 border border-gray-300 outline-none" placeholder="Write content here" required />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>
          <select onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Sub category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300">
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Product Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className="w-full px-3 py-2 sm:w-[120px] border border-gray-300" type="Number" placeholder="25" />
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div key={size} onClick={() => toggleSize(size)}>
              <p className={`${sizes.includes(size) ? "bg-black text-white" : "bg-slate-200"} px-3 py-1 cursor-pointer transition-all`}>{size}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
        <label className="cursor-pointer" htmlFor="bestseller">Add to Bestseller</label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-28 py-3 mt-4 bg-black text-white ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
      >
        {loading ? "ADDING..." : "ADD"}
      </button>
    </form>
  );
};

export default Add;