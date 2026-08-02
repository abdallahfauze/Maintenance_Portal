"use client";

import { useState, useTransition } from "react";
import {
  updateOwnBookingStatus,
  updateOwnCompletionNotes,
  escalateOwnBooking,
  assignTechnician,
} from "@/app/actions/contractor-portal";
import { SELF_ALLOWED_TRANSITIONS, STATUS_LABELS, type BookingStatus } from "@/lib/constants";

export function OwnStatusForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const [pending, startTransition] = useTransition();
  const nextOptions = SELF_ALLOWED_TRANSITIONS[currentStatus] ?? [];

  if (nextOptions.length === 0) {
    return <span className="text-xs text-slate-400">No further action available</span>;
  }

  return (
    <label className="flex items-center gap-2 text-xs text-slate-600">
      Update status
      <select
        key={currentStatus}
        className="input !w-auto py-1 text-xs"
        defaultValue=""
        disabled={pending}
        onChange={(e) => {
          const status = e.target.value;
          if (!status) return;
          startTransition(() => updateOwnBookingStatus(bookingId, status));
        }}
      >
        <option value="" disabled>
          {STATUS_LABELS[currentStatus]} — mark as…
        </option>
        {nextOptions.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TechnicianAssignForm({
  bookingId,
  currentTechnicianId,
  technicians,
}: {
  bookingId: string;
  currentTechnicianId: string | null;
  technicians: { id: string; name: string; phone: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-600">
      Assign to technician
      <select
        className="input !w-auto py-1 text-xs"
        defaultValue={currentTechnicianId ?? ""}
        disabled={pending}
        onChange={(e) => startTransition(() => assignTechnician(bookingId, e.target.value))}
      >
        <option value="">
          {technicians.length === 0 ? "No technicians added yet" : "Unassigned"}
        </option>
        {technicians.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.phone})
          </option>
        ))}
      </select>
    </label>
  );
}

export function OwnCompletionNotesField({
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
        onBlur={() => startTransition(() => updateOwnCompletionNotes(bookingId, value))}
        rows={2}
        placeholder="What was done, parts used, anything the customer should know…"
        className="input mt-1 text-xs"
      />
    </label>
  );
}

export function OwnEscalationControls({
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
      <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
        <span className="font-semibold">⚠ Flagged:</span> {escalationReason}
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
        ⚠ Report a delay to Maintenance Portal
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's causing the delay?"
        className="input !w-auto flex-1 py-1 text-xs"
      />
      <button
        type="button"
        disabled={pending || !reason.trim()}
        onClick={() =>
          startTransition(async () => {
            await escalateOwnBooking(bookingId, reason);
            setShowForm(false);
            setReason("");
          })
        }
        className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        Report
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
