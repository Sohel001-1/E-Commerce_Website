import React, { useState, useEffect } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "Engine",
    subCategory: "General",
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
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
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
      category: item.category || "Engine",
      subCategory: item.subCategory || "General",
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
    if (!editForm.description.trim()) return toast.error("Description is required");
    if (editForm.price === "" || Number(editForm.price) <= 0) return toast.error("Valid price is required");

    try {
      setSaving(true);

      // ✅ adjust this endpoint to match your backend
      const response = await axios.post(
        backendUrl + "/api/product/update",
        {
          id: editForm.id,
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
          category: editForm.category,
          subCategory: editForm.subCategory,
          bestseller: editForm.bestseller,
        },
        { headers: { token } }
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
    return (
      name.includes(searchTerm.toLowerCase()) ||
      category.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <p className="font-semibold">ALL PRODUCT LIST</p>

        <input
          type="text"
          placeholder="Search by name or category..."
          className="border border-gray-300 rounded-md px-3 py-1.5 w-full md:w-64 outline-none focus:border-gray-500 transition-all"
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
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b className="text-center">Actions</b>
          </div>

          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 items-center py-2 px-3 border text-sm"
              >
                <img
                  src={item.image?.[0]}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />

                <div className="flex flex-col">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.bestseller && (
                    <span className="text-[11px] mt-0.5 w-fit px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      Bestseller
                    </span>
                  )}
                </div>

                <p>{item.category}</p>
                <p>${item.price}</p>

                <div className="flex items-center justify-center gap-3">
                  <MdEdit
                    onClick={() => openEdit(item)}
                    className="text-xl cursor-pointer text-blue-600 hover:text-blue-800"
                    title="Edit"
                  />
                  <MdDelete
                    onClick={() => handleRemove(item._id)}
                    className="text-xl cursor-pointer text-red-500 hover:text-red-700"
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
            className="absolute inset-0 bg-black/40"
            onClick={closeEdit}
          />

          <div className="relative w-full max-w-xl rounded-xl bg-white shadow-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Edit Product</h2>
              <button
                onClick={closeEdit}
                className="px-2 py-1 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <div>
                <p className="text-sm mb-1">Name</p>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  type="text"
                  required
                />
              </div>

              <div>
                <p className="text-sm mb-1">Description</p>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded min-h-[90px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-sm mb-1">Category</p>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="Engine">Engine</option>
                    <option value="Brake">Brake</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Ignition">Ignition</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Body">Body</option>
                    <option value="Wheels">Wheels</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm mb-1">Sub Category</p>
                  <select
                    value={editForm.subCategory}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subCategory: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="Tires">Tires</option>
          <option value="Engine Mounts">Engine Mounts</option>
          <option value="Spark Plugs">Spark Plugs</option>
          <option value="Batteries">Batteries</option>
          <option value="Headlights">Headlights</option>
          <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm mb-1">Price</p>
                  <input
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm mt-1">
                <input
                  type="checkbox"
                  checked={editForm.bestseller}
                  onChange={() =>
                    setEditForm({ ...editForm, bestseller: !editForm.bestseller })
                  }
                />
                Bestseller
              </label>

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 rounded bg-black text-white ${
                    saving ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800"
                  }`}
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
