"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { submitFeedback, type FeedbackFormState } from "@/app/actions/feedback";

const initialState: FeedbackFormState = {};

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [state.success]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <p className="mb-2 text-sm font-semibold text-slate-900">Leave feedback on this page</p>
          <p className="mb-3 text-xs text-slate-500">
            Comment will be tagged with: <code className="rounded bg-slate-100 px-1">{pathname}</code>
          </p>

          {state.success ? (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Thanks — got it!
            </p>
          ) : (
            <form action={formAction} className="space-y-2">
              <input type="hidden" name="page" value={pathname} />
              {state.error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
              )}
              <textarea
                name="comment"
                required
                rows={4}
                autoFocus
                className="input text-sm"
                placeholder="What should change on this page?"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-slate-700"
      >
        {open ? "Close" : "💬 Leave feedback"}
      </button>
    </div>
  );
}
