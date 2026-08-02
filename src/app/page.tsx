import Link from "next/link";
import { BookingForm } from "@/app/booking-form";

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Maintenance Portal</h1>
        <p className="mt-2 text-slate-600">
          Electrical, plumbing, HVAC &amp; home repairs in Jeddah — book a vetted technician in
          minutes.
        </p>
      </header>

      <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <BookingForm />
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
