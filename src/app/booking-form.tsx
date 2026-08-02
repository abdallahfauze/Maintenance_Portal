"use client";

import { useActionState } from "react";
import { createBooking, type BookingFormState } from "@/app/actions/bookings";
import { CITIES, TRADES } from "@/lib/constants";

const initialState: BookingFormState = {};

export function BookingForm() {
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={state.fieldErrors?.customerName}>
          <input
            name="customerName"
            required
            className="input"
            placeholder="e.g. Abdullah Al-Fauze"
          />
        </Field>

        <Field label="Phone number" error={state.fieldErrors?.phone}>
          <input
            name="phone"
            required
            type="tel"
            className="input"
            placeholder="05xxxxxxxx"
          />
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

        <Field label="What do you need help with?" error={state.fieldErrors?.trade}>
          <select name="trade" required className="input" defaultValue="">
            <option value="" disabled>
              Select a service
            </option>
            {TRADES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Address for the visit" error={state.fieldErrors?.address}>
        <input
          name="address"
          required
          className="input"
          placeholder="Building, street, district, Jeddah"
        />
      </Field>

      <Field label="Preferred date & time" error={state.fieldErrors?.preferredTime}>
        <input
          name="preferredTime"
          required
          className="input"
          placeholder="e.g. Tomorrow morning, or Thu 4-6pm"
        />
      </Field>

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
        className="w-full rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
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
