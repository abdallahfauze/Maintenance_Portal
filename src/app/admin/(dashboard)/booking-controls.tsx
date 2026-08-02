"use client";

import { useState, useTransition } from "react";
import {
  assignContractor,
  updateBookingStatus,
  updateCompletionNotes,
  escalateBooking,
  resolveEscalation,
} from "@/app/actions/admin";
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

export function CompletionNotesField({
  bookingId,
  notes,
}: {
  bookingId: string;
  notes: string | null;
}) {
  const [value, setValue] = useState(notes ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <label className="block text-xs text-slate-600">
      Completion notes
      <textarea
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => startTransition(() => updateCompletionNotes(bookingId, value))}
        rows={2}
        placeholder="What was done, parts used, anything the customer should know…"
        className="input mt-1 text-xs"
      />
    </label>
  );
}

export function EscalationControls({
  bookingId,
  isEscalated,
  escalationReason,
}: {
  bookingId: string;
  isEscalated: boolean;
  escalationReason: string | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  if (isEscalated) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
        <span className="font-semibold">⚠ Escalated:</span>
        <span>{escalationReason}</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => resolveEscalation(bookingId))}
          className="ml-auto rounded-full border border-red-300 px-2.5 py-1 font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
          Resolve
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="text-xs font-medium text-red-600 hover:underline"
      >
        ⚠ Flag delay / escalate
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (e.g. contractor running 2 hours late)"
        className="input !w-auto flex-1 py-1 text-xs"
      />
      <button
        type="button"
        disabled={pending || !reason.trim()}
        onClick={() =>
          startTransition(async () => {
            await escalateBooking(bookingId, reason);
            setShowForm(false);
            setReason("");
          })
        }
        className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        Flag
      </button>
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="text-xs text-slate-400 hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
