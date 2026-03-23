const YEAR_MIN = 1900;
const YEAR_MAX = 2100;

const trimString = (value) => String(value || "").trim();

const slugify = (value) => {
  const normalized = trimString(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "item";
};

const parseJsonArrayField = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error();
      }
      return parsed;
    } catch {
      throw new Error(`${fieldName} must be a valid JSON array`);
    }
  }

  throw new Error(`${fieldName} must be an array`);
};

const normalizeYear = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < YEAR_MIN || parsed > YEAR_MAX) {
    throw new Error(
      `${fieldName} must be a whole year between ${YEAR_MIN} and ${YEAR_MAX}`,
    );
  }

  return parsed;
};

const normalizeVehicleFitments = (rawFitments) => {
  const fitments = parseJsonArrayField(rawFitments, "vehicleFitments");

  const normalizedFitments = fitments.map((fitment, index) => {
    const rowNumber = index + 1;
    const brandId = trimString(fitment?.brandId);
    const brandName = trimString(fitment?.brandName);
    const brandSlug = trimString(fitment?.brandSlug);
    const modelId = trimString(fitment?.modelId);
    const modelName = trimString(fitment?.modelName);
    const modelSlug = trimString(fitment?.modelSlug);

    if (!brandId || !brandName || !brandSlug) {
      throw new Error(
        `Vehicle fitment row ${rowNumber} is missing brand information`,
      );
    }

    if (!modelId || !modelName || !modelSlug) {
      throw new Error(
        `Vehicle fitment row ${rowNumber} is missing model information`,
      );
    }

    const yearFrom = normalizeYear(fitment?.yearFrom, "yearFrom");
    const yearTo = normalizeYear(fitment?.yearTo, "yearTo");

    if (yearFrom > yearTo) {
      throw new Error(
        `Vehicle fitment row ${rowNumber} has an invalid year range`,
      );
    }

    return {
      brandId,
      brandName,
      brandSlug,
      modelId,
      modelName,
      modelSlug,
      yearFrom,
      yearTo,
    };
  });

  const dedupedFitments = [];
  const seen = new Set();

  normalizedFitments.forEach((fitment) => {
    const key = [
      fitment.brandId,
      fitment.modelId,
      fitment.yearFrom,
      fitment.yearTo,
    ].join("::");

    if (!seen.has(key)) {
      seen.add(key);
      dedupedFitments.push(fitment);
    }
  });

  return dedupedFitments.sort((left, right) => {
    if (left.brandName !== right.brandName) {
      return left.brandName.localeCompare(right.brandName);
    }

    if (left.modelName !== right.modelName) {
      return left.modelName.localeCompare(right.modelName);
    }

    return left.yearFrom - right.yearFrom || left.yearTo - right.yearTo;
  });
};

export { YEAR_MIN, YEAR_MAX, slugify, normalizeVehicleFitments };
