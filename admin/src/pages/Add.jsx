import React, { useState } from "react";
import { assets } from "../assets/assets";
import { subCategories } from "../assets/subCategories";
import { brands } from "../assets/brands";
import { importCountries, originCountries } from "../assets/countries";
import { unitSizes } from "../assets/unitSizes";
import { saeViscosities } from "../assets/sae";
import { oilTypes } from "../assets/oilTypes";
import { apiOptions } from "../assets/apiOptions";
import { aceaOptions } from "../assets/aceaOptions";
import { appropriateUseOptions } from "../assets/appropriateUse";
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
  const [category, setCategory] = useState("Suspension");
  const [subCategory, setSubCategory] = useState("Shock Absorber");
  // 1. New State for Brand and Advanced Filters
  const [brand, setBrand] = useState(brands[0]);
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
      formData.append("subCategory", subCategory);
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
        setCategory("Suspension");
        setSubCategory("Shock Absorber");
        setBrand(""); // Reset Brand
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
    <form
      onSubmit={onSubmitHandler}
      className="flex w-full max-w-5xl flex-col gap-6"
    >
      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Upload Images
          </h2>
          <button
            type="button"
            onClick={() => document.getElementById("bulkImageInput").click()}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
          >
            Upload Multiple Images at Once
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <ImageUploadSlot id="image1" image={image1} setImage={setImage1} />
          <ImageUploadSlot id="image2" image={image2} setImage={setImage2} />
          <ImageUploadSlot id="image3" image={image3} setImage={setImage3} />
          <ImageUploadSlot id="image4" image={image4} setImage={setImage4} />
        </div>
        <input
          id="bulkImageInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleMultipleImages}
          hidden
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-800">Product Info</h2>
        <div className="mt-4 grid gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="productName" className="text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              id="productName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="productDescription"
              className="text-sm font-medium text-gray-700"
            >
              Product Description
            </label>
            <textarea
              id="productDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product Description"
              className="min-h-[120px] w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
              required
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-800">Classification</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory(subCategories[e.target.value] ? subCategories[e.target.value][0] : "");
              }}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {Object.keys(subCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="subCategory" className="text-sm font-medium text-gray-700">
              Sub Category
            </label>
            <select
              id="subCategory"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {subCategories[category] && subCategories[category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="brand" className="text-sm font-medium text-gray-700">
              Brand
            </label>
            <select
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-800">Origin & Import</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="countryOfOrigin"
              className="text-sm font-medium text-gray-700"
            >
              Country of Origin
            </label>
            <select
              id="countryOfOrigin"
              value={countryOfOrigin}
              onChange={(e) => setCountryOfOrigin(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {originCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="countryOfImport"
              className="text-sm font-medium text-gray-700"
            >
              Country of Import
            </label>
            <select
              id="countryOfImport"
              value={countryOfImport}
              onChange={(e) => setCountryOfImport(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {importCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-800">Technical Specs</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="unitSize" className="text-sm font-medium text-gray-700">
              Unit Size
            </label>
            <select
              id="unitSize"
              value={unitSize}
              onChange={(e) => setUnitSize(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {unitSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="sae" className="text-sm font-medium text-gray-700">
              SAE
            </label>
            <select
              id="sae"
              value={sae}
              onChange={(e) => setSae(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {saeViscosities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="oilType" className="text-sm font-medium text-gray-700">
              Oil Type
            </label>
            <select
              id="oilType"
              value={oilType}
              onChange={(e) => setOilType(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {oilTypes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="api" className="text-sm font-medium text-gray-700">
              API
            </label>
            <select
              id="api"
              value={api}
              onChange={(e) => setApi(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {apiOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="acea" className="text-sm font-medium text-gray-700">
              ACEA
            </label>
            <select
              id="acea"
              value={acea}
              onChange={(e) => setAcea(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none max-h-60 overflow-y-auto"
            >
              {aceaOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="appropriateUse"
              className="text-sm font-medium text-gray-700"
            >
              Appropriate Use
            </label>
            <select
              id="appropriateUse"
              value={appropriateUse}
              onChange={(e) => setAppropriateUse(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-gray-600 focus:outline-none"
            >
              {appropriateUseOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-800">Pricing</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-sm font-medium text-gray-700">
              Product Price (৳)
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="25"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
              required
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={() => setBestseller((p) => !p)}
          />
          Add to Bestseller
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-10 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
        >
          {loading ? "ADDING..." : "ADD PRODUCT"}
        </button>
      </section>
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
