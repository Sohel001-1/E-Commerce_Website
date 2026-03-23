import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/mongodb.js";
import productModel from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");
const envPath = path.resolve(backendRoot, ".env");
const outputDir = path.resolve(
  repoRoot,
  process.argv[2] || "product-database-export",
);

const csvColumns = [
  "_id",
  "name",
  "description",
  "price",
  "salePrice",
  "stock",
  "image",
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
  "bestseller",
  "isUniversalFit",
  "vehicleFitments",
  "date",
  "createdAt",
  "updatedAt",
  "__v",
];

const countBy = (products, key) =>
  Object.fromEntries(
    [...products.reduce((map, product) => {
      const value = String(product?.[key] || "N/A").trim() || "N/A";
      map.set(value, (map.get(value) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    }),
  );

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue =
    typeof value === "string" ? value : JSON.stringify(value ?? "");
  const normalized = stringValue.replace(/\r?\n/g, " ").trim();

  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
};

const buildCsv = (products) => {
  const header = csvColumns.join(",");
  const rows = products.map((product) =>
    csvColumns
      .map((column) => {
        const value = product[column];
        return escapeCsvValue(value);
      })
      .join(","),
  );

  return [header, ...rows].join("\n") + "\n";
};

const buildSummary = (products) => ({
  exportedAt: new Date().toISOString(),
  outputDir,
  totalProducts: products.length,
  productsWithImages: products.filter(
    (product) => Array.isArray(product.image) && product.image.length > 0,
  ).length,
  productsWithVehicleFitments: products.filter(
    (product) =>
      Array.isArray(product.vehicleFitments) && product.vehicleFitments.length > 0,
  ).length,
  universalFitProducts: products.filter(
    (product) => product.isUniversalFit === true,
  ).length,
  categories: countBy(products, "category"),
  brands: countBy(products, "brand"),
});

const main = async () => {
  const envResult = dotenv.config({ path: envPath });

  if (envResult.error) {
    throw envResult.error;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from backend/.env");
  }

  await connectDB();

  const products = await productModel
    .find({})
    .sort({ category: 1, subCategory: 1, brand: 1, name: 1 })
    .lean();

  const serializedProducts = JSON.parse(JSON.stringify(products));
  const summary = buildSummary(serializedProducts);

  await fs.mkdir(outputDir, { recursive: true });

  await Promise.all([
    fs.writeFile(
      path.join(outputDir, "products.json"),
      `${JSON.stringify(serializedProducts, null, 2)}\n`,
      "utf8",
    ),
    fs.writeFile(
      path.join(outputDir, "products.csv"),
      buildCsv(serializedProducts),
      "utf8",
    ),
    fs.writeFile(
      path.join(outputDir, "export-summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
      "utf8",
    ),
  ]);

  console.log(`Export complete: ${serializedProducts.length} products`);
  console.log(`Folder: ${outputDir}`);
};

main()
  .catch((error) => {
    console.error("Product export failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
