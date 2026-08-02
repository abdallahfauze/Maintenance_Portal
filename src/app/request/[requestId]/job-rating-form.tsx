"use client";

import { useState, useTransition } from "react";
import { submitJobRating } from "@/app/actions/bookings";

export function JobRatingForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return (
      <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-800">
        Thanks for your feedback!
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-lg bg-white/70 p-3">
      <p className="mb-1.5 text-xs font-medium text-slate-700">Rate this job</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            disabled={pending}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl leading-none disabled:opacity-60"
          >
            {(hoverRating || rating) >= n ? "★" : "☆"}
          </button>
        ))}
      </div>
      {rating > 0 && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Anything else you'd like to share? (optional)"
            className="input mt-2 text-xs"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await submitJobRating(bookingId, rating, comment);
                if (result.error) {
                  setError(result.error);
                } else {
                  setSubmitted(true);
                }
              })
            }
            className="mt-2 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit rating"}
          </button>
        </>
      )}
    </div>
  );
}
