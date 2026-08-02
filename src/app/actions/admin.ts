"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { BOOKING_STATUSES } from "@/lib/constants";

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
  await prisma.booking.update({
    where: { id: bookingId },
    data: { contractorId, status: "ASSIGNED" },
  });
  revalidatePath("/admin");
}

const StatusEnum = z.enum(BOOKING_STATUSES);

export async function updateBookingStatus(bookingId: string, status: string) {
  const parsed = StatusEnum.safeParse(status);
  if (!parsed.success) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: parsed.data },
  });
  revalidatePath("/admin");
}

const ContractorSchema = z.object({
  name: z.string().trim().min(2),
  category: z.string().trim().min(1),
  city: z.string().trim().min(2),
  phone: z.string().trim().min(9),
});

export type ContractorFormState = { error?: string };

export async function createContractor(
  _prevState: ContractorFormState,
  formData: FormData
): Promise<ContractorFormState> {
  const parsed = ContractorSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    city: formData.get("city"),
    phone: formData.get("phone"),
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

  await prisma.contractor.create({ data: parsed.data });
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
