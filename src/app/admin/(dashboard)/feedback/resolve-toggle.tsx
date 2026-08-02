"use client";

import { useTransition } from "react";
import { toggleFeedbackResolved } from "@/app/actions/feedback";

export function ResolveToggle({ id, resolved }: { id: string; resolved: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleFeedbackResolved(id, !resolved))}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
        resolved ? "bg-slate-200 text-slate-600" : "bg-amber-100 text-amber-800"
      } disabled:opacity-60`}
    >
      {resolved ? "Reopen" : "Mark resolved"}
    </button>
  );
}
