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
