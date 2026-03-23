import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import connectDB from "../config/mongodb.js";
import vehicleBrandModel from "../models/vehicleBrandModel.js";
import vehicleModelModel from "../models/vehicleModelModel.js";
import { YEAR_MIN, YEAR_MAX, slugify } from "../utils/vehicleUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const vehicleMediaRoot = path.resolve(repoRoot, "backend", "public", "vehicle-media");
const manifestPath = path.resolve(
  process.env.VEHICLE_MANIFEST_PATH ||
    path.join(vehicleMediaRoot, "manifest.json"),
);

const defaultYearFrom = Number.parseInt(
  process.env.VEHICLE_IMPORT_YEAR_FROM || `${YEAR_MIN}`,
  10,
);
const defaultYearTo = Number.parseInt(
  process.env.VEHICLE_IMPORT_YEAR_TO || `${YEAR_MAX}`,
  10,
);

if (
  !Number.isInteger(defaultYearFrom) ||
  !Number.isInteger(defaultYearTo) ||
  defaultYearFrom < YEAR_MIN ||
  defaultYearTo > YEAR_MAX ||
  defaultYearFrom > defaultYearTo
) {
  throw new Error(
    `Vehicle import year range must be within ${YEAR_MIN}-${YEAR_MAX} and yearFrom <= yearTo.`,
  );
}

const ensureFileExists = async (targetPath) => {
  await fs.access(targetPath);
  return targetPath;
};

const encodePathSegments = (segments) =>
  segments.map((segment) => encodeURIComponent(segment)).join("/");

const buildMediaUrl = (...segments) => `/vehicle-media/${encodePathSegments(segments)}`;

const readManifest = async () => {
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);

  if (!Array.isArray(manifest?.brands)) {
    throw new Error("Vehicle manifest is missing its brands array.");
  }

  return manifest;
};

const upsertBrand = async (brand, sortOrder) => {
  const logoFileName =
    brand.makeImageName ||
    (brand.makeImagePath ? path.basename(brand.makeImagePath) : null);

  if (!logoFileName) {
    throw new Error(`Brand ${brand.makeName} is missing a logo filename.`);
  }

  await ensureFileExists(
    path.join(vehicleMediaRoot, "brand_images", logoFileName),
  );

  const slug = slugify(brand.makeName);
  const logoUrl = buildMediaUrl("brand_images", logoFileName);

  return vehicleBrandModel.findOneAndUpdate(
    { slug },
    {
      $set: {
        name: brand.makeName,
        slug,
        logoUrl,
        isActive: true,
        sortOrder,
      },
      $setOnInsert: {
        date: Date.now(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );
};

const upsertModel = async (brandDoc, brandEntry, model, sortOrder) => {
  const savedFileName =
    model.imagePath ? path.basename(model.imagePath) : model.imageName || null;

  if (!savedFileName) {
    return null;
  }

  await ensureFileExists(
    path.join(
      vehicleMediaRoot,
      "models_by_brand",
      brandEntry.makeName,
      savedFileName,
    ),
  );

  const slug = slugify(model.modelName);
  const imageUrl = buildMediaUrl(
    "models_by_brand",
    brandEntry.makeName,
    savedFileName,
  );

  return vehicleModelModel.findOneAndUpdate(
    { brandId: brandDoc._id, slug },
    {
      $set: {
        brandId: brandDoc._id,
        brandName: brandDoc.name,
        brandSlug: brandDoc.slug,
        name: model.modelName,
        slug,
        imageUrl,
        yearFrom: defaultYearFrom,
        yearTo: defaultYearTo,
        isActive: true,
        sortOrder,
      },
      $setOnInsert: {
        date: Date.now(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );
};

const main = async () => {
  const manifest = await readManifest();
  await connectDB();

  let importedBrands = 0;
  let importedModels = 0;
  let skippedModels = 0;

  for (const [brandIndex, brand] of manifest.brands.entries()) {
    const brandDoc = await upsertBrand(brand, brandIndex);
    importedBrands += 1;

    for (const [modelIndex, model] of (brand.models || []).entries()) {
      const modelDoc = await upsertModel(brandDoc, brand, model, modelIndex);

      if (modelDoc) {
        importedModels += 1;
      } else {
        skippedModels += 1;
      }
    }
  }

  console.log(
    `Vehicle catalog import complete. Brands: ${importedBrands}, models: ${importedModels}, skipped models without images: ${skippedModels}.`,
  );
  process.exit(0);
};

main().catch((error) => {
  console.error("Vehicle catalog import failed:", error.message);
  process.exit(1);
});
