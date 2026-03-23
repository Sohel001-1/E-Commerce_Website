import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import vehicleBrandModel from "../models/vehicleBrandModel.js";
import vehicleModelModel from "../models/vehicleModelModel.js";
import productModel from "../models/productModel.js";
import { invalidateProductListCache } from "./productController.js";
import { slugify, YEAR_MIN, YEAR_MAX } from "../utils/vehicleUtils.js";

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value === true || value === "true";
};

const parseSortOrder = (value) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error("Sort order must be a number");
  }

  return parsed;
};

const parseYear = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < YEAR_MIN || parsed > YEAR_MAX) {
    throw new Error(
      `${fieldName} must be a whole year between ${YEAR_MIN} and ${YEAR_MAX}`,
    );
  }

  return parsed;
};

const uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "image",
  });

  return result.secure_url;
};

const createUniqueBrandSlug = async (name, excludeId = null) => {
  const baseSlug = slugify(name);
  let nextSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await vehicleBrandModel.findOne({
      slug: nextSlug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existing) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const createUniqueModelSlug = async (brandId, name, excludeId = null) => {
  const baseSlug = slugify(name);
  let nextSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await vehicleModelModel.findOne({
      brandId,
      slug: nextSlug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existing) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

let vehicleCatalogCache = {
  data: null,
  expiresAt: 0,
};

const invalidateVehicleCatalogCache = () => {
  vehicleCatalogCache = {
    data: null,
    expiresAt: 0,
  };
};

const shapeCatalog = (brands, models) => {
  const modelsByBrandId = new Map();

  for (const model of models) {
    const key = String(model.brandId);
    if (!modelsByBrandId.has(key)) {
      modelsByBrandId.set(key, []);
    }

    modelsByBrandId.get(key).push({
      _id: String(model._id),
      brandId: String(model.brandId),
      brandName: model.brandName,
      brandSlug: model.brandSlug,
      name: model.name,
      slug: model.slug,
      imageUrl: model.imageUrl,
      yearFrom: model.yearFrom,
      yearTo: model.yearTo,
      isActive: model.isActive,
      sortOrder: model.sortOrder,
    });
  }

  return brands.map((brand) => ({
    _id: String(brand._id),
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    isActive: brand.isActive,
    sortOrder: brand.sortOrder,
    models: modelsByBrandId.get(String(brand._id)) || [],
  }));
};

const listVehicleCatalog = async (_req, res) => {
  try {
    const now = Date.now();
    if (vehicleCatalogCache.data && vehicleCatalogCache.expiresAt > now) {
      return res.json({
        success: true,
        brands: vehicleCatalogCache.data,
      });
    }

    const [brands, models] = await Promise.all([
      vehicleBrandModel
        .find({ isActive: true })
        .select("name slug logoUrl isActive sortOrder")
        .sort({ sortOrder: 1, name: 1 })
        .lean(),
      vehicleModelModel
        .find({ isActive: true })
        .select(
          "brandId brandName brandSlug name slug imageUrl yearFrom yearTo isActive sortOrder",
        )
        .sort({ sortOrder: 1, name: 1 })
        .lean(),
    ]);

    const shapedCatalog = shapeCatalog(brands, models);
    vehicleCatalogCache = {
      data: shapedCatalog,
      expiresAt: now + 60 * 1000,
    };

    res.json({
      success: true,
      brands: shapedCatalog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listVehicleAdminCatalog = async (_req, res) => {
  try {
    const [brands, models] = await Promise.all([
      vehicleBrandModel.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
      vehicleModelModel.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
    ]);

    res.json({
      success: true,
      brands: shapeCatalog(brands, models),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addVehicleBrand = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Brand name is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Brand logo is required" });
    }

    const slug = await createUniqueBrandSlug(name);
    const logoUrl = await uploadImage(req.file.path);

    const brand = await vehicleBrandModel.create({
      name,
      slug,
      logoUrl,
      isActive: parseBoolean(req.body.isActive, true),
      sortOrder: parseSortOrder(req.body.sortOrder),
      date: Date.now(),
    });

    invalidateVehicleCatalogCache();

    res.status(201).json({
      success: true,
      message: "Vehicle brand added",
      brand,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVehicleBrand = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid brand id is required" });
    }

    const existingBrand = await vehicleBrandModel.findById(id);
    if (!existingBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle brand not found" });
    }

    const nextName =
      req.body.name !== undefined
        ? String(req.body.name || "").trim()
        : existingBrand.name;

    if (!nextName) {
      return res
        .status(400)
        .json({ success: false, message: "Brand name is required" });
    }

    const nameChanged = nextName !== existingBrand.name;
    const nextSlug = nameChanged
      ? await createUniqueBrandSlug(nextName, existingBrand._id)
      : existingBrand.slug;

    const updateData = {
      name: nextName,
      slug: nextSlug,
      isActive: parseBoolean(req.body.isActive, existingBrand.isActive),
      sortOrder:
        req.body.sortOrder !== undefined
          ? parseSortOrder(req.body.sortOrder)
          : existingBrand.sortOrder,
    };

    if (req.file) {
      updateData.logoUrl = await uploadImage(req.file.path);
    }

    const updatedBrand = await vehicleBrandModel.findByIdAndUpdate(
      existingBrand._id,
      updateData,
      { new: true, runValidators: true },
    );

    if (nameChanged || req.body.isActive !== undefined) {
      await vehicleModelModel.updateMany(
        { brandId: existingBrand._id },
        {
          $set: {
            brandName: updatedBrand.name,
            brandSlug: updatedBrand.slug,
          },
        },
      );

      await productModel.updateMany(
        { "vehicleFitments.brandId": String(existingBrand._id) },
        {
          $set: {
            "vehicleFitments.$[fitment].brandName": updatedBrand.name,
            "vehicleFitments.$[fitment].brandSlug": updatedBrand.slug,
          },
        },
        {
          arrayFilters: [{ "fitment.brandId": String(existingBrand._id) }],
        },
      );

      invalidateProductListCache();
    }

    invalidateVehicleCatalogCache();

    res.json({
      success: true,
      message: "Vehicle brand updated",
      brand: updatedBrand,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeVehicleBrand = async (req, res) => {
  try {
    const id = req.body?.id || req.params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid brand id is required" });
    }

    const deletedBrand = await vehicleBrandModel.findByIdAndDelete(id);
    if (!deletedBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle brand not found" });
    }

    const models = await vehicleModelModel.find({ brandId: id }).select("_id");
    const modelIds = models.map((model) => String(model._id));

    await vehicleModelModel.deleteMany({ brandId: id });

    await productModel.updateMany(
      {},
      {
        $pull: {
          vehicleFitments: {
            brandId: String(id),
          },
        },
      },
    );

    if (modelIds.length > 0) {
      invalidateProductListCache();
    } else {
      invalidateProductListCache();
    }

    invalidateVehicleCatalogCache();

    res.json({
      success: true,
      message: "Vehicle brand removed",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addVehicleModel = async (req, res) => {
  try {
    const brandId = String(req.body.brandId || "").trim();
    const name = String(req.body.name || "").trim();

    if (!brandId || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid brand id is required" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Model name is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Model image is required" });
    }

    const yearFrom = parseYear(req.body.yearFrom, "yearFrom");
    const yearTo = parseYear(req.body.yearTo, "yearTo");

    if (yearFrom > yearTo) {
      return res.status(400).json({
        success: false,
        message: "yearFrom cannot be greater than yearTo",
      });
    }

    const brand = await vehicleBrandModel.findById(brandId);
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle brand not found" });
    }

    const slug = await createUniqueModelSlug(brand._id, name);
    const imageUrl = await uploadImage(req.file.path);

    const model = await vehicleModelModel.create({
      brandId: brand._id,
      brandName: brand.name,
      brandSlug: brand.slug,
      name,
      slug,
      imageUrl,
      yearFrom,
      yearTo,
      isActive: parseBoolean(req.body.isActive, true),
      sortOrder: parseSortOrder(req.body.sortOrder),
      date: Date.now(),
    });

    invalidateVehicleCatalogCache();

    res.status(201).json({
      success: true,
      message: "Vehicle model added",
      model,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVehicleModel = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid model id is required" });
    }

    const existingModel = await vehicleModelModel.findById(id);
    if (!existingModel) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle model not found" });
    }

    const nextBrandId = String(
      req.body.brandId !== undefined ? req.body.brandId : existingModel.brandId,
    ).trim();

    if (!nextBrandId || !mongoose.Types.ObjectId.isValid(nextBrandId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid brand id is required" });
    }

    const nextBrand = await vehicleBrandModel.findById(nextBrandId);
    if (!nextBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle brand not found" });
    }

    const nextName =
      req.body.name !== undefined
        ? String(req.body.name || "").trim()
        : existingModel.name;

    if (!nextName) {
      return res
        .status(400)
        .json({ success: false, message: "Model name is required" });
    }

    const yearFrom =
      req.body.yearFrom !== undefined
        ? parseYear(req.body.yearFrom, "yearFrom")
        : existingModel.yearFrom;
    const yearTo =
      req.body.yearTo !== undefined
        ? parseYear(req.body.yearTo, "yearTo")
        : existingModel.yearTo;

    if (yearFrom > yearTo) {
      return res.status(400).json({
        success: false,
        message: "yearFrom cannot be greater than yearTo",
      });
    }

    const needsNewSlug =
      nextName !== existingModel.name ||
      String(nextBrand._id) !== String(existingModel.brandId);

    const nextSlug = needsNewSlug
      ? await createUniqueModelSlug(nextBrand._id, nextName, existingModel._id)
      : existingModel.slug;

    const updateData = {
      brandId: nextBrand._id,
      brandName: nextBrand.name,
      brandSlug: nextBrand.slug,
      name: nextName,
      slug: nextSlug,
      yearFrom,
      yearTo,
      isActive: parseBoolean(req.body.isActive, existingModel.isActive),
      sortOrder:
        req.body.sortOrder !== undefined
          ? parseSortOrder(req.body.sortOrder)
          : existingModel.sortOrder,
    };

    if (req.file) {
      updateData.imageUrl = await uploadImage(req.file.path);
    }

    const updatedModel = await vehicleModelModel.findByIdAndUpdate(
      existingModel._id,
      updateData,
      { new: true, runValidators: true },
    );

    await productModel.updateMany(
      { "vehicleFitments.modelId": String(existingModel._id) },
      {
        $set: {
          "vehicleFitments.$[fitment].brandId": String(updatedModel.brandId),
          "vehicleFitments.$[fitment].brandName": updatedModel.brandName,
          "vehicleFitments.$[fitment].brandSlug": updatedModel.brandSlug,
          "vehicleFitments.$[fitment].modelName": updatedModel.name,
          "vehicleFitments.$[fitment].modelSlug": updatedModel.slug,
        },
      },
      {
        arrayFilters: [{ "fitment.modelId": String(existingModel._id) }],
      },
    );

    invalidateProductListCache();
    invalidateVehicleCatalogCache();

    res.json({
      success: true,
      message: "Vehicle model updated",
      model: updatedModel,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeVehicleModel = async (req, res) => {
  try {
    const id = req.body?.id || req.params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid model id is required" });
    }

    const deletedModel = await vehicleModelModel.findByIdAndDelete(id);
    if (!deletedModel) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle model not found" });
    }

    await productModel.updateMany(
      {},
      {
        $pull: {
          vehicleFitments: {
            modelId: String(id),
          },
        },
      },
    );

    invalidateProductListCache();
    invalidateVehicleCatalogCache();

    res.json({
      success: true,
      message: "Vehicle model removed",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  listVehicleCatalog,
  listVehicleAdminCatalog,
  addVehicleBrand,
  updateVehicleBrand,
  removeVehicleBrand,
  addVehicleModel,
  updateVehicleModel,
  removeVehicleModel,
};
