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
    subCategory: "General",
    brand: "3M",
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
      subCategory: item.subCategory || "General",
      brand: item.brand || "3M",
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
          className="border border-gray-300 rounded-md px-3 py-1.5 w-full md:w-64 outline-none focus:border-orange-500 transition-all"
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
                <p>${item.price}</p>

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
                    className="w-full border px-3 py-2 rounded focus:ring-1 focus:ring-orange-500 outline-none"
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
                    className="w-full border px-3 py-2 rounded focus:ring-1 focus:ring-orange-500 outline-none"
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
                  className="w-full border px-3 py-2 rounded min-h-[80px] focus:ring-1 focus:ring-orange-500 outline-none"
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
                    className="w-full border px-3 py-2 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    <option value="Autodetailing">Autodetailing</option>
                    <option value="Engine Oil">Engine Oil</option>
                    <option value="Filters">Filters</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Damping">Damping</option>
                    <option value="Ignition">Ignition</option>
                    <option value="Engine">Engine</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Body">Body</option>
                    <option value="Wheels">Wheels</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Sub Category</p>
                  <select
                    value={editForm.subCategory}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subCategory: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Tires">Tires</option>
                    <option value="Brake pads">Brake pads</option>
                    <option value="Brake pipes">Brake pipes</option>
                    <option value="Master Cylinder">Master Cylinder</option>
                    <option value="Caliper repair kit">
                      Caliper repair kit
                    </option>
                    <option value="Engine mount">Engine mount</option>
                    <option value="Bush">Bush</option>
                    <option value="Thermostate">Thermostate</option>
                    <option value="Link rod">Link rod</option>
                    <option value="Insulator">Insulator</option>
                    <option value="Ball">Ball</option>{" "}
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
                  className="accent-orange-600 w-4 h-4"
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
                  className="flex-1 px-4 py-2 rounded border font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
