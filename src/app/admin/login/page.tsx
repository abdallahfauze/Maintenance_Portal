"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/admin";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Admin / dispatch login</h1>
      <p className="mb-6 text-sm text-slate-500">Internal use only — Stage 0 pilot.</p>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          className="input"
          autoFocus
        />
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
