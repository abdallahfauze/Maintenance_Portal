"use client";

import type { CatalogCategory } from "@/lib/catalog-shared";
import { QUALITY_TIERS, tierBrandAndPrice, type QualityTier } from "@/lib/catalog-shared";

export type ServiceSelection = {
  categoryName: string;
  subcategoryName: string;
  accessoryName: string;
  qualityTier: QualityTier | "";
  brand: string;
  price: number | null;
};

type Props = {
  catalog: CatalogCategory[];
  categoryId: string;
  subcategoryId: string;
  accessoryId: string;
  qualityTier: QualityTier | "";
  onChange: (next: {
    categoryId: string;
    subcategoryId: string;
    accessoryId: string;
    qualityTier: QualityTier | "";
  }) => void;
};

export function ServiceSelector({
  catalog,
  categoryId,
  subcategoryId,
  accessoryId,
  qualityTier,
  onChange,
}: Props) {
  const category = catalog.find((c) => c.id === categoryId);
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId);
  const accessory = subcategory?.accessories.find((a) => a.id === accessoryId);

  const priceByTier = accessory
    ? (Object.fromEntries(
        QUALITY_TIERS.map((tier) => [tier, tierBrandAndPrice(accessory, tier)])
      ) as Record<QualityTier, { brand: string; price: number }>)
    : null;

  return (
    <div className="space-y-5">
      {/* Step 1: Category */}
      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          What do you need help with?
        </span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {catalog.map((cat) => {
            const selected = cat.id === categoryId;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() =>
                  onChange({ categoryId: cat.id, subcategoryId: "", accessoryId: "", qualityTier: "" })
                }
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition ${
                  selected
                    ? `border-transparent bg-gradient-to-br ${cat.gradient} text-white shadow-lg`
                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Subcategory */}
      {category && (
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Which type of {category.name.toLowerCase()} issue?
          </span>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((sub) => {
              const selected = sub.id === subcategoryId;
              return (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() =>
                    onChange({ categoryId, subcategoryId: sub.id, accessoryId: "", qualityTier: "" })
                  }
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    selected
                      ? "border-orange-500 bg-orange-500 text-white shadow"
                      : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Accessory */}
      {subcategory && (
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Which item needs attention?
          </span>
          <div className="grid gap-2 sm:grid-cols-2">
            {subcategory.accessories.map((acc) => {
              const selected = acc.id === accessoryId;
              return (
                <button
                  type="button"
                  key={acc.id}
                  onClick={() =>
                    onChange({ categoryId, subcategoryId, accessoryId: acc.id, qualityTier: "" })
                  }
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selected
                      ? "border-orange-500 bg-orange-50 font-medium text-orange-900 ring-1 ring-orange-500"
                      : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/60"
                  }`}
                >
                  {acc.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Quality tier */}
      {accessory && priceByTier && (
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Choose your preferred quality &amp; brand
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {QUALITY_TIERS.map((tier) => {
              const { brand, price } = priceByTier[tier];
              const selected = tier === qualityTier;
              return (
                <button
                  type="button"
                  key={tier}
                  onClick={() => onChange({ categoryId, subcategoryId, accessoryId, qualityTier: tier })}
                  className={`rounded-2xl border-2 p-3 text-left transition ${
                    selected
                      ? "border-orange-500 bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <span
                    className={`mb-1 block text-[11px] font-semibold uppercase tracking-wide ${
                      selected ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {tier}
                  </span>
                  <span className={`block text-xs leading-tight ${selected ? "text-white" : "text-slate-600"}`}>
                    {brand}
                  </span>
                  <span className={`mt-1 block text-lg font-bold ${selected ? "text-white" : "text-slate-900"}`}>
                    {price} SAR
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
