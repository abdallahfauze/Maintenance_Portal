"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTechnician, type TechnicianFormState } from "@/app/actions/contractor-portal";

const initialState: TechnicianFormState = {};

export function NewTechnicianForm() {
  const [state, formAction, pending] = useActionState(createTechnician, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-3 sm:items-end">
      {state.error && (
        <p className="sm:col-span-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <label className="text-xs text-slate-600">
        Name
        <input name="name" required className="input mt-1" placeholder="e.g. Ahmed Al-Otaibi" />
      </label>
      <label className="text-xs text-slate-600">
        Phone
        <input name="phone" required className="input mt-1" placeholder="05xxxxxxxx" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add technician"}
      </button>
    </form>
  );
}
