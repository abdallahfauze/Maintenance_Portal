"use client";

import { useActionState, useMemo, useState } from "react";
import { createBooking, type BookingFormState } from "@/app/actions/bookings";
import { CITIES } from "@/lib/constants";
import type { CatalogCategory } from "@/lib/catalog-shared";
import { tierBrandAndPrice, type QualityTier } from "@/lib/catalog-shared";
import { ServiceSelector } from "@/components/service-selector";
import { LocationPicker } from "@/components/location-picker";
import { DateTimePicker } from "@/components/date-time-picker";

const initialState: BookingFormState = {};

export function BookingForm({ catalog }: { catalog: CatalogCategory[] }) {
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [accessoryId, setAccessoryId] = useState("");
  const [qualityTier, setQualityTier] = useState<QualityTier | "">("");

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [mapLink, setMapLink] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  const selection = useMemo(() => {
    const category = catalog.find((c) => c.id === categoryId);
    const subcategory = category?.subcategories.find((s) => s.id === subcategoryId);
    const accessory = subcategory?.accessories.find((a) => a.id === accessoryId);
    if (!category || !subcategory || !accessory || !qualityTier) return null;
    const { brand, price } = tierBrandAndPrice(accessory, qualityTier);
    return {
      categoryName: category.name,
      subcategoryName: subcategory.name,
      accessoryName: accessory.name,
      brand,
      price,
    };
  }, [catalog, categoryId, subcategoryId, accessoryId, qualityTier]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {state.error}
        </p>
      )}

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
      <input type="hidden" name="category" value={selection?.categoryName ?? ""} />
      <input type="hidden" name="subcategory" value={selection?.subcategoryName ?? ""} />
      <input type="hidden" name="accessory" value={selection?.accessoryName ?? ""} />
      <input type="hidden" name="qualityTier" value={qualityTier} />
      <input type="hidden" name="selectedBrand" value={selection?.brand ?? ""} />
      <input type="hidden" name="selectedPrice" value={selection?.price ?? ""} />
      {(state.fieldErrors?.category ||
        state.fieldErrors?.subcategory ||
        state.fieldErrors?.accessory ||
        state.fieldErrors?.qualityTier) && (
        <p className="text-xs text-red-600">
          {state.fieldErrors.category ||
            state.fieldErrors.subcategory ||
            state.fieldErrors.accessory ||
            state.fieldErrors.qualityTier}
        </p>
      )}

      {selection && (
        <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-900 ring-1 ring-orange-100">
          <span className="font-semibold">{selection.accessoryName}</span> ({selection.brand}) —{" "}
          <span className="font-bold">{selection.price} SAR</span>
          <span className="ml-1 text-xs text-orange-700">
            (labor/callout fee shown separately at confirmation)
          </span>
        </div>
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

      <Field label="Describe the issue" error={state.fieldErrors?.description}>
        <textarea
          name="description"
          required
          rows={4}
          className="input"
          placeholder="e.g. Kitchen socket stopped working after a power cut."
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Request a technician"}
      </button>

      <p className="text-center text-xs text-slate-500">
        We&apos;ll confirm your booking and be in touch to schedule a visit. No payment is taken
        yet — you&apos;ll get an upfront price estimate before anyone is dispatched.
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
