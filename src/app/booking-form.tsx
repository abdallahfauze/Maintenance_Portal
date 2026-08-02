"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createBooking, type BookingFormState } from "@/app/actions/bookings";
import { CITIES, BOOKING_FEE_SAR } from "@/lib/constants";
import type { CatalogCategory } from "@/lib/catalog-shared";
import { computeQuote, type QualityTier } from "@/lib/catalog-shared";
import { ServiceSelector } from "@/components/service-selector";
import { LocationPicker } from "@/components/location-picker";
import { DateTimePicker } from "@/components/date-time-picker";

const initialState: BookingFormState = {};

type CartItem = {
  key: string;
  categoryName: string;
  categoryIcon: string;
  subcategoryName: string;
  accessoryName: string;
  qualityTier: QualityTier;
  quantity: number;
  description: string;
  brand: string;
  unitPrice: number;
  laborFee: number;
  laborUnits: number;
  lineTotal: number;
};

export function BookingForm({ catalog }: { catalog: CatalogCategory[] }) {
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [accessoryId, setAccessoryId] = useState("");
  const [qualityTier, setQualityTier] = useState<QualityTier | "">("");
  const [quantity, setQuantity] = useState(1);
  const [itemDescription, setItemDescription] = useState("");
  const [addError, setAddError] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const addPanelRef = useRef<HTMLDivElement>(null);
  const cartLengthRef = useRef(0);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [mapLink, setMapLink] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  const category = catalog.find((c) => c.id === categoryId);
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId);
  const accessory = subcategory?.accessories.find((a) => a.id === accessoryId);
  const currentSelection =
    category && subcategory && accessory && qualityTier
      ? { category, subcategory, accessory, quote: computeQuote(accessory, qualityTier, quantity) }
      : null;

  function handleAddToRequest() {
    if (!currentSelection) {
      setAddError("Please pick a category, sub-category, item, and quality first.");
      return;
    }
    if (itemDescription.trim().length < 10) {
      setAddError("Please describe the issue for this item (10+ characters).");
      return;
    }
    setAddError("");
    setCart((prev) => [
      ...prev,
      {
        key: `${accessoryId}-${qualityTier}-${Date.now()}`,
        categoryName: currentSelection.category.name,
        categoryIcon: currentSelection.category.icon,
        subcategoryName: currentSelection.subcategory.name,
        accessoryName: currentSelection.accessory.name,
        qualityTier: qualityTier as QualityTier,
        quantity,
        description: itemDescription.trim(),
        brand: currentSelection.quote.brand,
        unitPrice: currentSelection.quote.unitPrice,
        laborFee: currentSelection.quote.laborFee,
        laborUnits: currentSelection.quote.laborUnits,
        lineTotal: currentSelection.quote.total,
      },
    ]);
    setCategoryId("");
    setSubcategoryId("");
    setAccessoryId("");
    setQualityTier("");
    setQuantity(1);
    setItemDescription("");
  }

  function removeCartItem(key: string) {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  // Adding (or removing) an item reflows a lot of content above the "Add
  // another service" panel; without this the browser's scroll position can
  // land anywhere, including well past the bottom. Snap back to the panel
  // so the customer can keep adding items without losing their place.
  useEffect(() => {
    if (cart.length !== cartLengthRef.current) {
      cartLengthRef.current = cart.length;
      addPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [cart.length]);

  const grandTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  const itemsJson = JSON.stringify(
    cart.map((item) => ({
      category: item.categoryName,
      subcategory: item.subcategoryName,
      accessory: item.accessoryName,
      qualityTier: item.qualityTier,
      quantity: item.quantity,
      description: item.description,
    }))
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {state.error}
        </p>
      )}

      {cart.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="mb-1 block text-sm font-semibold text-slate-800">
            Your request ({cart.length} {cart.length === 1 ? "item" : "items"})
          </span>
          {cart.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-3 rounded-xl bg-orange-50/60 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-800">
                  <span className="mr-1">{item.categoryIcon}</span>
                  {item.accessoryName} × {item.quantity}
                </p>
                <p className="text-xs text-slate-500">
                  {item.categoryName} → {item.subcategoryName} · {item.qualityTier} ({item.brand})
                </p>
                <p className="text-xs text-orange-700">
                  {item.quantity} × {item.unitPrice} part + {item.laborUnits} × {item.laborFee} labor
                  {item.laborUnits < item.quantity && (
                    <span className="text-orange-500"> (batched)</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-bold text-slate-900">{item.lineTotal} SAR</span>
                <button
                  type="button"
                  onClick={() => removeCartItem(item.key)}
                  aria-label={`Remove ${item.accessoryName}`}
                  className="rounded-full px-2 py-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <div className="space-y-1 border-t border-slate-200 pt-2 text-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span>Booking fee</span>
              <span>{BOOKING_FEE_SAR} SAR</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Total for this visit</span>
              <span>{grandTotal + BOOKING_FEE_SAR} SAR</span>
            </div>
          </div>
        </div>
      )}

      <div
        ref={addPanelRef}
        className="scroll-mt-4 rounded-2xl border border-dashed border-orange-300 bg-orange-50/30 p-4"
      >
        <span className="mb-2 block text-sm font-semibold text-slate-800">
          {cart.length > 0 ? "Add another service" : "What do you need help with?"}
        </span>
        <ServiceSelector
          catalog={catalog}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          accessoryId={accessoryId}
          qualityTier={qualityTier}
          onChange={(next) => {
            setCategoryId(next.categoryId);
            setSubcategoryId(next.subcategoryId);
            setAccessoryId(next.accessoryId);
            setQualityTier(next.qualityTier);
          }}
        />

        {currentSelection && (
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                How many? (e.g. 3 water heaters, 5 taps)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  −
                </button>
                <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Describe the issue for this item
              </span>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                rows={2}
                className="input"
                placeholder="e.g. Kitchen socket stopped working after a power cut."
              />
            </label>

            <div className="rounded-xl bg-orange-100 px-4 py-3 text-sm text-orange-900">
              <span className="font-semibold">{currentSelection.accessory.name}</span> (
              {currentSelection.quote.brand})
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold">{currentSelection.quote.total} SAR</span>
                <span className="text-xs text-orange-700">
                  ({quantity} × {currentSelection.quote.unitPrice} part + {currentSelection.quote.laborUnits}{" "}
                  × {currentSelection.quote.laborFee} labor — all-inclusive)
                </span>
              </div>
              {currentSelection.quote.laborUnits < quantity && (
                <p className="mt-1 text-xs text-orange-700">
                  One technician visit covers up to {currentSelection.accessory.laborBatchSize} of
                  this item, so labor is only charged {currentSelection.quote.laborUnits} time
                  {currentSelection.quote.laborUnits === 1 ? "" : "s"} for {quantity}.
                </p>
              )}
            </div>

            {addError && <p className="text-xs text-red-600">{addError}</p>}

            <button
              type="button"
              onClick={handleAddToRequest}
              className="w-full rounded-xl border-2 border-orange-500 bg-white px-4 py-2 font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              + Add to request
            </button>
          </div>
        )}
        {!currentSelection && addError && <p className="mt-2 text-xs text-red-600">{addError}</p>}
      </div>

      <input type="hidden" name="items" value={itemsJson} />
      {state.fieldErrors?.items && (
        <p className="text-xs text-red-600">{state.fieldErrors.items}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={state.fieldErrors?.customerName}>
          <input name="customerName" required className="input" placeholder="e.g. Abdullah Al-Fauze" />
        </Field>

        <Field label="Phone number" error={state.fieldErrors?.phone}>
          <input name="phone" required type="tel" className="input" placeholder="05xxxxxxxx" />
        </Field>

        <Field label="City" error={state.fieldErrors?.city}>
          <select name="city" required className="input" defaultValue="">
            <option value="" disabled>
              Select a city
            </option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Additional address info" error={state.fieldErrors?.addressDetails}>
          <input
            name="addressDetails"
            required
            className="input"
            placeholder="Building no., floor, apartment"
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-orange-50/40 p-4">
        <LocationPicker
          lat={lat}
          lng={lng}
          mapLink={mapLink}
          onPinChange={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
          onLinkChange={setMapLink}
        />
        <input type="hidden" name="locationLat" value={lat ?? ""} />
        <input type="hidden" name="locationLng" value={lng ?? ""} />
        <input type="hidden" name="locationMapLink" value={mapLink} />
        {state.fieldErrors?.locationMapLink && (
          <p className="mt-2 text-xs text-red-600">{state.fieldErrors.locationMapLink}</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <DateTimePicker
          selectedDate={date}
          selectedSlot={slot}
          onSelectDate={(iso) => {
            setDate(iso);
            setSlot("");
          }}
          onSelectSlot={setSlot}
        />
        <input type="hidden" name="preferredDate" value={date} />
        <input type="hidden" name="preferredTimeSlot" value={slot} />
        {(state.fieldErrors?.preferredDate || state.fieldErrors?.preferredTimeSlot) && (
          <p className="mt-2 text-xs text-red-600">
            {state.fieldErrors.preferredDate || state.fieldErrors.preferredTimeSlot}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || cart.length === 0}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-60"
      >
        {pending
          ? "Submitting…"
          : cart.length === 0
            ? "Add at least one service above"
            : `Request a technician — ${grandTotal + BOOKING_FEE_SAR} SAR`}
      </button>

      <p className="text-center text-xs text-slate-500">
        We&apos;ll confirm your booking and be in touch to schedule a visit. No payment is taken
        yet — the price shown is all-inclusive, with nothing more to confirm before dispatch.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
