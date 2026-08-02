"use client";

import { useState, useTransition } from "react";
import { generateContractorPassword } from "@/app/actions/admin";

export function PortalPasswordButton({
  contractorId,
  hasPassword,
}: {
  contractorId: string;
  hasPassword: boolean;
}) {
  const [password, setPassword] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (password) {
    return (
      <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Portal password (share by phone, shown once):{" "}
        <span className="font-mono font-bold">{password}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await generateContractorPassword(contractorId);
          if ("password" in result) setPassword(result.password);
        })
      }
      className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
    >
      {hasPassword ? "Reset portal password" : "Generate portal password"}
    </button>
  );
}
