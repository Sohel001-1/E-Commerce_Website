import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CarFront, Search, X } from "lucide-react";
import { ShopContext } from "../context/ShopContext";

const VEHICLE_YEAR_CAP = 2026;

const parseOptionalYear = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const clampYear = (value, min, max) => Math.min(max, Math.max(min, value));
const getSelectableYearBounds = (model) => {
  if (!model) {
    return { min: null, max: null };
  }

  const max = Math.min(model.yearTo, VEHICLE_YEAR_CAP);
  const min = Math.min(model.yearFrom, max);

  return { min, max };
};

const buildYearRangeLabel = (yearFrom, yearTo, placeholder = "Add Year") => {
  if (!Number.isInteger(yearFrom) || !Number.isInteger(yearTo)) {
    return placeholder;
  }

  return yearFrom === yearTo ? String(yearFrom) : `${yearFrom} - ${yearTo}`;
};

const buildRangeMarks = (min, max) => {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return [];
  }

  if (min === max) {
    return [min];
  }

  const marks = Array.from({ length: 5 }, (_, index) =>
    Math.round(min + ((max - min) * index) / 4),
  );

  return [...new Set(marks.map((mark) => clampYear(mark, min, max)))];
};

const resolveVehicleImageUrl = (backendUrl, value) => {
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

const resolveRequestedRange = (model, requestedFrom, requestedTo) => {
  if (!model) {
    return { from: null, to: null };
  }

  const { min, max } = getSelectableYearBounds(model);

  const fallbackFrom =
    Number.isInteger(requestedFrom) && Number.isInteger(requestedTo)
      ? Math.min(requestedFrom, requestedTo)
      : Number.isInteger(requestedFrom)
        ? requestedFrom
        : Number.isInteger(requestedTo)
          ? requestedTo
          : min;

  const fallbackTo =
    Number.isInteger(requestedFrom) && Number.isInteger(requestedTo)
      ? Math.max(requestedFrom, requestedTo)
      : Number.isInteger(requestedTo)
        ? requestedTo
        : Number.isInteger(requestedFrom)
          ? requestedFrom
          : max;

  const clampedFrom = clampYear(fallbackFrom, min, max);
  const clampedTo = clampYear(fallbackTo, min, max);

  return {
    from: Math.min(clampedFrom, clampedTo),
    to: Math.max(clampedFrom, clampedTo),
  };
};

const buildVehicleCollectionUrl = ({ brand, model, yearFrom, yearTo }) => {
  const params = new URLSearchParams();
  params.set("vehicleBrandSlug", brand.slug);
  params.set("vehicleBrandName", brand.name);
  params.set("vehicleModelSlug", model.slug);
  params.set("vehicleModelName", model.name);
  params.set("vehicleYearFrom", String(yearFrom));
  params.set("vehicleYearTo", String(yearTo));

  if (yearFrom === yearTo) {
    params.set("vehicleYear", String(yearFrom));
  }

  return `/collection?${params.toString()}`;
};

const SelectionField = ({
  label,
  value,
  placeholder,
  active = false,
  onClick,
  disabled = false,
}) => {
  const content = (
    <>
      <p className="text-sm font-bold text-surface-900">{label}</p>
      <p
        className={`mt-1 text-xl leading-tight ${
          value ? "font-medium text-surface-900" : "text-surface-400"
        }`}
      >
        {value || placeholder}
      </p>
    </>
  );

  const className = `min-w-0 flex-1 rounded-[1.75rem] border px-5 py-4 text-left transition ${
    active ? "border-orange-200 bg-orange-50" : "border-transparent bg-white/0"
  } ${onClick && !disabled ? "cursor-pointer hover:bg-surface-50" : ""} ${
    disabled ? "opacity-60" : ""
  }`;

  if (onClick && !disabled) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
};

const YearRangeSlider = ({ min, max, valueFrom, valueTo, onChange }) => {
  const marks = useMemo(() => buildRangeMarks(min, max), [min, max]);
  const span = Math.max(max - min, 1);
  const startPercent = ((valueFrom - min) / span) * 100;
  const endPercent = ((valueTo - min) / span) * 100;

  return (
    <div className="mt-8">
      <div className="relative pt-4">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-surface-200" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#3b82f6]"
          style={{
            left: `${startPercent}%`,
            right: `${100 - endPercent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={valueFrom}
          onChange={(event) => {
            const nextValue = Math.min(Number(event.target.value), valueTo);
            onChange({ from: nextValue, to: valueTo });
          }}
          className="pointer-events-none relative z-10 h-10 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-10px] [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#3b82f6] [&::-webkit-slider-thumb]:shadow-[0_10px_25px_rgba(59,130,246,0.35)] [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#3b82f6] [&::-moz-range-thumb]:shadow-[0_10px_25px_rgba(59,130,246,0.35)]"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueTo}
          onChange={(event) => {
            const nextValue = Math.max(Number(event.target.value), valueFrom);
            onChange({ from: valueFrom, to: nextValue });
          }}
          className="pointer-events-none absolute inset-0 z-20 h-10 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-10px] [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#3b82f6] [&::-webkit-slider-thumb]:shadow-[0_10px_25px_rgba(59,130,246,0.35)] [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#3b82f6] [&::-moz-range-thumb]:shadow-[0_10px_25px_rgba(59,130,246,0.35)]"
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm font-medium text-surface-600">
        {marks.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>
    </div>
  );
};

const Vehicle = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelSearch, setModelSearch] = useState("");
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });

  const pathSegments = useMemo(
    () => location.pathname.split("/").filter(Boolean).slice(1),
    [location.pathname],
  );

  const requestedBrandSlug =
    pathSegments[0] ||
    searchParams.get("brand") ||
    searchParams.get("vehicleBrandSlug") ||
    "";
  const requestedModelSlug =
    pathSegments[1] ||
    searchParams.get("model") ||
    searchParams.get("vehicleModelSlug") ||
    "";
  const requestedYearFrom = parseOptionalYear(
    searchParams.get("yearFrom") ||
      searchParams.get("vehicleYearFrom") ||
      searchParams.get("year") ||
      searchParams.get("vehicleYear"),
  );
  const requestedYearTo = parseOptionalYear(
    searchParams.get("yearTo") ||
      searchParams.get("vehicleYearTo") ||
      searchParams.get("year") ||
      searchParams.get("vehicleYear"),
  );

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/vehicle/catalog`, {
          timeout: 12000,
        });
        if (data.success) {
          setCatalog(data.brands || []);
        } else {
          setCatalog([]);
        }
      } catch (error) {
        console.error("Failed to load vehicle catalog", error);
        setCatalog([]);
      } finally {
        setLoading(false);
      }
    };

    if (backendUrl) {
      loadCatalog();
    }
  }, [backendUrl]);

  const selectedBrand = useMemo(
    () => catalog.find((brand) => brand.slug === requestedBrandSlug) || null,
    [catalog, requestedBrandSlug],
  );

  const selectedModel = useMemo(
    () =>
      selectedBrand?.models?.find(
        (model) => model.slug === requestedModelSlug,
      ) || null,
    [selectedBrand, requestedModelSlug],
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (requestedBrandSlug && !selectedBrand) {
      navigate("/vehicle", { replace: true });
      return;
    }

    if (selectedBrand && requestedModelSlug && !selectedModel) {
      navigate(`/vehicle/${selectedBrand.slug}`, { replace: true });
      return;
    }

    const canonicalPath = selectedModel
      ? `/vehicle/${selectedBrand.slug}/${selectedModel.slug}`
      : selectedBrand
        ? `/vehicle/${selectedBrand.slug}`
        : "/vehicle";

    if (location.pathname !== canonicalPath) {
      navigate(`${canonicalPath}${location.search}`, { replace: true });
    }
  }, [
    loading,
    location.pathname,
    location.search,
    navigate,
    requestedBrandSlug,
    requestedModelSlug,
    selectedBrand,
    selectedModel,
  ]);

  useEffect(() => {
    setModelSearch("");
  }, [selectedBrand?.slug]);

  useEffect(() => {
    setSelectedRange(
      resolveRequestedRange(selectedModel, requestedYearFrom, requestedYearTo),
    );
  }, [selectedModel, requestedYearFrom, requestedYearTo]);

  const currentStep = selectedModel
    ? "year"
    : selectedBrand
      ? "model"
      : "brand";

  const filteredModels = useMemo(() => {
    const models = selectedBrand?.models || [];
    const normalizedQuery = modelSearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return models;
    }

    return models.filter((model) =>
      model.name.toLowerCase().includes(normalizedQuery),
    );
  }, [modelSearch, selectedBrand]);

  const selectedRangeLabel = buildYearRangeLabel(
    selectedRange.from,
    selectedRange.to,
  );
  const yearCardLabel =
    selectedBrand && selectedModel
      ? `${selectedBrand.name} ${selectedModel.name}`
      : "Choose your vehicle";
  const selectableYearBounds = useMemo(
    () => getSelectableYearBounds(selectedModel),
    [selectedModel],
  );

  const selectBrand = (brand) => {
    navigate(`/vehicle/${brand.slug}`);
  };

  const selectModel = (model) => {
    navigate(`/vehicle/${selectedBrand.slug}/${model.slug}`);
  };

  const resetSelection = () => {
    navigate("/vehicle");
  };

  const submitVehicleSearch = () => {
    if (
      !selectedBrand ||
      !selectedModel ||
      !Number.isInteger(selectedRange.from) ||
      !Number.isInteger(selectedRange.to)
    ) {
      return;
    }

    navigate(
      buildVehicleCollectionUrl({
        brand: selectedBrand,
        model: selectedModel,
        yearFrom: selectedRange.from,
        yearTo: selectedRange.to,
      }),
    );
  };

  const renderBrandPage = () => (
    <section className="mt-8 bg-[#ececec] px-5 py-10 sm:px-8 lg:px-10">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f08c55]">
          Step 1
        </p>
        <h2 className="mt-2 text-[38px] font-semibold leading-[1.05] text-[#1f1f1f] sm:text-[44px] lg:text-[50px]">
          Choose a brand
        </h2>
        <p className="mt-3 text-sm text-[#7b7b7b] sm:text-base">
          Start by selecting the make. We will take you to a dedicated model
          page next.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {catalog.map((brand) => (
          <button
            key={brand._id}
            type="button"
            onClick={() => selectBrand(brand)}
            className="group flex flex-col items-center justify-start px-4 text-center transition hover:-translate-y-0.5"
          >
            <div className="flex h-24 w-full max-w-[220px] items-center justify-center sm:h-28 lg:h-32">
              <img
                src={resolveVehicleImageUrl(backendUrl, brand.logoUrl)}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-5 text-sm font-medium uppercase tracking-[0.08em] text-[#808080] sm:text-[15px]">
              {brand.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );

  const renderModelPage = () => (
    <section className="mt-10">
      <button
        type="button"
        onClick={resetSelection}
        className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 transition hover:text-surface-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to brands
      </button>

      <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-600">
            Step 2
          </p>
          <h2 className="mt-2 text-2xl font-bold text-surface-900 sm:text-3xl">
            Search or choose a model
          </h2>
          <p className="mt-3 text-sm text-surface-500 sm:text-base">
            Showing models for {selectedBrand.name}. Type to narrow the list, or
            choose directly from the gallery.
          </p>
        </div>

        <label className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={modelSearch}
            onChange={(event) => setModelSearch(event.target.value)}
            placeholder={`Search ${selectedBrand.name} models`}
            className="w-full rounded-full border border-surface-200 bg-white px-14 py-4 text-base text-surface-900 shadow-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          />
        </label>
      </div>

      {selectedBrand.models?.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-surface-300 bg-surface-50 px-6 py-10 text-center text-sm text-surface-500">
          No models have been added for {selectedBrand.name} yet.
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-surface-300 bg-surface-50 px-6 py-10 text-center text-sm text-surface-500">
          No models matched “{modelSearch}”.
        </div>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-2">
          {filteredModels.map((model) => (
            <button
              key={model._id}
              type="button"
              onClick={() => selectModel(model)}
              className="group text-left transition hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-surface-200 [clip-path:polygon(0_0,100%_0,97%_100%,0_100%)] transition group-hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <img
                  src={resolveVehicleImageUrl(backendUrl, model.imageUrl)}
                  alt={model.name}
                  className="aspect-[2.85/1] w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-2xl font-medium uppercase tracking-tight text-surface-900 sm:text-3xl">
                  {model.name}
                </p>
                <ArrowRight className="h-5 w-5 text-orange-500 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  const renderYearPage = () => (
    <section className="mt-10">
      <button
        type="button"
        onClick={() => navigate(`/vehicle/${selectedBrand.slug}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 transition hover:text-surface-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to models
      </button>

      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] xl:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-600">
            Step 3
          </p>
          <h2 className="mt-2 text-2xl font-bold text-surface-900 sm:text-3xl">
            Choose the year range
          </h2>
          <p className="mt-3 text-sm text-surface-500 sm:text-base">
            Adjust the start and end years for {yearCardLabel}. We will use that
            range to show compatible products.
          </p>

          <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-surface-200 [clip-path:polygon(0_0,100%_0,97%_100%,0_100%)]">
            <img
              src={resolveVehicleImageUrl(backendUrl, selectedModel.imageUrl)}
              alt={selectedModel.name}
              className="aspect-[2.85/1] w-full object-contain"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-surface-100 px-4 py-2 text-sm font-semibold text-surface-700">
              {selectedBrand.name}
            </span>
            <span className="rounded-full bg-surface-100 px-4 py-2 text-sm font-semibold text-surface-700">
              {selectedModel.name}
            </span>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
              {selectedRangeLabel}
            </span>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/80 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <p className="text-center text-2xl font-semibold text-surface-900">
            Select year range
          </p>

          <YearRangeSlider
            min={selectableYearBounds.min}
            max={selectableYearBounds.max}
            valueFrom={selectedRange.from ?? selectableYearBounds.min}
            valueTo={selectedRange.to ?? selectableYearBounds.max}
            onChange={setSelectedRange}
          />

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-[1.5rem] border border-surface-200 bg-surface-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-surface-500">
                Start Year
              </p>
              <p className="mt-2 text-2xl font-semibold text-surface-900">
                {selectedRange.from}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-surface-200 bg-surface-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-surface-500">
                End Year
              </p>
              <p className="mt-2 text-2xl font-semibold text-surface-900">
                {selectedRange.to}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={submitVehicleSearch}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ea580c] px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#c2410c]"
            >
              View compatible products
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(`/vehicle/${selectedBrand.slug}`)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-surface-200 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-surface-600 transition hover:bg-surface-50"
            >
              Change model
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="pt-10 pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-surface-200 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_32%),linear-gradient(135deg,_#f8fafc,_#ffffff_52%,_#fff7ed)] px-6 py-8 shadow-sm sm:px-8 lg:px-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(135deg,rgba(15,23,42,0.05),transparent)] lg:block" />
        <div className="relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-orange-600">
              <CarFront className="h-4 w-4" />
              Vehicle Search
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-surface-900 sm:text-4xl lg:text-5xl">
              {currentStep === "brand"
                ? "Choose your vehicle make"
                : currentStep === "model"
                  ? `Select a ${selectedBrand?.name} model`
                  : `Set the year range for ${selectedModel?.name}`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-surface-600 sm:text-base">
              Move through the selector one step at a time: pick a make, choose
              a model, then set the year range before opening compatible
              products.
            </p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/92 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <SelectionField
                label="Make"
                value={selectedBrand?.name}
                placeholder="Add Make"
                active={currentStep === "brand"}
                onClick={selectedBrand ? resetSelection : undefined}
              />
              <div className="hidden h-12 w-px bg-surface-200 lg:block" />
              <SelectionField
                label="Model"
                value={selectedModel?.name}
                placeholder="Add Model"
                active={currentStep === "model"}
                onClick={
                  selectedBrand && selectedModel
                    ? () => navigate(`/vehicle/${selectedBrand.slug}`)
                    : undefined
                }
              />
              <div className="hidden h-12 w-px bg-surface-200 lg:block" />
              <SelectionField
                label="Year"
                value={currentStep === "year" ? selectedRangeLabel : ""}
                placeholder="Add Year"
                active={currentStep === "year"}
              />
              <div className="hidden h-12 w-px bg-surface-200 lg:block" />
              <SelectionField
                label="Engine"
                value=""
                placeholder="Add Engine"
                disabled
              />
              <button
                type="button"
                onClick={resetSelection}
                className="flex h-16 w-16 shrink-0 items-center justify-center self-end rounded-full bg-[#ea8a2f] text-white transition hover:bg-[#d97819] lg:self-center"
                aria-label="Reset vehicle search"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-44 rounded-3xl border border-surface-200 skeleton-pulse"
            />
          ))}
        </div>
      ) : catalog.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-surface-300 bg-surface-50 px-6 py-12 text-center">
          <h2 className="text-xl font-semibold text-surface-900">
            Vehicle catalog is not ready yet
          </h2>
          <p className="mt-3 text-sm text-surface-500">
            Add vehicle brands, logos, models, and model images from the admin
            Vehicles page to enable this storefront search flow.
          </p>
        </div>
      ) : currentStep === "brand" ? (
        renderBrandPage()
      ) : currentStep === "model" ? (
        renderModelPage()
      ) : (
        renderYearPage()
      )}
    </div>
  );
};

export default Vehicle;
