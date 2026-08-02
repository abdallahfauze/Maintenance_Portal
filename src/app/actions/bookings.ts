"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CITIES, TRADES } from "@/lib/constants";

const BookingSchema = z
  .object({
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
    locationLat: z.coerce.number().optional(),
    locationLng: z.coerce.number().optional(),
    locationMapLink: z.string().trim().max(500).optional().or(z.literal("")),
    addressDetails: z
      .string()
      .trim()
      .min(2, "Please add building/floor/apartment details."),
    preferredDate: z.string().trim().min(1, "Please choose a date."),
    preferredTimeSlot: z.string().trim().min(1, "Please choose a time slot."),
  })
  .refine(
    (data) =>
      (data.locationLat != null && data.locationLng != null) ||
      (data.locationMapLink && data.locationMapLink.length > 0),
    {
      message: "Please pin your location on the map or paste a Google Maps link.",
      path: ["locationMapLink"],
    }
  );

export type BookingFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function createBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const rawLat = formData.get("locationLat");
  const rawLng = formData.get("locationLng");

  const raw = {
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    trade: formData.get("trade"),
    description: formData.get("description"),
    locationLat: rawLat ? rawLat : undefined,
    locationLng: rawLng ? rawLng : undefined,
    locationMapLink: formData.get("locationMapLink") ?? "",
    addressDetails: formData.get("addressDetails"),
    preferredDate: formData.get("preferredDate"),
    preferredTimeSlot: formData.get("preferredTimeSlot"),
  };

  const parsed = BookingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: BookingFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { locationMapLink, ...rest } = parsed.data;

  const booking = await prisma.booking.create({
    data: { ...rest, locationMapLink: locationMapLink || null },
  });

  redirect(`/booking/${booking.id}`);
}
