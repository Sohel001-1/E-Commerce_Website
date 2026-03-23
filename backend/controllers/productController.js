import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import applyWatermark from "../middleware/watermarkImage.js";
import { normalizeVehicleFitments } from "../utils/vehicleUtils.js";

// Helper: parse boolean safely (true/false OR "true"/"false")
const parseBoolean = (val) => val === true || val === "true";
const FILTERABLE_FIELDS = [
  "category",
  "subCategory",
  "brand",
  "countryOfOrigin",
  "countryOfImport",
  "unitSize",
  "sae",
  "oilType",
  "api",
  "acea",
  "appropriateUse",
];

const COLLECTION_CARD_PROJECTION = {
  name: 1,
  price: 1,
  salePrice: 1,
  image: { $slice: 1 },
  stock: 1,
  brand: 1,
  category: 1,
  subCategory: 1,
  isUniversalFit: 1,
  date: 1,
};

let productListCache = {
  payload: null,
};

const invalidateProductListCache = () => {
  productListCache = {
    payload: null,
  };
};

const parseMultiValueParam = (value) => {
  if (!value) return [];

  const values = Array.isArray(value) ? value : String(value).split(",");
  return values
    .flatMap((entry) => String(entry).split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const buildExactCaseInsensitiveRegex = (value) =>
  new RegExp(`^${escapeRegex(String(value).trim())}$`, "i");
const slugToLooseRegex = (slugValue) => {
  const slug = String(slugValue || "")
    .trim()
    .toLowerCase();

  if (!slug) {
    return null;
  }

  const tokens = slug
    .split("-")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => escapeRegex(token));

  if (tokens.length === 0) {
    return null;
  }

  return new RegExp(tokens.join("[-\\s/]*"), "i");
};
const parseOptionalInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const buildCollectionQuery = (queryParams = {}) => {
  const query = {};

  FILTERABLE_FIELDS.forEach((field) => {
    const values = parseMultiValueParam(queryParams[field]);
    if (values.length === 1) {
      query[field] = buildExactCaseInsensitiveRegex(values[0]);
    } else if (values.length > 1) {
      query[field] = {
        $in: values.map((value) => buildExactCaseInsensitiveRegex(value)),
      };
    }
  });

  const rawSearch = String(queryParams.search || "").trim();
  if (rawSearch) {
    const searchTerms = rawSearch
      .split(/\s+/)
      .map((term) => escapeRegex(term))
      .filter(Boolean);

    if (searchTerms.length > 0) {
      query.$and = searchTerms.map((term) => ({
        name: { $regex: term, $options: "i" },
      }));
    }
  }

  const vehicleBrandSlug = String(queryParams.vehicleBrandSlug || "")
    .trim()
    .toLowerCase();
  const vehicleModelSlug = String(queryParams.vehicleModelSlug || "")
    .trim()
    .toLowerCase();
  const vehicleYear = parseOptionalInteger(queryParams.vehicleYear);
  const vehicleYearFrom = Number.isInteger(vehicleYear)
    ? vehicleYear
    : parseOptionalInteger(queryParams.vehicleYearFrom);
  const vehicleYearTo = Number.isInteger(vehicleYear)
    ? vehicleYear
    : parseOptionalInteger(queryParams.vehicleYearTo);

  if (
    vehicleBrandSlug ||
    vehicleModelSlug ||
    Number.isInteger(vehicleYearFrom) ||
    Number.isInteger(vehicleYearTo)
  ) {
    const vehicleSearchOr = [];
    const vehicleFitmentQuery = {};

    if (vehicleBrandSlug) {
      vehicleFitmentQuery.brandSlug = vehicleBrandSlug;
    }

    if (vehicleModelSlug) {
      vehicleFitmentQuery.modelSlug = vehicleModelSlug;
    }

    if (Number.isInteger(vehicleYearFrom) && Number.isInteger(vehicleYearTo)) {
      vehicleFitmentQuery.yearFrom = {
        $lte: Math.max(vehicleYearFrom, vehicleYearTo),
      };
      vehicleFitmentQuery.yearTo = {
        $gte: Math.min(vehicleYearFrom, vehicleYearTo),
      };
    } else if (Number.isInteger(vehicleYearFrom)) {
      vehicleFitmentQuery.yearTo = { $gte: vehicleYearFrom };
    } else if (Number.isInteger(vehicleYearTo)) {
      vehicleFitmentQuery.yearFrom = { $lte: vehicleYearTo };
    }

    vehicleSearchOr.push(
      { isUniversalFit: true },
      {
        vehicleFitments: {
          $elemMatch: vehicleFitmentQuery,
        },
      },
    );

    const fallbackTextAnd = [];
    const brandRegex = slugToLooseRegex(vehicleBrandSlug);
    const modelRegex = slugToLooseRegex(vehicleModelSlug);

    if (brandRegex) {
      fallbackTextAnd.push({
        $or: [
          { name: brandRegex },
          { description: brandRegex },
          { brand: brandRegex },
        ],
      });
    }

    if (modelRegex) {
      fallbackTextAnd.push({
        $or: [
          { name: modelRegex },
          { description: modelRegex },
          { brand: modelRegex },
        ],
      });
    }

    if (fallbackTextAnd.length > 0) {
      vehicleSearchOr.push({ $and: fallbackTextAnd });
    }

    query.$or = vehicleSearchOr;
  }

  return query;
};

const getSortSpec = (sortType) => {
  switch (sortType) {
    case "low-high":
      return { price: 1, _id: 1 };
    case "high-low":
      return { price: -1, _id: 1 };
    default:
      return { date: -1, _id: -1 };
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      price,
      salePrice,
      brand,
      countryOfOrigin,
      countryOfImport,
      unitSize,
      sae,
      oilType,
      acea,
      appropriateUse,
      stock,
      api,
      bestseller,
      isUniversalFit,
    } = req.body;
    let vehicleFitments = [];
    const universalFit = parseBoolean(isUniversalFit);

    if (
      !name ||
      !description ||
      !category ||
      !subCategory ||
      price === undefined ||
      !brand
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, category, subCategory, price, brand",
      });
    }

    try {
      vehicleFitments = normalizeVehicleFitments(req.body.vehicleFitments);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!universalFit && vehicleFitments.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one compatible vehicle or mark the product as universal fit",
      });
    }

    const files = req.files || {};
    const image1 = files.image1?.[0];
    const image2 = files.image2?.[0];
    const image3 = files.image3?.[0];
    const image4 = files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    // Apply logo watermarks and get new file paths
    const watermarkedPaths = [];
    for (const img of images) {
      const wmPath = await applyWatermark(img.path);
      watermarkedPaths.push(wmPath);
    }

    let imagesUrl = [];
    if (watermarkedPaths.length > 0) {
      imagesUrl = await Promise.all(
        watermarkedPaths.map(async (filePath) => {
          const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
          });
          return result.secure_url;
        }),
      );
    }

    const productData = {
      name: String(name).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      subCategory: String(subCategory).trim(),
      brand: String(brand).trim(),
      countryOfOrigin: countryOfOrigin ? String(countryOfOrigin).trim() : "N/A",
      countryOfImport: countryOfImport ? String(countryOfImport).trim() : "N/A",
      unitSize: unitSize ? String(unitSize).trim() : "N/A",
      sae: sae ? String(sae).trim() : "N/A",
      oilType: oilType ? String(oilType).trim() : "N/A",
      api: api ? String(api).trim() : "N/A",
      acea: acea ? String(acea).trim() : "N/A",
      appropriateUse: appropriateUse ? String(appropriateUse).trim() : "N/A",
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      stock: stock ? Number(stock) : 0,
      bestseller: parseBoolean(bestseller),
      isUniversalFit: universalFit,
      image: imagesUrl,
      date: Date.now(),
      vehicleFitments: universalFit ? [] : vehicleFitments,
    };

    if (Number.isNaN(productData.price)) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a number" });
    }

    // Check for duplicate product (same name + brand + category + subCategory)
    const existing = await productModel.findOne({
      name: productData.name,
      brand: productData.brand,
      category: productData.category,
      subCategory: productData.subCategory,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Product "${productData.name}" by ${productData.brand} already exists in ${productData.category} > ${productData.subCategory}`,
      });
    }

    const product = await productModel.create(productData);
    invalidateProductListCache();

    return res.status(201).json({
      success: true,
      message: "Product Added",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE PRODUCT (for Edit feature)
const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      category,
      subCategory,
      price,
      salePrice,
      brand,
      countryOfOrigin,
      countryOfImport,
      unitSize,
      sae,
      oilType,
      acea,
      appropriateUse,
      stock,
      api,
      bestseller,
      isUniversalFit,
    } = req.body;
    let normalizedVehicleFitments;
    const universalFitWasProvided = isUniversalFit !== undefined;
    const universalFit = parseBoolean(isUniversalFit);

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product id is required" });
    }

    if (req.body.vehicleFitments !== undefined) {
      try {
        normalizedVehicleFitments = normalizeVehicleFitments(
          req.body.vehicleFitments,
        );
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    // Build update object (only update fields that were provided)
    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined)
      updateData.description = String(description).trim();
    if (category !== undefined) updateData.category = String(category).trim();
    if (subCategory !== undefined)
      updateData.subCategory = String(subCategory).trim();
    if (brand !== undefined) updateData.brand = String(brand).trim();
    if (countryOfOrigin !== undefined)
      updateData.countryOfOrigin = String(countryOfOrigin).trim();
    if (countryOfImport !== undefined)
      updateData.countryOfImport = String(countryOfImport).trim();
    if (unitSize !== undefined) updateData.unitSize = String(unitSize).trim();
    if (sae !== undefined) updateData.sae = String(sae).trim();
    if (oilType !== undefined) updateData.oilType = String(oilType).trim();
    if (api !== undefined) updateData.api = String(api).trim();
    if (acea !== undefined) updateData.acea = String(acea).trim();
    if (appropriateUse !== undefined)
      updateData.appropriateUse = String(appropriateUse).trim();
    if (price !== undefined) updateData.price = Number(price);
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (bestseller !== undefined)
      updateData.bestseller = parseBoolean(bestseller);
    if (universalFitWasProvided) {
      updateData.isUniversalFit = universalFit;
    }
    if (normalizedVehicleFitments !== undefined) {
      updateData.vehicleFitments = universalFit
        ? []
        : normalizedVehicleFitments;
    } else if (universalFitWasProvided && universalFit) {
      updateData.vehicleFitments = [];
    }

    if (
      universalFitWasProvided &&
      !universalFit &&
      normalizedVehicleFitments !== undefined &&
      normalizedVehicleFitments.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one compatible vehicle or mark the product as universal fit",
      });
    }

    if ("price" in updateData && Number.isNaN(updateData.price)) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a number" });
    }

    // Determine preserved existing images (sent as array from frontend)
    let preservedImages = [];
    if (req.body.existingImages) {
      try {
        preservedImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        // handle string single values if not json array
        preservedImages = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
      }
    }
    // Filter out null/empty values
    preservedImages = preservedImages.filter(
      (img) => img && typeof img === "string",
    );

    // Handle new image uploads
    const files = req.files || {};
    const image1 = files.image1?.[0];
    const image2 = files.image2?.[0];
    const image3 = files.image3?.[0];
    const image4 = files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    // Apply logo watermarks and get new file paths
    const watermarkedPaths = [];
    for (const img of images) {
      const wmPath = await applyWatermark(img.path);
      watermarkedPaths.push(wmPath);
    }

    let newlyUploadedUrls = [];
    if (watermarkedPaths.length > 0) {
      newlyUploadedUrls = await Promise.all(
        watermarkedPaths.map(async (filePath) => {
          const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
          });
          return result.secure_url;
        }),
      );
    }

    // update to the combined pool of old retained images + new images
    // Note: If no new images and no existing images provided, we don't wipe out the images unless strictly told to
    // BUT since we are building an edit UI where removing all existing images + no new images = empty array, we will update it if expected.
    // If the frontend explicitly sends `existingImages`, we assume they intend to update the image list.
    if (req.body.existingImages !== undefined || images.length > 0) {
      updateData.image = [...preservedImages, ...newlyUploadedUrls];
    }

    const updated = await productModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    invalidateProductListCache();

    return res.json({
      success: true,
      message: "Product Updated",
      product: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listProduct = async (req, res) => {
  try {
    if (productListCache.payload) {
      res.set("Content-Type", "application/json");
      return res.send(productListCache.payload);
    }

    const products = await productModel
      .find({})
      .select("-__v -createdAt -updatedAt")
      .sort({ date: -1 })
      .lean();

    const payload = JSON.stringify({ success: true, products });
    productListCache = {
      payload,
    };

    res.set("Content-Type", "application/json");
    return res.send(payload);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listCollectionProducts = async (req, res) => {
  const requestStartedAt = Date.now();
  try {
    const queryBuiltAt = Date.now();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 24, 1),
      60,
    );
    const skip = (page - 1) * limit;
    const query = buildCollectionQuery(req.query);
    const sort = getSortSpec(req.query.sort);
    const dbStartedAt = Date.now();

    const [products, totalProducts] = await Promise.all([
      productModel
        .find(query, COLLECTION_CARD_PROJECTION)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      productModel.countDocuments(query),
    ]);
    const dbFinishedAt = Date.now();

    const totalPages = Math.max(Math.ceil(totalProducts / limit), 1);
    const responseReadyAt = Date.now();

    console.log(
      `[collection] page=${page} limit=${limit} total=${totalProducts} ` +
        `build=${dbStartedAt - queryBuiltAt}ms db=${dbFinishedAt - dbStartedAt}ms ` +
        `serialize=${responseReadyAt - dbFinishedAt}ms total=${responseReadyAt - requestStartedAt}ms ` +
        `query=${JSON.stringify(query)} sort=${JSON.stringify(sort)}`,
    );

    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasMore: page < totalPages,
      },
      timings:
        process.env.NODE_ENV !== "production"
          ? {
              totalMs: responseReadyAt - requestStartedAt,
              buildMs: dbStartedAt - queryBuiltAt,
              dbMs: dbFinishedAt - dbStartedAt,
              serializeMs: responseReadyAt - dbFinishedAt,
            }
          : undefined,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCollectionFilters = async (_req, res) => {
  try {
    const distinctFields = FILTERABLE_FIELDS.filter(
      (field) => field !== "category" && field !== "subCategory",
    );

    const results = await Promise.all(
      distinctFields.map((field) =>
        productModel.distinct(field, { [field]: { $nin: ["", "N/A", null] } }),
      ),
    );

    const filters = distinctFields.reduce((acc, field, index) => {
      acc[field] = results[index].sort((a, b) => a.localeCompare(b));
      return acc;
    }, {});

    res.json({ success: true, filters });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    const id = req.params?.id || req.body?.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product id is required" });

    const deleted = await productModel.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    invalidateProductListCache();
    res.json({ success: true, message: "Product removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const id = req.params?.id || req.body?.id || req.body?.productId;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product id is required" });

    const product = await productModel.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  updateProduct,
  listProduct,
  listCollectionProducts,
  getCollectionFilters,
  removeProduct,
  singleProduct,
  invalidateProductListCache,
};
