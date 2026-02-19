import React, { useState, useEffect } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";
import { subCategories } from "../assets/subCategories";
import { brands } from "../assets/brands";
import { importCountries, originCountries } from "../assets/countries";
import { unitSizes } from "../assets/unitSizes";
import { saeViscosities } from "../assets/sae";
import { oilTypes } from "../assets/oilTypes";
import { apiOptions } from "../assets/apiOptions";
import { aceaOptions } from "../assets/aceaOptions";
import { appropriateUseOptions } from "../assets/appropriateUse";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Edit modal state - Updated with Brand field
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "Autodetailing",
    subCategory: "",
    brand: "3M",
    countryOfOrigin: "",
    countryOfImport: "",
    unitSize: "",
    sae: "",
    oilType: "",
    api: "",
    acea: "",
    appropriateUse: "",
    bestseller: false,
  });

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ open modal and prefill data
  const openEdit = (item) => {
    setEditForm({
      id: item._id,
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      category: item.category || "Autodetailing",
      subCategory: item.subCategory || "",
      brand: item.brand || "3M",
      countryOfOrigin: item.countryOfOrigin || "",
      countryOfImport: item.countryOfImport || "",
      unitSize: item.unitSize || "",
      sae: item.sae || "",
      oilType: item.oilType || "",
      api: item.api || "",
      acea: item.acea || "",
      appropriateUse: item.appropriateUse || "",
      bestseller: !!item.bestseller,
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
  };

  // ✅ save edit
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) return toast.error("Name is required");
    if (!editForm.description.trim())
      return toast.error("Description is required");
    if (editForm.price === "" || Number(editForm.price) <= 0)
      return toast.error("Valid price is required");

    try {
      setSaving(true);
      const response = await axios.post(
        backendUrl + "/api/product/update",
        {
          id: editForm.id,
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
          category: editForm.category,
          subCategory: editForm.subCategory,
          brand: editForm.brand,
          countryOfOrigin: editForm.countryOfOrigin,
          countryOfImport: editForm.countryOfImport,
          unitSize: editForm.unitSize,
          sae: editForm.sae,
          oilType: editForm.oilType,
          api: editForm.api,
          acea: editForm.acea,
          appropriateUse: editForm.appropriateUse,
          bestseller: editForm.bestseller,
        },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message || "Product updated");
        closeEdit();
        fetchList();
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = list.filter((item) => {
    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const brand = (item.brand || "").toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      category.includes(searchTerm.toLowerCase()) ||
      brand.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <p className="font-semibold">ALL PRODUCT LIST</p>

        <input
          type="text"
          placeholder="Search by name, brand, or category..."
          className="border border-gray-300 rounded-md px-3 py-1.5 w-full md:w-64 outline-none focus:border-gray-600 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 items-center py-2 px-3 border bg-gray-100 text-sm">
            <b>Image</b>
            <b>Name & Brand</b>
            <b>Category</b>
            <b>Price</b>
            <b className="text-center">Actions</b>
          </div>

          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 items-center py-2 px-3 border text-sm hover:bg-gray-50 transition-colors"
              >
                <img
                  src={item.image?.[0]}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />

                <div className="flex flex-col">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 italic">{item.brand}</p>
                  {item.bestseller && (
                    <span className="text-[10px] mt-1 w-fit px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium">
                      Bestseller
                    </span>
                  )}
                </div>

                <p>{item.category}</p>
                <p>৳{item.price}</p>

                <div className="flex items-center justify-center gap-4">
                  <MdEdit
                    onClick={() => openEdit(item)}
                    className="text-xl cursor-pointer text-blue-600 hover:scale-110 transition-transform"
                    title="Edit"
                  />
                  <MdDelete
                    onClick={() => handleRemove(item._id)}
                    className="text-xl cursor-pointer text-red-500 hover:scale-110 transition-transform"
                    title="Delete"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-gray-500">
              No products found matching "{searchTerm}"
            </p>
          )}
        </div>
      )}

      {/* ✅ Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEdit}
          />

          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Edit Product</h2>
              <button
                onClick={closeEdit}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Product Name</p>
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Price</p>
                  <input
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded min-h-[80px] focus:outline-none focus:border-gray-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Category</p>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {Object.keys(subCategories).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Sub Category</p>
                  <select
                    value={editForm.subCategory}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subCategory: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    <option value="">Select</option>
                    {subCategories[editForm.category] && subCategories[editForm.category].map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>


                {/* Advanced Filters Dropdowns for Edit */}
                <div>
                  <p className="text-sm font-medium mb-1">Country of Origin</p>
                  <select
                    value={editForm.countryOfOrigin}
                    onChange={(e) =>
                      setEditForm({ ...editForm, countryOfOrigin: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {originCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Country of Import</p>
                  <select
                    value={editForm.countryOfImport}
                    onChange={(e) =>
                      setEditForm({ ...editForm, countryOfImport: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {importCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Unit Size</p>
                  <select
                    value={editForm.unitSize}
                    onChange={(e) =>
                      setEditForm({ ...editForm, unitSize: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {unitSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">SAE</p>
                  <select
                    value={editForm.sae}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sae: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {saeViscosities.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Oil Type</p>
                  <select
                    value={editForm.oilType}
                    onChange={(e) =>
                      setEditForm({ ...editForm, oilType: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {oilTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">API</p>
                  <select
                    value={editForm.api}
                    onChange={(e) =>
                      setEditForm({ ...editForm, api: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {apiOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">ACEA</p>
                  <select
                    value={editForm.acea}
                    onChange={(e) =>
                      setEditForm({ ...editForm, acea: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600 max-h-60 overflow-y-auto"
                  >
                    {aceaOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Appropriate Use</p>
                  <select
                    value={editForm.appropriateUse}
                    onChange={(e) =>
                      setEditForm({ ...editForm, appropriateUse: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    {appropriateUseOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Brand</p>
                  <select
                    value={editForm.brand}
                    onChange={(e) =>
                      setEditForm({ ...editForm, brand: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-gray-600 w-4 h-4"
                  checked={editForm.bestseller}
                  onChange={() =>
                    setEditForm({
                      ...editForm,
                      bestseller: !editForm.bestseller,
                    })
                  }
                />
                Mark as Bestseller
              </label>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 px-4 py-2 rounded border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded bg-black text-white font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div >
        </div >
      )}
    </>
  );
};

export default List;
