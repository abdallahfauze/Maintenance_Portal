"use client";

import { useState, useTransition } from "react";
import { updateCommissionRate, updateAgreementStatus } from "@/app/actions/admin";

export function CommissionRateInput({
  contractorId,
  rate,
}: {
  contractorId: string;
  rate: number;
}) {
  const [value, setValue] = useState(rate);
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-1.5 text-xs text-slate-600">
      Commission
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        disabled={pending}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={() => startTransition(() => updateCommissionRate(contractorId, value))}
        className="input w-16 !py-1 text-xs"
      />
      %
    </label>
  );
}

export function AgreementControls({
  contractorId,
  signed,
  signedDate,
}: {
  contractorId: string;
  signed: boolean;
  signedDate: string | null;
}) {
  const [date, setDate] = useState(signedDate ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={signed}
          disabled={pending}
          onChange={(e) =>
            startTransition(() => updateAgreementStatus(contractorId, e.target.checked, date))
          }
          className="h-3.5 w-3.5 rounded border-slate-300"
        />
        Agreement signed
      </label>
      {signed && (
        <input
          type="date"
          value={date}
          disabled={pending}
          onChange={(e) => {
            setDate(e.target.value);
            startTransition(() => updateAgreementStatus(contractorId, true, e.target.value));
          }}
          className="input !w-auto !py-1 text-xs"
        />
      )}
    </div>
  );
}
