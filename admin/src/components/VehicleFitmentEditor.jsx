import React from "react";

const yearInputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-600 focus:outline-none";
const selectClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:border-gray-600 focus:outline-none";

const createEmptyFitment = () => ({
  brandId: "",
  brandName: "",
  brandSlug: "",
  modelId: "",
  modelName: "",
  modelSlug: "",
  yearFrom: "",
  yearTo: "",
});

const toWholeYear = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const validateVehicleFitments = (fitments = [], options = {}) => {
  const { requireAtLeastOne = false } = options;
  const seen = new Set();

  if (requireAtLeastOne && fitments.length === 0) {
    return "Add at least one compatible vehicle or mark the product as universal fit";
  }

  for (let index = 0; index < fitments.length; index += 1) {
    const fitment = fitments[index];
    const rowNumber = index + 1;

    if (!fitment.brandId || !fitment.modelId) {
      return `Vehicle fitment row ${rowNumber} is incomplete`;
    }

    const yearFrom = toWholeYear(fitment.yearFrom);
    const yearTo = toWholeYear(fitment.yearTo);

    if (yearFrom === null || yearTo === null) {
      return `Vehicle fitment row ${rowNumber} needs a valid year range`;
    }

    if (yearFrom > yearTo) {
      return `Vehicle fitment row ${rowNumber} has yearFrom greater than yearTo`;
    }

    const key = [
      fitment.brandId,
      fitment.modelId,
      yearFrom,
      yearTo,
    ].join("::");

    if (seen.has(key)) {
      return `Vehicle fitment row ${rowNumber} is duplicated`;
    }

    seen.add(key);
  }

  return null;
};

const VehicleFitmentEditor = ({
  catalog,
  value,
  onChange,
  disabled = false,
  isUniversalFit = false,
  onUniversalFitChange,
  fitmentRequired = false,
}) => {
  const validationMessage = isUniversalFit
    ? null
    : validateVehicleFitments(value, { requireAtLeastOne: fitmentRequired });
  const fitmentCountLabel =
    value.length === 1 ? "1 fitment" : `${value.length} fitments`;
  const canToggleMode = typeof onUniversalFitChange === "function";

  const updateRow = (index, nextRow) => {
    onChange(value.map((row, rowIndex) => (rowIndex === index ? nextRow : row)));
  };

  const handleBrandChange = (index, brandId) => {
    const selectedBrand = catalog.find((brand) => brand._id === brandId);

    if (!selectedBrand) {
      updateRow(index, createEmptyFitment());
      return;
    }

    updateRow(index, {
      brandId: selectedBrand._id,
      brandName: selectedBrand.name,
      brandSlug: selectedBrand.slug,
      modelId: "",
      modelName: "",
      modelSlug: "",
      yearFrom: "",
      yearTo: "",
    });
  };

  const handleModelChange = (index, modelId) => {
    const currentRow = value[index];
    const selectedBrand = catalog.find((brand) => brand._id === currentRow.brandId);
    const selectedModel = selectedBrand?.models?.find((model) => model._id === modelId);

    if (!selectedModel) {
      updateRow(index, {
        ...currentRow,
        modelId: "",
        modelName: "",
        modelSlug: "",
        yearFrom: "",
        yearTo: "",
      });
      return;
    }

    updateRow(index, {
      ...currentRow,
      modelId: selectedModel._id,
      modelName: selectedModel.name,
      modelSlug: selectedModel.slug,
      yearFrom: selectedModel.yearFrom,
      yearTo: selectedModel.yearTo,
    });
  };

  const handleYearChange = (index, field, nextValue) => {
    const sanitizedValue = nextValue === "" ? "" : Number(nextValue);
    updateRow(index, {
      ...value[index],
      [field]: sanitizedValue,
    });
  };

  const removeRow = (index) => {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  };

  const addRow = () => {
    onChange([...value, createEmptyFitment()]);
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-orange-700">
            Compatibility
          </div>
          <h2 className="mt-3 text-base font-semibold text-gray-800">
            Vehicle Compatibility
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose whether this product is universal or limited to specific
            brands, models, and years.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isUniversalFit
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-orange-200 bg-orange-50 text-orange-700"
            }`}
          >
            {isUniversalFit ? "Universal fit" : fitmentCountLabel}
          </span>
          {!isUniversalFit && (
            <button
              type="button"
              onClick={addRow}
              disabled={disabled || catalog.length === 0}
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Add Fitment
            </button>
          )}
        </div>
      </div>

      {canToggleMode && (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <button
            type="button"
            onClick={() => onUniversalFitChange(false)}
            disabled={disabled}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              !isUniversalFit
                ? "border-orange-300 bg-orange-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            <p className="text-sm font-semibold text-gray-900">Specific vehicles</p>
            <p className="mt-1 text-sm text-gray-500">
              Require one or more brand/model/year rules for this product.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onUniversalFitChange(true)}
            disabled={disabled}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              isUniversalFit
                ? "border-emerald-300 bg-emerald-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            <p className="text-sm font-semibold text-gray-900">Universal fit</p>
            <p className="mt-1 text-sm text-gray-500">
              Show this product for any vehicle search without selecting fitments.
            </p>
          </button>
        </div>
      )}

      {isUniversalFit ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm text-emerald-700">
          This product is marked as universal fit. It will stay visible when a
          shopper filters by vehicle, even without brand/model-specific rules.
        </div>
      ) : catalog.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-500">
          No vehicle brands or models are available yet. Add them from the Vehicles
          admin page first.
        </div>
      ) : value.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-500">
          {fitmentRequired
            ? "This product is set to specific vehicles. Add at least one fitment before saving."
            : "No fitments added yet. Use the button above to tag this product to one or more vehicles."}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {value.map((row, index) => {
            const selectedBrand = catalog.find((brand) => brand._id === row.brandId);
            const modelOptions = selectedBrand?.models || [];

            return (
              <div
                key={`${row.brandId || "brand"}-${row.modelId || "model"}-${index}`}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_0.7fr_0.7fr_auto]">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Brand</label>
                    <select
                      value={row.brandId}
                      onChange={(event) => handleBrandChange(index, event.target.value)}
                      disabled={disabled}
                      className={selectClass}
                    >
                      <option value="">Select vehicle brand</option>
                      {catalog.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Model</label>
                    <select
                      value={row.modelId}
                      onChange={(event) => handleModelChange(index, event.target.value)}
                      disabled={disabled || !row.brandId}
                      className={selectClass}
                    >
                      <option value="">Select vehicle model</option>
                      {modelOptions.map((model) => (
                        <option key={model._id} value={model._id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Year From</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={row.yearFrom}
                      onChange={(event) =>
                        handleYearChange(index, "yearFrom", event.target.value)
                      }
                      disabled={disabled || !row.modelId}
                      className={yearInputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Year To</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={row.yearTo}
                      onChange={(event) =>
                        handleYearChange(index, "yearTo", event.target.value)
                      }
                      disabled={disabled || !row.modelId}
                      className={yearInputClass}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={disabled}
                      className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {row.modelId && (
                  <p className="mt-3 text-xs text-gray-500">
                    Default range from vehicle catalog:
                    {" "}
                    {selectedBrand?.models?.find((model) => model._id === row.modelId)?.yearFrom}
                    {" - "}
                    {selectedBrand?.models?.find((model) => model._id === row.modelId)?.yearTo}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {validationMessage && value.length > 0 && (
        <p className="mt-4 text-sm font-medium text-red-600">{validationMessage}</p>
      )}
    </section>
  );
};

export { createEmptyFitment, validateVehicleFitments };
export default VehicleFitmentEditor;
