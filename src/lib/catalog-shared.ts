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

export function tierBrandAndPrice(accessory: CatalogAccessory, tier: QualityTier) {
  switch (tier) {
    case "Low":
      return { brand: accessory.lowBrand, price: accessory.lowPrice };
    case "Medium":
      return { brand: accessory.mediumBrand, price: accessory.mediumPrice };
    case "High":
      return { brand: accessory.highBrand, price: accessory.highPrice };
  }
}
