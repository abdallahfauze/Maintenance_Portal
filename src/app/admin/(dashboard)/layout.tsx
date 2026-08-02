import Link from "next/link";
import { logout } from "@/app/actions/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-bold text-slate-900">Maintenance Portal — Admin</span>
          <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900">
            Bookings
          </Link>
          <Link href="/admin/overview" className="text-sm text-slate-600 hover:text-slate-900">
            Overview
          </Link>
          <Link href="/admin/contractors" className="text-sm text-slate-600 hover:text-slate-900">
            Contractors
          </Link>
          <Link href="/admin/feedback" className="text-sm text-slate-600 hover:text-slate-900">
            Feedback
          </Link>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
            Log out
          </button>
        </form>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
