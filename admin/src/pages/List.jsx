import React, { useState, useEffect } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";

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

                <div>
                  <p className="text-sm font-medium mb-1">Country of Import</p>
                  <select
                    value={editForm.countryOfImport}
                    onChange={(e) =>
                      setEditForm({ ...editForm, countryOfImport: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
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

                <div>
                  <p className="text-sm font-medium mb-1">Unit Size</p>
                  <select
                    value={editForm.unitSize}
                    onChange={(e) =>
                      setEditForm({ ...editForm, unitSize: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
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

                <div>
                  <p className="text-sm font-medium mb-1">SAE</p>
                  <select
                    value={editForm.sae}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sae: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
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

                <div>
                  <p className="text-sm font-medium mb-1">Oil Type</p>
                  <select
                    value={editForm.oilType}
                    onChange={(e) =>
                      setEditForm({ ...editForm, oilType: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    <option value="N/A">Select</option>
                    <option value="Mineral">Mineral</option>
                    <option value="Semi Synthetic">Semi Synthetic</option>
                    <option value="Fully Synthetic">Fully Synthetic</option>
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
                    <option value="N/A">Select</option>
                    <option value="SJ">SJ</option>
                    <option value="SL">SL</option>
                    <option value="SM">SM</option>
                    <option value="SN">SN</option>
                    <option value="SN Plus">SN Plus</option>
                    <option value="SP">SP</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">ACEA</p>
                  <select
                    value={editForm.acea}
                    onChange={(e) =>
                      setEditForm({ ...editForm, acea: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
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

                <div>
                  <p className="text-sm font-medium mb-1">Appropriate Use</p>
                  <select
                    value={editForm.appropriateUse}
                    onChange={(e) =>
                      setEditForm({ ...editForm, appropriateUse: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  >
                    <option value="N/A">Select</option>
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Heavy Duty">Heavy Duty</option>
                    <option value="Industry">Industry</option>
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
                    <option value="General">General</option>
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
