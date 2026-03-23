import React, { useState, useEffect } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";
import SearchableSelect from "../components/SearchableSelect";
import { subCategories } from "../assets/subCategories";
import { brands } from "../assets/brands";
import { importCountries, originCountries } from "../assets/countries";
import { unitSizes } from "../assets/unitSizes";
import { saeViscosities } from "../assets/sae";
import { oilTypes } from "../assets/oilTypes";
import { apiOptions } from "../assets/apiOptions";
import { aceaOptions } from "../assets/aceaOptions";
import { appropriateUseOptions } from "../assets/appropriateUse";
import { assets } from "../assets/assets";
import useVehicleAdminCatalog from "../hooks/useVehicleAdminCatalog";
import VehicleFitmentEditor, {
  validateVehicleFitments,
} from "../components/VehicleFitmentEditor";

const categoryOptions = Object.keys(subCategories);

const mergeCurrentOption = (options, currentValue) => {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
};

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [untaggedOnly, setUntaggedOnly] = useState(false);

  // ✅ Edit modal state - Updated with Brand field
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: categoryOptions[0] || "",
    subCategory: "",
    brand: brands[0] || "",
    countryOfOrigin: "",
    countryOfImport: "",
    unitSize: "",
    sae: "",
    oilType: "",
    api: "",
    acea: "",
    appropriateUse: "",
    stock: "",
    bestseller: false,
    isUniversalFit: false,
  });

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [editVehicleFitments, setEditVehicleFitments] = useState([]);
  const { vehicleCatalog, isVehicleCatalogLoading } = useVehicleAdminCatalog(token);
  const editCategoryOptions = mergeCurrentOption(categoryOptions, editForm.category);
  const editSubCategoryOptions = mergeCurrentOption(
    subCategories[editForm.category] || [],
    editForm.subCategory,
  );
  const editBrandOptions = mergeCurrentOption(brands, editForm.brand);
  const editOriginCountryOptions = mergeCurrentOption(originCountries, editForm.countryOfOrigin);
  const editImportCountryOptions = mergeCurrentOption(importCountries, editForm.countryOfImport);
  const editSaeOptions = mergeCurrentOption(saeViscosities, editForm.sae);
  const editOilTypeOptions = mergeCurrentOption(oilTypes, editForm.oilType);
  const editApiOptions = mergeCurrentOption(apiOptions, editForm.api);
  const editAceaOptions = mergeCurrentOption(aceaOptions, editForm.acea);
  const editAppropriateUseOptions = mergeCurrentOption(
    appropriateUseOptions,
    editForm.appropriateUse,
  );

  const ImageUploadSlot = ({ id, image, setImage, existingImage, onRemoveExisting }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setImage(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    };

    return (
      <div
        className={`relative transition-all duration-200 ${isDragging ? "bg-orange-50 scale-105" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label htmlFor={id}>
          <img
            className={`w-16 h-16 md:w-20 md:h-20 object-cover cursor-pointer border border-dashed p-1 ${isDragging ? "border-orange-500 shadow-glow" : "border-gray-400"}`}
            src={!image ? (existingImage ? existingImage : assets.upload_area) : URL.createObjectURL(image)}
            alt=""
          />
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id={id}
            hidden
          />
        </label>
        {(image || existingImage) && (
          <div
            onClick={() => {
              if (image) setImage(false);
              if (existingImage && onRemoveExisting) onRemoveExisting();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer hover:bg-red-600 hover:scale-110 transition-all z-10"
          >
            ✕
          </div>
        )}
      </div>
    );
  };

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
      salePrice: item.salePrice ?? "",
      category: item.category || categoryOptions[0] || "",
      subCategory: item.subCategory || "",
      brand: item.brand || brands[0] || "",
      countryOfOrigin: item.countryOfOrigin || "",
      countryOfImport: item.countryOfImport || "",
      unitSize: item.unitSize || "",
      sae: item.sae || "",
      oilType: item.oilType || "",
      api: item.api || "",
      acea: item.acea || "",
      appropriateUse: item.appropriateUse || "",
      stock: item.stock ?? "",
      bestseller: !!item.bestseller,
      isUniversalFit: !!item.isUniversalFit,
    });
    setImage1(false);
    setImage2(false);
    setImage3(false);
    setImage4(false);
    setExistingImages(item.image || []);
    setEditVehicleFitments(item.vehicleFitments || []);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditVehicleFitments([]);
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
      const fitmentError = editForm.isUniversalFit
        ? null
        : validateVehicleFitments(editVehicleFitments, {
            requireAtLeastOne: true,
          });
      if (fitmentError) {
        toast.error(fitmentError);
        return;
      }

      setSaving(true);

      const formData = new FormData();
      formData.append("id", editForm.id);
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("price", Number(editForm.price));
      if (editForm.salePrice) formData.append("salePrice", Number(editForm.salePrice));
      formData.append("category", editForm.category);
      formData.append("subCategory", editForm.subCategory);
      formData.append("brand", editForm.brand);
      formData.append("countryOfOrigin", editForm.countryOfOrigin);
      formData.append("countryOfImport", editForm.countryOfImport);
      formData.append("unitSize", editForm.unitSize);
      formData.append("sae", editForm.sae);
      formData.append("oilType", editForm.oilType);
      formData.append("api", editForm.api);
      formData.append("acea", editForm.acea);
      formData.append("appropriateUse", editForm.appropriateUse);
      formData.append("stock", Number(editForm.stock));
      formData.append("bestseller", editForm.bestseller);
      formData.append("isUniversalFit", editForm.isUniversalFit);
      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("vehicleFitments", JSON.stringify(editVehicleFitments));

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/update",
        formData,
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
    const matchesSearch = (
      name.includes(searchTerm.toLowerCase()) ||
      category.includes(searchTerm.toLowerCase()) ||
      brand.includes(searchTerm.toLowerCase())
    );

    if (!matchesSearch) {
      return false;
    }

    if (!untaggedOnly) {
      return true;
    }

    return !item.isUniversalFit && (!item.vehicleFitments || item.vehicleFitments.length === 0);
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <p className="font-semibold">ALL PRODUCT LIST</p>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <input
              type="checkbox"
              checked={untaggedOnly}
              onChange={() => setUntaggedOnly((prev) => !prev)}
            />
            Show products needing compatibility setup only
          </label>

          <input
            type="text"
            placeholder="Search by name, brand, or category..."
            className="border border-gray-300 rounded-md px-3 py-1.5 w-full md:w-64 outline-none focus:border-gray-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] gap-2 items-center py-2 px-3 border bg-gray-100 text-sm">
            <b>Image</b>
            <b>Name & Brand</b>
            <b>Category</b>
            <b>Price</b>
            <b>Stock</b>
            <b>Fitments</b>
            <b className="text-center">Actions</b>
          </div>

          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] gap-2 items-center py-2 px-3 border text-sm hover:bg-gray-50 transition-colors"
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
                <div>
                  {item.salePrice > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-red-500 font-bold">৳{item.salePrice}</span>
                      <span className="text-gray-400 line-through text-xs">৳{item.price}</span>
                    </div>
                  ) : (
                    <span>৳{item.price}</span>
                  )}
                </div>
                <p className={`${item.stock <= 5 ? "text-red-600 font-bold" : "text-green-600 font-medium"}`}>{item.stock}</p>
                <div>
                  {item.isUniversalFit ? (
                    <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      Universal fit
                    </span>
                  ) : item.vehicleFitments?.length ? (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {item.vehicleFitments.length} fitments
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Needs setup
                    </span>
                  )}
                </div>

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

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl border p-6">
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
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Update Images <span className="text-xs text-gray-500 font-normal">(Uploading new images will replace existing ones)</span></p>
                </div>
                <div className="flex gap-3">
                  <ImageUploadSlot id="edit_image1" image={image1} setImage={setImage1} existingImage={existingImages[0]} onRemoveExisting={() => setExistingImages(prev => { const arr = [...prev]; arr[0] = null; return arr; })} />
                  <ImageUploadSlot id="edit_image2" image={image2} setImage={setImage2} existingImage={existingImages[1]} onRemoveExisting={() => setExistingImages(prev => { const arr = [...prev]; arr[1] = null; return arr; })} />
                  <ImageUploadSlot id="edit_image3" image={image3} setImage={setImage3} existingImage={existingImages[2]} onRemoveExisting={() => setExistingImages(prev => { const arr = [...prev]; arr[2] = null; return arr; })} />
                  <ImageUploadSlot id="edit_image4" image={image4} setImage={setImage4} existingImage={existingImages[3]} onRemoveExisting={() => setExistingImages(prev => { const arr = [...prev]; arr[3] = null; return arr; })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-sm font-medium mb-1">Regular Price</p>
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
                <div>
                  <p className="text-sm font-medium mb-1">Sale Price</p>
                  <input
                    value={editForm.salePrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, salePrice: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Stock</p>
                  <input
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                    type="number"
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
                  <SearchableSelect
                    id="edit-category"
                    options={editCategoryOptions}
                    value={editForm.category}
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        category: value,
                        subCategory:
                          value === editForm.category
                            ? editForm.subCategory
                            : "",
                      })
                    }
                    placeholder="Select Category"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Sub Category</p>
                  <SearchableSelect
                    id="edit-sub-category"
                    options={editSubCategoryOptions}
                    value={editForm.subCategory}
                    onChange={(value) =>
                      setEditForm({ ...editForm, subCategory: value })
                    }
                    placeholder="Select Sub Category"
                  />
                </div>


                {/* Advanced Filters Dropdowns for Edit */}
                <div>
                  <p className="text-sm font-medium mb-1">Country of Origin</p>
                  <SearchableSelect
                    id="edit-country-origin"
                    options={editOriginCountryOptions}
                    value={editForm.countryOfOrigin}
                    onChange={(value) =>
                      setEditForm({ ...editForm, countryOfOrigin: value })
                    }
                    placeholder="Select Country of Origin"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Country of Import</p>
                  <SearchableSelect
                    id="edit-country-import"
                    options={editImportCountryOptions}
                    value={editForm.countryOfImport}
                    onChange={(value) =>
                      setEditForm({ ...editForm, countryOfImport: value })
                    }
                    placeholder="Select Country of Import"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Unit Size</p>
                  <input
                    type="text"
                    list="edit-unit-size-options"
                    value={editForm.unitSize}
                    onChange={(e) =>
                      setEditForm({ ...editForm, unitSize: e.target.value })
                    }
                    placeholder="e.g. 5L, 1 Gallon"
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-gray-600"
                  />
                  <datalist id="edit-unit-size-options">
                    {unitSizes.map((size) => (
                      <option key={size} value={size} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">SAE</p>
                  <SearchableSelect
                    id="edit-sae"
                    options={editSaeOptions}
                    value={editForm.sae}
                    onChange={(value) =>
                      setEditForm({ ...editForm, sae: value })
                    }
                    placeholder="Select SAE"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Oil Type</p>
                  <SearchableSelect
                    id="edit-oil-type"
                    options={editOilTypeOptions}
                    value={editForm.oilType}
                    onChange={(value) =>
                      setEditForm({ ...editForm, oilType: value })
                    }
                    placeholder="Select Oil Type"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">API</p>
                  <SearchableSelect
                    id="edit-api"
                    options={editApiOptions}
                    value={editForm.api}
                    onChange={(value) =>
                      setEditForm({ ...editForm, api: value })
                    }
                    placeholder="Select API"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">ACEA</p>
                  <SearchableSelect
                    id="edit-acea"
                    options={editAceaOptions}
                    value={editForm.acea}
                    onChange={(value) =>
                      setEditForm({ ...editForm, acea: value })
                    }
                    placeholder="Select ACEA"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Appropriate Use</p>
                  <SearchableSelect
                    id="edit-appropriate-use"
                    options={editAppropriateUseOptions}
                    value={editForm.appropriateUse}
                    onChange={(value) =>
                      setEditForm({ ...editForm, appropriateUse: value })
                    }
                    placeholder="Select Appropriate Use"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Brand</p>
                  <SearchableSelect
                    id="edit-brand"
                    options={editBrandOptions}
                    value={editForm.brand}
                    onChange={(value) =>
                      setEditForm({ ...editForm, brand: value })
                    }
                    placeholder="Select Brand"
                  />
                </div>
              </div>

              <VehicleFitmentEditor
                catalog={vehicleCatalog}
                value={editVehicleFitments}
                onChange={setEditVehicleFitments}
                isUniversalFit={editForm.isUniversalFit}
                onUniversalFitChange={(value) =>
                  setEditForm((prev) => ({ ...prev, isUniversalFit: value }))
                }
                fitmentRequired={!editForm.isUniversalFit}
                disabled={saving || isVehicleCatalogLoading}
              />

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
