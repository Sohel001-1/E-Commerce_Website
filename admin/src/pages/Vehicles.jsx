import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { assets } from "../assets/assets";
import useVehicleAdminCatalog from "../hooks/useVehicleAdminCatalog";

const createBrandForm = () => ({
  id: "",
  name: "",
  sortOrder: 0,
  isActive: true,
});

const createModelForm = () => ({
  id: "",
  brandId: "",
  name: "",
  yearFrom: "",
  yearTo: "",
  sortOrder: 0,
  isActive: true,
});

const resolveVehicleImageUrl = (value) => {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedBackendUrl = String(backendUrl || "").replace(/\/$/, "");
  const normalizedValue = value.startsWith("/") ? value : `/${value}`;

  return `${normalizedBackendUrl}${normalizedValue}`;
};

const Vehicles = ({ token }) => {
  const { vehicleCatalog, isVehicleCatalogLoading, loadVehicleCatalog } =
    useVehicleAdminCatalog(token);
  const [brandForm, setBrandForm] = useState(createBrandForm());
  const [modelForm, setModelForm] = useState(createModelForm());
  const [brandLogo, setBrandLogo] = useState(false);
  const [brandLogoPreview, setBrandLogoPreview] = useState("");
  const [modelImage, setModelImage] = useState(false);
  const [modelImagePreview, setModelImagePreview] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingModel, setSavingModel] = useState(false);
  const [brandFilter, setBrandFilter] = useState("all");

  const allModels = useMemo(
    () =>
      vehicleCatalog.flatMap((brand) =>
        (brand.models || []).map((model) => ({
          ...model,
          brandName: brand.name,
          brandId: brand._id,
        })),
      ),
    [vehicleCatalog],
  );

  const visibleModels =
    brandFilter === "all"
      ? allModels
      : allModels.filter((model) => model.brandId === brandFilter);

  const resetBrandForm = () => {
    setBrandForm(createBrandForm());
    setBrandLogo(false);
    setBrandLogoPreview("");
  };

  const resetModelForm = () => {
    setModelForm((prev) => ({
      ...createModelForm(),
      brandId:
        brandFilter !== "all"
          ? brandFilter
          : vehicleCatalog[0]?._id || "",
    }));
    setModelImage(false);
    setModelImagePreview("");
  };

  const handleBrandSubmit = async (event) => {
    event.preventDefault();

    if (!brandForm.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    if (!brandForm.id && !brandLogo) {
      toast.error("Brand logo is required");
      return;
    }

    try {
      setSavingBrand(true);
      const formData = new FormData();
      formData.append("name", brandForm.name);
      formData.append("sortOrder", brandForm.sortOrder);
      formData.append("isActive", brandForm.isActive);
      if (brandForm.id) {
        formData.append("id", brandForm.id);
      }
      if (brandLogo) {
        formData.append("logo", brandLogo);
      }

      const endpoint = brandForm.id
        ? "/api/vehicle/brand/update"
        : "/api/vehicle/brand/add";

      const { data } = await axios.post(`${backendUrl}${endpoint}`, formData, {
        headers: { token },
      });

      if (data.success) {
        toast.success(data.message);
        resetBrandForm();
        await loadVehicleCatalog();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSavingBrand(false);
    }
  };

  const handleModelSubmit = async (event) => {
    event.preventDefault();

    if (!modelForm.brandId) {
      toast.error("Select a vehicle brand");
      return;
    }

    if (!modelForm.name.trim()) {
      toast.error("Model name is required");
      return;
    }

    if (!modelForm.id && !modelImage) {
      toast.error("Model image is required");
      return;
    }

    if (!modelForm.yearFrom || !modelForm.yearTo) {
      toast.error("Model year range is required");
      return;
    }

    if (Number(modelForm.yearFrom) > Number(modelForm.yearTo)) {
      toast.error("Year from cannot be greater than year to");
      return;
    }

    try {
      setSavingModel(true);
      const formData = new FormData();
      formData.append("brandId", modelForm.brandId);
      formData.append("name", modelForm.name);
      formData.append("yearFrom", modelForm.yearFrom);
      formData.append("yearTo", modelForm.yearTo);
      formData.append("sortOrder", modelForm.sortOrder);
      formData.append("isActive", modelForm.isActive);
      if (modelForm.id) {
        formData.append("id", modelForm.id);
      }
      if (modelImage) {
        formData.append("image", modelImage);
      }

      const endpoint = modelForm.id
        ? "/api/vehicle/model/update"
        : "/api/vehicle/model/add";

      const { data } = await axios.post(`${backendUrl}${endpoint}`, formData, {
        headers: { token },
      });

      if (data.success) {
        toast.success(data.message);
        resetModelForm();
        await loadVehicleCatalog();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSavingModel(false);
    }
  };

  const editBrand = (brand) => {
    setBrandForm({
      id: brand._id,
      name: brand.name,
      sortOrder: brand.sortOrder || 0,
      isActive: brand.isActive,
    });
    setBrandLogo(false);
    setBrandLogoPreview(resolveVehicleImageUrl(brand.logoUrl));
  };

  const editModel = (model) => {
    setModelForm({
      id: model._id,
      brandId: model.brandId,
      name: model.name,
      yearFrom: model.yearFrom,
      yearTo: model.yearTo,
      sortOrder: model.sortOrder || 0,
      isActive: model.isActive,
    });
    setModelImage(false);
    setModelImagePreview(resolveVehicleImageUrl(model.imageUrl));
    setBrandFilter(model.brandId);
  };

  const removeBrand = async (brandId) => {
    if (
      !window.confirm(
        "Remove this vehicle brand? Its models and linked product fitments will also be removed.",
      )
    ) {
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/vehicle/brand/remove`,
        { id: brandId },
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message);
        if (brandForm.id === brandId) {
          resetBrandForm();
        }
        await loadVehicleCatalog();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const removeModel = async (modelId) => {
    if (
      !window.confirm(
        "Remove this vehicle model? Any linked product fitments for this model will also be removed.",
      )
    ) {
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/vehicle/model/remove`,
        { id: modelId },
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message);
        if (modelForm.id === modelId) {
          resetModelForm();
        }
        await loadVehicleCatalog();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Vehicle Catalog</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage vehicle brands, brand logos, model images, and supported year
              ranges for the storefront vehicle search.
            </p>
          </div>
          <button
            type="button"
            onClick={loadVehicleCatalog}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              {brandForm.id ? "Edit Vehicle Brand" : "Add Vehicle Brand"}
            </h2>
            {brandForm.id && (
              <button
                type="button"
                onClick={resetBrandForm}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-800"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleBrandSubmit} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Brand Logo</label>
              <label className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <img
                  src={brandLogoPreview || assets.upload_area}
                  alt="Brand logo preview"
                  className="h-full w-full object-contain"
                />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || false;
                    setBrandLogo(nextFile);
                    setBrandLogoPreview(
                      nextFile ? URL.createObjectURL(nextFile) : "",
                    );
                  }}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Brand Name</label>
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(event) =>
                    setBrandForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
                  placeholder="Toyota"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  value={brandForm.sortOrder}
                  onChange={(event) =>
                    setBrandForm((prev) => ({
                      ...prev,
                      sortOrder: Number(event.target.value || 0),
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={brandForm.isActive}
                onChange={() =>
                  setBrandForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
              />
              Active in storefront
            </label>

            <button
              type="submit"
              disabled={savingBrand}
              className="rounded bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {savingBrand
                ? "Saving..."
                : brandForm.id
                  ? "Update Brand"
                  : "Add Brand"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              {modelForm.id ? "Edit Vehicle Model" : "Add Vehicle Model"}
            </h2>
            {modelForm.id && (
              <button
                type="button"
                onClick={resetModelForm}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-800"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleModelSubmit} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Model Image</label>
              <label className="flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <img
                  src={modelImagePreview || assets.upload_area}
                  alt="Model preview"
                  className="h-full w-full object-contain bg-white p-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || false;
                    setModelImage(nextFile);
                    setModelImagePreview(
                      nextFile ? URL.createObjectURL(nextFile) : "",
                    );
                  }}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Brand</label>
                <select
                  value={modelForm.brandId}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, brandId: event.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 bg-white focus:border-gray-600 focus:outline-none"
                >
                  <option value="">Select brand</option>
                  {vehicleCatalog.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Model Name</label>
                <input
                  type="text"
                  value={modelForm.name}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
                  placeholder="Corolla Axio"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Year From</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={modelForm.yearFrom}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, yearFrom: event.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Year To</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={modelForm.yearTo}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, yearTo: event.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  value={modelForm.sortOrder}
                  onChange={(event) =>
                    setModelForm((prev) => ({
                      ...prev,
                      sortOrder: Number(event.target.value || 0),
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-600 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={modelForm.isActive}
                onChange={() =>
                  setModelForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
              />
              Active in storefront
            </label>

            <button
              type="submit"
              disabled={savingModel || vehicleCatalog.length === 0}
              className="rounded bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {savingModel
                ? "Saving..."
                : modelForm.id
                  ? "Update Model"
                  : "Add Model"}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-gray-800">Vehicle Brands</h2>

        {isVehicleCatalogLoading ? (
          <p className="mt-4 text-sm text-gray-500">Loading brands...</p>
        ) : vehicleCatalog.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No vehicle brands yet. Add your first brand above.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vehicleCatalog.map((brand) => (
              <div
                key={brand._id}
                className="rounded-xl border border-gray-200 p-4 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={resolveVehicleImageUrl(brand.logoUrl)}
                    alt={brand.name}
                    className="h-16 w-16 rounded-lg border border-gray-100 object-contain bg-white p-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{brand.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          brand.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {brand.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {brand.models?.length || 0} models
                    </p>
                    <p className="text-sm text-gray-500">Sort order: {brand.sortOrder}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => editBrand(brand)}
                    className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBrand(brand._id)}
                    className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Vehicle Models</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage model images and supported year ranges used in the storefront
              selector.
            </p>
          </div>

          <select
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:border-gray-600 focus:outline-none"
          >
            <option value="all">All brands</option>
            {vehicleCatalog.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {isVehicleCatalogLoading ? (
          <p className="mt-4 text-sm text-gray-500">Loading models...</p>
        ) : visibleModels.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No vehicle models found for this filter yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {visibleModels.map((model) => (
              <div
                key={model._id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row"
              >
                <img
                  src={resolveVehicleImageUrl(model.imageUrl)}
                  alt={model.name}
                  className="h-28 w-full rounded-lg border border-gray-100 bg-white object-contain p-2 sm:w-40"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{model.name}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                      {model.brandName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        model.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {model.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Years: {model.yearFrom} - {model.yearTo}
                  </p>
                  <p className="text-sm text-gray-500">Sort order: {model.sortOrder}</p>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => editModel(model)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModel(model._id)}
                      className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Vehicles;
