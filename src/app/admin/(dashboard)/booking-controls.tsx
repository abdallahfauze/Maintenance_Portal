"use client";

import { useTransition } from "react";
import { assignContractor, updateBookingStatus } from "@/app/actions/admin";
import { BOOKING_STATUSES, STATUS_LABELS, type BookingStatus } from "@/lib/constants";

type Contractor = { id: string; name: string; phone: string };

export function AssignForm({
  bookingId,
  currentContractorId,
  contractors,
}: {
  bookingId: string;
  currentContractorId: string | null;
  contractors: Contractor[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-600">
      Assign to
      <select
        className="input !w-auto py-1 text-xs"
        defaultValue={currentContractorId ?? ""}
        disabled={pending}
        onChange={(e) => {
          const contractorId = e.target.value;
          if (!contractorId) return;
          startTransition(() => {
            assignContractor(bookingId, contractorId);
          });
        }}
      >
        <option value="" disabled>
          {contractors.length === 0 ? "No active contractors for this trade" : "Select contractor"}
        </option>
        {contractors.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.phone})
          </option>
        ))}
      </select>
    </label>
  );
}

export function StatusForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-600">
      Status
      <select
        className="input !w-auto py-1 text-xs"
        defaultValue={currentStatus}
        disabled={pending}
        onChange={(e) => {
          const status = e.target.value;
          startTransition(() => {
            updateBookingStatus(bookingId, status);
          });
        }}
      >
        {BOOKING_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
