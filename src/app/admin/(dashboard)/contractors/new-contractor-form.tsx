"use client";

import { useActionState, useRef, useEffect } from "react";
import { createContractor, type ContractorFormState } from "@/app/actions/admin";
import { CITIES, TRADES } from "@/lib/constants";

const initialState: ContractorFormState = {};

export function NewContractorForm() {
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
        Trade
        <select name="trade" required className="input mt-1" defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {TRADES.map((t) => (
            <option key={t} value={t}>
              {t}
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
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 sm:col-span-5 sm:w-fit"
      >
        {pending ? "Adding…" : "Add contractor"}
      </button>
    </form>
  );
}
