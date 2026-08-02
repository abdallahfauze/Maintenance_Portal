// Pure types & helpers with no server-only imports (no Prisma/pg) — safe to
// import from client components. Server-side data fetching lives in
// ./catalog.ts, which imports these types back in.

export type CatalogAccessory = {
  id: string;
  name: string;
  lowBrand: string;
  lowPrice: number;
  mediumBrand: string;
  mediumPrice: number;
  highBrand: string;
  highPrice: number;
  laborFee: number;
  laborBatchSize: number;
};

export type CatalogSubcategory = {
  id: string;
  name: string;
  accessories: CatalogAccessory[];
};

export type CatalogCategory = {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  subcategories: CatalogSubcategory[];
};

export const QUALITY_TIERS = ["Low", "Medium", "High"] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];

/** Part/fixture brand + price for a tier, the technician labor fee (flat
 * across tiers — installing a budget or premium tap takes the same effort),
 * and the total the customer is quoted. */
export function tierBrandAndPrice(accessory: CatalogAccessory, tier: QualityTier) {
  const { brand, price } =
    tier === "Low"
      ? { brand: accessory.lowBrand, price: accessory.lowPrice }
      : tier === "Medium"
        ? { brand: accessory.mediumBrand, price: accessory.mediumPrice }
        : { brand: accessory.highBrand, price: accessory.highPrice };
  const laborFee = accessory.laborFee;
  return { brand, price, laborFee, total: price + laborFee };
}

export type Quote = {
  brand: string;
  unitPrice: number;
  quantity: number;
  partTotal: number;
  laborFee: number;
  laborUnits: number;
  laborTotal: number;
  total: number;
};

/** Full quantity-aware quote: parts scale linearly, but labor is charged
 * once per laborBatchSize units (a technician can realistically knock out
 * several quick swaps — e.g. up to 5 light switches — in one visit, but a
 * split AC install is laborBatchSize=1, so every unit gets its own charge). */
export function computeQuote(accessory: CatalogAccessory, tier: QualityTier, quantity: number): Quote {
  const { brand, price } = tierBrandAndPrice(accessory, tier);
  const batchSize = Math.max(1, accessory.laborBatchSize);
  const laborUnits = Math.ceil(quantity / batchSize);
  const partTotal = quantity * price;
  const laborTotal = laborUnits * accessory.laborFee;
  return {
    brand,
    unitPrice: price,
    quantity,
    partTotal,
    laborFee: accessory.laborFee,
    laborUnits,
    laborTotal,
    total: partTotal + laborTotal,
  };
}
