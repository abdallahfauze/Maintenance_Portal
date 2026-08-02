"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CITIES, TRADES } from "@/lib/constants";

const BookingSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name."),
  phone: z
    .string()
    .trim()
    .min(9, "Please enter a valid phone number.")
    .max(20, "Please enter a valid phone number."),
  city: z.enum(CITIES, { error: "Please select a city." }),
  trade: z.enum(TRADES, { error: "Please select a service type." }),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue in a bit more detail (10+ characters)."),
  address: z.string().trim().min(5, "Please enter the address for the visit."),
  preferredTime: z.string().trim().min(1, "Please choose a preferred time."),
});

export type BookingFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof BookingSchema>, string>>;
};

export async function createBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const raw = {
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    trade: formData.get("trade"),
    description: formData.get("description"),
    address: formData.get("address"),
    preferredTime: formData.get("preferredTime"),
  };

  const parsed = BookingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: BookingFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof BookingSchema>;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const booking = await prisma.booking.create({ data: parsed.data });

  redirect(`/booking/${booking.id}`);
}
