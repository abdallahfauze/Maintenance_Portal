import { prisma } from "@/lib/prisma";
import { ResolveToggle } from "./resolve-toggle";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const feedback = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
  const open = feedback.filter((f) => !f.resolved);
  const resolved = feedback.filter((f) => f.resolved);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Feedback</h1>
      <p className="mb-6 text-sm text-slate-500">
        Comments left via the &ldquo;💬 Leave feedback&rdquo; widget on any page, newest first.
      </p>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Open ({open.length})</h2>
      <div className="mb-8 space-y-3">
        {open.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No open feedback.
          </p>
        )}
        {open.map((f) => (
          <FeedbackCard key={f.id} feedback={f} />
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Resolved ({resolved.length})</h2>
          <div className="space-y-3">
            {resolved.map((f) => (
              <FeedbackCard key={f.id} feedback={f} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeedbackCard({
  feedback,
}: {
  feedback: { id: string; page: string; comment: string; resolved: boolean; createdAt: Date };
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        feedback.resolved ? "border-slate-100 opacity-60" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
            {feedback.page}
          </code>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{feedback.comment}</p>
          <p className="mt-2 text-xs text-slate-400">
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(feedback.createdAt)}
          </p>
        </div>
        <ResolveToggle id={feedback.id} resolved={feedback.resolved} />
      </div>
    </div>
  );
}
