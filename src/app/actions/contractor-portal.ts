"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  CONTRACTOR_SESSION_COOKIE,
  createContractorSessionToken,
  getSessionContractorId,
  verifyPassword,
} from "@/lib/contractor-auth";
import { STATUS_TIMESTAMP_FIELD, SELF_ALLOWED_TRANSITIONS } from "@/lib/constants";

export type ContractorLoginState = { error?: string };

export async function contractorLogin(
  _prevState: ContractorLoginState,
  formData: FormData
): Promise<ContractorLoginState> {
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const contractor = await prisma.contractor.findUnique({ where: { phone } });
  if (!contractor || !contractor.passwordHash || !contractor.passwordSalt) {
    return { error: "Incorrect phone number or password." };
  }
  if (!verifyPassword(password, contractor.passwordHash, contractor.passwordSalt)) {
    return { error: "Incorrect phone number or password." };
  }

  const token = await createContractorSessionToken(contractor.id);
  const cookieStore = await cookies();
  cookieStore.set(CONTRACTOR_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/contractor");
}

export async function contractorLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(CONTRACTOR_SESSION_COOKIE);
  redirect("/contractor/login");
}

/** Reads and verifies the session cookie; returns null if not logged in. */
async function getAuthedContractorId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CONTRACTOR_SESSION_COOKIE)?.value;
  return getSessionContractorId(token);
}

export async function updateOwnBookingStatus(bookingId: string, status: string) {
  const contractorId = await getAuthedContractorId();
  if (!contractorId) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { contractorId: true, status: true },
  });
  if (!booking || booking.contractorId !== contractorId) return;
  const allowedNext: string[] = SELF_ALLOWED_TRANSITIONS[booking.status] ?? [];
  if (!allowedNext.includes(status)) return;

  const timestampField = STATUS_TIMESTAMP_FIELD[status as keyof typeof STATUS_TIMESTAMP_FIELD];

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      ...(timestampField ? { [timestampField]: new Date() } : {}),
    },
  });
  revalidatePath("/contractor");
}

export async function updateOwnCompletionNotes(bookingId: string, notes: string) {
  const contractorId = await getAuthedContractorId();
  if (!contractorId) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { contractorId: true },
  });
  if (!booking || booking.contractorId !== contractorId) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { completionNotes: notes.trim() || null },
  });
  revalidatePath("/contractor");
}

export async function escalateOwnBooking(bookingId: string, reason: string) {
  const contractorId = await getAuthedContractorId();
  if (!contractorId) return;
  const trimmed = reason.trim();
  if (!trimmed) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { contractorId: true },
  });
  if (!booking || booking.contractorId !== contractorId) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { isEscalated: true, escalationReason: trimmed, escalatedAt: new Date() },
  });
  revalidatePath("/contractor");
  revalidatePath("/admin");
}

export async function assignTechnician(bookingId: string, technicianId: string) {
  const contractorId = await getAuthedContractorId();
  if (!contractorId) return;

  const [booking, technician] = await Promise.all([
    prisma.booking.findUnique({ where: { id: bookingId }, select: { contractorId: true } }),
    technicianId
      ? prisma.technician.findUnique({ where: { id: technicianId }, select: { contractorId: true } })
      : null,
  ]);
  if (!booking || booking.contractorId !== contractorId) return;
  if (technicianId && (!technician || technician.contractorId !== contractorId)) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { technicianId: technicianId || null },
  });
  revalidatePath("/contractor");
}

const TechnicianSchema = z.object({
  name: z.string().trim().min(2, "Please enter the technician's name."),
  phone: z.string().trim().min(9, "Please enter a valid phone number."),
});

export type TechnicianFormState = { error?: string };

export async function createTechnician(
  _prevState: TechnicianFormState,
  formData: FormData
): Promise<TechnicianFormState> {
  const contractorId = await getAuthedContractorId();
  if (!contractorId) return { error: "Please log in again." };

  const parsed = TechnicianSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the fields." };
  }

  await prisma.technician.create({ data: { ...parsed.data, contractorId } });
  revalidatePath("/contractor/technicians");
  return {};
}

export async function toggleTechnicianActive(technicianId: string, active: boolean) {
  const contractorId = await getAuthedContractorId();
  if (!contractorId) return;

  const technician = await prisma.technician.findUnique({
    where: { id: technicianId },
    select: { contractorId: true },
  });
  if (!technician || technician.contractorId !== contractorId) return;

  await prisma.technician.update({ where: { id: technicianId }, data: { active } });
  revalidatePath("/contractor/technicians");
}

// Called once when the Jobs page loads, so the "N new" badge in the nav
// clears — a lightweight in-app notification substitute until SMS/WhatsApp
// push is wired up (see README "Next steps").
export async function markJobsSeen() {
  const contractorId = await getAuthedContractorId();
  if (!contractorId) return;

  await prisma.contractor.update({
    where: { id: contractorId },
    data: { lastSeenAt: new Date() },
  });
}
