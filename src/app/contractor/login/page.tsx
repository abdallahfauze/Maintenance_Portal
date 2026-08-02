"use client";

import { useActionState } from "react";
import { contractorLogin, type ContractorLoginState } from "@/app/actions/contractor-portal";

const initialState: ContractorLoginState = {};

export default function ContractorLoginPage() {
  const [state, formAction, pending] = useActionState(contractorLogin, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Partner portal login</h1>
      <p className="mb-6 text-sm text-slate-500">
        Log in with the phone number and password given to you by Maintenance Portal.
      </p>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}
        <input
          type="tel"
          name="phone"
          required
          placeholder="Phone number"
          className="input"
          autoFocus
        />
        <input type="password" name="password" required placeholder="Password" className="input" />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
