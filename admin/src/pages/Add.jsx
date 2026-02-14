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
  // Updated initial categories to match your requested sections
  const [category, setCategory] = useState("Autodetailing");
  // 1. New State for Brand and Advanced Filters
  const [brand, setBrand] = useState("NGK");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [countryOfImport, setCountryOfImport] = useState("");
  const [unitSize, setUnitSize] = useState("");
  const [sae, setSae] = useState("");
  const [oilType, setOilType] = useState("");
  const [api, setApi] = useState("");
  const [acea, setAcea] = useState("");
  const [appropriateUse, setAppropriateUse] = useState("");

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
      // 2. Append Brand and Advanced Filters to FormData
      formData.append("brand", brand);
      formData.append("countryOfOrigin", countryOfOrigin);
      formData.append("countryOfImport", countryOfImport);
      formData.append("unitSize", unitSize);
      formData.append("sae", sae);
      formData.append("oilType", oilType);
      formData.append("api", api);
      formData.append("acea", acea);
      formData.append("appropriateUse", appropriateUse);
      formData.append("bestseller", bestseller);

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setPrice("");
        setBrand("NGK"); // Reset Brand
        setCountryOfOrigin("");
        setCountryOfImport("");
        setUnitSize("");
        setSae("");
        setOilType("");
        setApi("");
        setAcea("");
        setAppropriateUse("");
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
        <div className="flex gap-3 mb-4">
          <ImageUploadSlot id="image1" image={image1} setImage={setImage1} />
          <ImageUploadSlot id="image2" image={image2} setImage={setImage2} />
          <ImageUploadSlot id="image3" image={image3} setImage={setImage3} />
          <ImageUploadSlot id="image4" image={image4} setImage={setImage4} />
        </div>

        {/* Bulk Upload Button */}
        <button
          type="button"
          onClick={() => document.getElementById("bulkImageInput").click()}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
        >
          Upload Multiple Images at Once
        </button>
        <input
          id="bulkImageInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleMultipleImages}
          hidden
        />
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        className="border border-gray-300 px-3 py-2 w-full max-w-[500px] rounded focus:outline-none focus:border-gray-600"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Product Description"
        className="border border-gray-300 px-3 py-2 w-full max-w-[500px] rounded focus:outline-none focus:border-gray-600"
        required
      />

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Dropdown */}
        <div className="flex flex-col gap-1">
          <p>Category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-40 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="Autodetailing">Autodetailing</option>
            <option value="Engine Oil">Engine Oil</option>
            <option value="Filters">Filters</option>
            <option value="Damping">Damping</option>
            <option value="Ignition">Ignition</option>
            <option value="Engine">Engine</option>
            <option value="Brake">Brake</option>
            <option value="Suspension">Suspension</option>
            <option value="Electrical">Electrical</option>
            <option value="Body">Body</option>
            <option value="Wheels">Wheels</option>
          </select>
        </div>



        {/* 3. Brand Dropdown Field */}
        <div className="flex flex-col gap-1">
          <p>Brand</p>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-40 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="3M">3M</option>
            <option value="555">555</option>
            <option value="AISIN">AISIN</option>
            <option value="Autolite">Autolite</option>
            <option value="AUTOPROFI">AUTOPROFI</option>
            <option value="bluechem">bluechem</option>
            <option value="BIZOL">BIZOL</option>
            <option value="AbBlue">AbBlue</option>
            <option value="AYTOGLYM">AYTOGLYM</option>
            <option value="BOSCH">BOSCH</option>
            <option value="CAT">CAT</option>
          </select>
        </div>

        {/* Advanced Filters Inputs */}
        <div className="flex flex-col gap-1">
          <p>Country of Origin</p>
          <select
            value={countryOfOrigin}
            onChange={(e) => setCountryOfOrigin(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-40 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="Japan">Japan</option>
            <option value="China">China</option>
            <option value="Germany">Germany</option>
            <option value="USA">USA</option>
            <option value="India">India</option>
            <option value="Thailand">Thailand</option>
            <option value="Turkey">Turkey</option>
            <option value="Taiwan">Taiwan</option>
            <option value="UAE">UAE</option>
            <option value="Korea">Korea</option>
            <option value="Singapore">Singapore</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>Country of Import</p>
          <select
            value={countryOfImport}
            onChange={(e) => setCountryOfImport(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-40 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="Japan">Japan</option>
            <option value="China">China</option>
            <option value="Germany">Germany</option>
            <option value="USA">USA</option>
            <option value="India">India</option>
            <option value="Thailand">Thailand</option>
            <option value="Turkey">Turkey</option>
            <option value="Taiwan">Taiwan</option>
            <option value="UAE">UAE</option>
            <option value="Korea">Korea</option>
            <option value="Singapore">Singapore</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>Unit Size</p>
          <select
            value={unitSize}
            onChange={(e) => setUnitSize(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-28 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="1L">1L</option>
            <option value="3L">3L</option>
            <option value="3.5L">3.5L</option>
            <option value="4L">4L</option>
            <option value="5L">5L</option>
            <option value="20L">20L</option>
            <option value="208L">208L</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>SAE</p>
          <select
            value={sae}
            onChange={(e) => setSae(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-28 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="0W-16">0W-16</option>
            <option value="0W-20">0W-20</option>
            <option value="5W-20">5W-20</option>
            <option value="5W-30">5W-30</option>
            <option value="5W-40">5W-40</option>
            <option value="10W-30">10W-30</option>
            <option value="10W-40">10W-40</option>
            <option value="15W-40">15W-40</option>
            <option value="20W-50">20W-50</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>Oil Type</p>
          <select
            value={oilType}
            onChange={(e) => setOilType(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-40 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="Mineral">Mineral</option>
            <option value="Semi Synthetic">Semi Synthetic</option>
            <option value="Fully Synthetic">Fully Synthetic</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>API</p>
          <select
            value={api}
            onChange={(e) => setApi(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-28 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="SJ">SJ</option>
            <option value="SL">SL</option>
            <option value="SM">SM</option>
            <option value="SN">SN</option>
            <option value="SN Plus">SN Plus</option>
            <option value="SP">SP</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>ACEA</p>
          <select
            value={acea}
            onChange={(e) => setAcea(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-28 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="A3/B3">A3/B3</option>
            <option value="A3/B4">A3/B4</option>
            <option value="A5/B5">A5/B5</option>
            <option value="C2">C2</option>
            <option value="C3">C3</option>
            <option value="C5">C5</option>
            <option value="E4">E4</option>
            <option value="E7">E7</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>Appropriate Use</p>
          <select
            value={appropriateUse}
            onChange={(e) => setAppropriateUse(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full sm:w-40 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="N/A">Select</option>
            <option value="Car">Car</option>
            <option value="Motorcycle">Motorcycle</option>
            <option value="Heavy Duty">Heavy Duty</option>
            <option value="Industry">Industry</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p>Product Price (৳)</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25"
            className="border border-gray-300 px-3 py-2 w-full sm:w-28 rounded focus:outline-none focus:border-gray-600"
            required
          />
        </div>
      </div>

      <label className="flex gap-2 items-center cursor-pointer">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller((p) => !p)}
        />
        <p>Add to Bestseller</p>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-10 py-3 w-fit rounded hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "ADDING..." : "ADD PRODUCT"}
      </button>
    </form>
  );
};

export default Add;

// import React, { useState } from "react";
// import { assets } from "../assets/assets";
// import axios from "axios";
// import { backendUrl } from "../App";
// import { toast } from "react-toastify";

// const Add = ({ token }) => {
//   const [image1, setImage1] = useState(false);
//   const [image2, setImage2] = useState(false);
//   const [image3, setImage3] = useState(false);
//   const [image4, setImage4] = useState(false);

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("Engine");
//   const [subCategory, setSubCategory] = useState("General");
//   const [bestseller, setBestseller] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleMultipleImages = (e) => {
//     const files = Array.from(e.target.files);

//     if (files[0]) setImage1(files[0]);
//     if (files[1]) setImage2(files[1]);
//     if (files[2]) setImage3(files[2]);
//     if (files[3]) setImage4(files[3]);

//     if (files.length > 4) {
//       toast.info("Only first 4 images were added");
//     }
//   };

//   const ImageUploadSlot = ({ id, image, setImage }) => (
//     <div className="relative">
//       <label htmlFor={id}>
//         <img
//           className="w-20 cursor-pointer border border-dashed border-gray-400 p-1"
//           src={!image ? assets.upload_area : URL.createObjectURL(image)}
//           alt=""
//         />
//         <input
//           onChange={(e) => setImage(e.target.files[0])}
//           type="file"
//           id={id}
//           hidden
//         />
//       </label>
//       {image && (
//         <div
//           onClick={() => setImage(false)}
//           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer"
//         >
//           ✕
//         </div>
//       )}
//     </div>
//   );

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("description", description);
//       formData.append("price", price);
//       formData.append("category", category);
//       formData.append("subCategory", subCategory);
//       formData.append("bestseller", bestseller);

//       if (image1) formData.append("image1", image1);
//       if (image2) formData.append("image2", image2);
//       if (image3) formData.append("image3", image3);
//       if (image4) formData.append("image4", image4);

//       const response = await axios.post(
//         backendUrl + "/api/product/add",
//         formData,
//         { headers: { token } }
//       );

//       if (response.data.success) {
//         toast.success(response.data.message);
//         setName("");
//         setDescription("");
//         setPrice("");
//         setImage1(false);
//         setImage2(false);
//         setImage3(false);
//         setImage4(false);
//         setBestseller(false);
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={onSubmitHandler} className="flex flex-col gap-4 w-full">

//       <div>
//         <p className="mb-2">Upload Images</p>
//         <div className="flex gap-3">
//           <ImageUploadSlot id="image1" image={image1} setImage={setImage1} />
//           <ImageUploadSlot id="image2" image={image2} setImage={setImage2} />
//           <ImageUploadSlot id="image3" image={image3} setImage={setImage3} />
//           <ImageUploadSlot id="image4" image={image4} setImage={setImage4} />
//         </div>
//       </div>

//       <input
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Product Name"
//         className="border px-3 py-2"
//         required
//       />

//       <textarea
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         placeholder="Product Description"
//         className="border px-3 py-2"
//         required
//       />

//       <div className="flex gap-4">
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           className="border px-3 py-2"
//         >
//           <option value="Engine">Engine</option>
//           <option value="Brakes">Brakes</option>
//           <option value="Suspension">Suspension</option>
//           <option value="Ignition">Ignition</option>
//           <option value="Electrical">Electrical</option>
//           <option value="Body">Body</option>
//           <option value="Wheels">Wheels</option>
//         </select>

//         <select
//           value={subCategory}
//           onChange={(e) => setSubCategory(e.target.value)}
//           className="border px-3 py-2"
//         >
//           <option value="Tires">Tires</option>
//           <option value="Engine Mounts">Engine Mounts</option>
//           <option value="Spark Plugs">Spark Plugs</option>
//           <option value="Batteries">Batteries</option>
//           <option value="Headlights">Headlights</option>
//           <option value="General">General</option>

//         </select>

//         <input
//           type="number"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           placeholder="Price"
//           className="border px-3 py-2 w-28"
//           required
//         />
//       </div>

//       <label className="flex gap-2 items-center">
//         <input
//           type="checkbox"
//           checked={bestseller}
//           onChange={() => setBestseller((p) => !p)}
//         />
//         Add to Bestseller
//       </label>

//       <button
//         disabled={loading}
//         className="bg-black text-white px-6 py-2 w-fit"
//       >
//         {loading ? "ADDING..." : "ADD PRODUCT"}
//       </button>
//     </form>
//   );
// };

// export default Add;
