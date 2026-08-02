import { prisma } from "@/lib/prisma";
import type { CatalogCategory } from "@/lib/catalog-shared";

export type {
  CatalogAccessory,
  CatalogSubcategory,
  CatalogCategory,
  QualityTier,
} from "@/lib/catalog-shared";
export { QUALITY_TIERS, tierBrandAndPrice, computeQuote } from "@/lib/catalog-shared";

/** The whole service catalog, small enough (a few hundred rows) to fetch in
 * one shot and let the booking form cascade through it client-side with no
 * further round trips. Server-only (imports Prisma) — do not import this
 * file from a client component; import from ./catalog-shared instead. */
export async function getCatalog(): Promise<CatalogCategory[]> {
  return prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      gradient: true,
      subcategories: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          accessories: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
              lowBrand: true,
              lowPrice: true,
              mediumBrand: true,
              mediumPrice: true,
              highBrand: true,
              highPrice: true,
              laborFee: true,
              laborBatchSize: true,
            },
          },
        },
      },
    },
  });
}
