import Link from "next/link";
import { BookingForm } from "@/app/booking-form";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getCatalog();

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <div className="app-backdrop" aria-hidden />

      <header className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-orange-700 shadow-sm ring-1 ring-orange-100 backdrop-blur">
          🔧 Now serving Jeddah
        </span>
        <h1 className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Maintenance Portal
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Electrical, plumbing, HVAC &amp; home repairs — book a vetted technician in minutes.
        </p>
      </header>

      <main className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-orange-900/5 backdrop-blur sm:p-8">
        <BookingForm catalog={catalog} />
      </main>

      <footer className="mt-10 text-center text-xs text-slate-400">
        <p>Stage 0 pilot — currently serving Jeddah only.</p>
        <Link href="/admin/login" className="underline hover:text-slate-600">
          Partner / admin login
        </Link>
      </footer>
    </div>
  );
}
