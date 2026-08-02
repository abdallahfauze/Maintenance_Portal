"use client";

import { useTransition } from "react";
import { toggleTechnicianActive } from "@/app/actions/contractor-portal";

export function TechnicianActiveToggle({
  technicianId,
  active,
}: {
  technicianId: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleTechnicianActive(technicianId, !active))}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
      } disabled:opacity-60`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
