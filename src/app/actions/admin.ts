"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { BOOKING_STATUSES, ONBOARDING_STATUSES, CONTRACTOR_TIERS } from "@/lib/constants";

export type LoginState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Incorrect password." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function assignContractor(bookingId: string, contractorId: string) {
  // Compute the platform/contractor split using the contractor's commission
  // rate *at assignment time* — a snapshot, so a later change to their rate
  // doesn't retroactively shift what's owed on a job already assigned.
  const [booking, contractor] = await Promise.all([
    prisma.booking.findUnique({ where: { id: bookingId }, select: { totalPrice: true } }),
    prisma.contractor.findUnique({ where: { id: contractorId }, select: { commissionRate: true } }),
  ]);
  if (!booking || !contractor) return;

  const platformCommission = Math.round((booking.totalPrice * contractor.commissionRate) / 100);
  const contractorPayout = booking.totalPrice - platformCommission;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      contractorId,
      status: "ASSIGNED",
      platformCommission,
      contractorPayout,
      assignedAt: new Date(),
    },
  });
  revalidatePath("/admin");
}

const StatusEnum = z.enum(BOOKING_STATUSES);

// Timestamp field to stamp with "now" whenever a booking enters that status
// (re-entering a status, e.g. IN_PROGRESS after a correction, refreshes it).
const STATUS_TIMESTAMP_FIELD = {
  PENDING: null,
  ASSIGNED: "assignedAt",
  IN_PROGRESS: "startedAt",
  COMPLETED: "completedAt",
  CANCELLED: "cancelledAt",
} as const;

export async function updateBookingStatus(bookingId: string, status: string) {
  const parsed = StatusEnum.safeParse(status);
  if (!parsed.success) return;

  const timestampField = STATUS_TIMESTAMP_FIELD[parsed.data];

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: parsed.data,
      ...(timestampField ? { [timestampField]: new Date() } : {}),
    },
  });
  revalidatePath("/admin");
}

export async function updateCompletionNotes(bookingId: string, notes: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { completionNotes: notes.trim() || null },
  });
  revalidatePath("/admin");
}

export async function escalateBooking(bookingId: string, reason: string) {
  const trimmed = reason.trim();
  if (!trimmed) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { isEscalated: true, escalationReason: trimmed, escalatedAt: new Date() },
  });
  revalidatePath("/admin");
}

export async function resolveEscalation(bookingId: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { isEscalated: false },
  });
  revalidatePath("/admin");
}

const ContractorSchema = z.object({
  name: z.string().trim().min(2),
  contactPerson: z.string().trim().max(200).optional().or(z.literal("")),
  category: z.string().trim().min(1),
  city: z.string().trim().min(2),
  phone: z.string().trim().min(9),
  baladyLicenseNumber: z.string().trim().max(100).optional().or(z.literal("")),
  baladyLicenseExpiry: z.string().trim().max(20).optional().or(z.literal("")),
  civilDefenseLicenseNumber: z.string().trim().max(100).optional().or(z.literal("")),
});

export type ContractorFormState = { error?: string };

// A new applicant always starts at the beginning of the onboarding funnel —
// unverified and not yet offered for job assignment — regardless of what's
// typed into the intake form. Moving them to Active is a separate, deliberate
// admin action (see updateOnboardingStatus below).
export async function createContractor(
  _prevState: ContractorFormState,
  formData: FormData
): Promise<ContractorFormState> {
  const parsed = ContractorSchema.safeParse({
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson") ?? "",
    category: formData.get("category"),
    city: formData.get("city"),
    phone: formData.get("phone"),
    baladyLicenseNumber: formData.get("baladyLicenseNumber") ?? "",
    baladyLicenseExpiry: formData.get("baladyLicenseExpiry") ?? "",
    civilDefenseLicenseNumber: formData.get("civilDefenseLicenseNumber") ?? "",
  });

  if (!parsed.success) {
    return { error: "Please fill in all fields correctly." };
  }

  const categoryExists = await prisma.serviceCategory.findUnique({
    where: { name: parsed.data.category },
  });
  if (!categoryExists) {
    return { error: "Please select a valid category." };
  }

  const { contactPerson, baladyLicenseNumber, baladyLicenseExpiry, civilDefenseLicenseNumber, ...rest } =
    parsed.data;

  await prisma.contractor.create({
    data: {
      ...rest,
      contactPerson: contactPerson || null,
      baladyLicenseNumber: baladyLicenseNumber || null,
      baladyLicenseExpiry: baladyLicenseExpiry || null,
      civilDefenseLicenseNumber: civilDefenseLicenseNumber || null,
      onboardingStatus: "APPLIED",
      active: false,
      tier: "Bronze",
      licenseVerified: false,
      insuranceVerified: false,
    },
  });
  revalidatePath("/admin/contractors");
  return {};
}

export async function toggleContractorActive(contractorId: string, active: boolean) {
  await prisma.contractor.update({
    where: { id: contractorId },
    data: { active },
  });
  revalidatePath("/admin/contractors");
  revalidatePath("/admin");
}

const OnboardingStatusEnum = z.enum(ONBOARDING_STATUSES);

export async function updateOnboardingStatus(contractorId: string, status: string) {
  const parsed = OnboardingStatusEnum.safeParse(status);
  if (!parsed.success) return;

  await prisma.contractor.update({
    where: { id: contractorId },
    data: { onboardingStatus: parsed.data },
  });
  revalidatePath("/admin/contractors");
  revalidatePath("/admin");
}

const TierEnum = z.enum(CONTRACTOR_TIERS);

export async function updateContractorTier(contractorId: string, tier: string) {
  const parsed = TierEnum.safeParse(tier);
  if (!parsed.success) return;

  await prisma.contractor.update({
    where: { id: contractorId },
    data: { tier: parsed.data },
  });
  revalidatePath("/admin/contractors");
}

export async function toggleLicenseVerified(contractorId: string, verified: boolean) {
  await prisma.contractor.update({
    where: { id: contractorId },
    data: { licenseVerified: verified },
  });
  revalidatePath("/admin/contractors");
}

export async function toggleInsuranceVerified(contractorId: string, verified: boolean) {
  await prisma.contractor.update({
    where: { id: contractorId },
    data: { insuranceVerified: verified },
  });
  revalidatePath("/admin/contractors");
}

const CommissionRateSchema = z.coerce.number().int().min(0).max(100);

export async function updateCommissionRate(contractorId: string, rate: number) {
  const parsed = CommissionRateSchema.safeParse(rate);
  if (!parsed.success) return;

  await prisma.contractor.update({
    where: { id: contractorId },
    data: { commissionRate: parsed.data },
  });
  revalidatePath("/admin/contractors");
  revalidatePath("/admin");
}

export async function updateAgreementStatus(contractorId: string, signed: boolean, date: string) {
  await prisma.contractor.update({
    where: { id: contractorId },
    data: {
      agreementSigned: signed,
      agreementSignedDate: signed ? date || null : null,
    },
  });
  revalidatePath("/admin/contractors");
}
