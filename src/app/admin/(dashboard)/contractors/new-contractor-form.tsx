"use client";

import { useActionState, useRef, useEffect } from "react";
import { createContractor, type ContractorFormState } from "@/app/actions/admin";
import { CITIES } from "@/lib/constants";

const initialState: ContractorFormState = {};

export function NewContractorForm({ categories }: { categories: string[] }) {
  const [state, formAction, pending] = useActionState(createContractor, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-5 sm:items-end">
      {state.error && (
        <p className="sm:col-span-5 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <label className="text-xs text-slate-600 sm:col-span-2">
        Company name
        <input name="name" required className="input mt-1" placeholder="e.g. Noor Electric Est." />
      </label>
      <label className="text-xs text-slate-600">
        Contact person
        <input name="contactPerson" className="input mt-1" placeholder="e.g. Faisal Al-Ghamdi" />
      </label>
      <label className="text-xs text-slate-600">
        Category
        <select name="category" required className="input mt-1" defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-slate-600">
        City
        <select name="city" required className="input mt-1" defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-slate-600">
        Phone
        <input name="phone" required className="input mt-1" placeholder="05xxxxxxxx" />
      </label>
      <label className="text-xs text-slate-600">
        Balady license #
        <input name="baladyLicenseNumber" className="input mt-1" placeholder="Optional for now" />
      </label>
      <label className="text-xs text-slate-600">
        Balady license expiry
        <input name="baladyLicenseExpiry" type="date" className="input mt-1" />
      </label>
      <label className="text-xs text-slate-600 sm:col-span-2">
        Civil Defense / SCA license # (if applicable)
        <input name="civilDefenseLicenseNumber" className="input mt-1" placeholder="Optional" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 sm:col-span-5 sm:w-fit"
      >
        {pending ? "Adding…" : "Add applicant"}
      </button>
      <p className="text-xs text-slate-500 sm:col-span-5">
        New applicants start at &quot;Applied&quot; and inactive — move them through the
        onboarding funnel below once you&apos;ve verified their license and insurance.
      </p>
    </form>
  );
}
