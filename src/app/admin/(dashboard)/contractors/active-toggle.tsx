"use client";

import { useTransition } from "react";
import { toggleContractorActive } from "@/app/actions/admin";

export function ActiveToggle({
  contractorId,
  active,
}: {
  contractorId: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleContractorActive(contractorId, !active))}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
      } disabled:opacity-60`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
