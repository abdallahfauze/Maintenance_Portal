"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/constants";
import { QUALITY_TIERS, computeQuote } from "@/lib/catalog";
import type { Prisma } from "@/generated/prisma/client";

const ItemSchema = z.object({
  category: z.string().trim().min(1, "Please select a service category."),
  subcategory: z.string().trim().min(1, "Please select a sub-category."),
  accessory: z.string().trim().min(1, "Please select an item."),
  qualityTier: z.enum(QUALITY_TIERS, { error: "Please choose a quality tier." }),
  quantity: z.coerce.number().int().min(1).max(20),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue in a bit more detail (10+ characters)."),
});

const BookingRequestSchema = z
  .object({
    customerName: z.string().trim().min(2, "Please enter your full name."),
    phone: z
      .string()
      .trim()
      .min(9, "Please enter a valid phone number.")
      .max(20, "Please enter a valid phone number."),
    city: z.enum(CITIES, { error: "Please select a city." }),
    items: z.array(ItemSchema).min(1, "Please add at least one service to your request."),
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

  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }

  const raw = {
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    items,
    locationLat: rawLat ? rawLat : undefined,
    locationLng: rawLng ? rawLng : undefined,
    locationMapLink: formData.get("locationMapLink") ?? "",
    addressDetails: formData.get("addressDetails"),
    preferredDate: formData.get("preferredDate"),
    preferredTimeSlot: formData.get("preferredTimeSlot"),
  };

  const parsed = BookingRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: BookingFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { locationMapLink, items: parsedItems, ...shared } = parsed.data;

  // Re-derive brand & price from the database rather than trusting the
  // client's hidden fields — never trust a submitted price.
  const bookingsData: Prisma.BookingCreateInput[] = [];
  const requestId = randomUUID();

  for (const item of parsedItems) {
    const accessoryRecord = await prisma.serviceAccessory.findFirst({
      where: {
        name: item.accessory,
        subcategory: { name: item.subcategory, category: { name: item.category } },
      },
    });

    if (!accessoryRecord) {
      return {
        error: "One of your selections is no longer available — please pick again.",
        fieldErrors: { items: `"${item.accessory}" couldn't be found in the catalog.` },
      };
    }

    const quote = computeQuote(accessoryRecord, item.qualityTier, item.quantity);

    bookingsData.push({
      ...shared,
      requestId,
      category: item.category,
      subcategory: item.subcategory,
      accessory: item.accessory,
      qualityTier: item.qualityTier,
      quantity: item.quantity,
      description: item.description,
      selectedBrand: quote.brand,
      selectedPrice: quote.unitPrice,
      laborFee: quote.laborFee,
      laborUnits: quote.laborUnits,
      totalPrice: quote.total,
      locationMapLink: locationMapLink || null,
    });
  }

  await prisma.$transaction(
    bookingsData.map((data) => prisma.booking.create({ data }))
  );

  redirect(`/request/${requestId}`);
}

const RatingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type RatingState = { error?: string; success?: boolean };

// Public, unauthenticated (same trust model as the site feedback widget) —
// a booking ID is a cuid, not guessable, and only completed jobs can be
// rated, so this can't be used to review a job that hasn't happened.
export async function submitJobRating(
  bookingId: string,
  rating: number,
  comment: string
): Promise<RatingState> {
  const parsed = RatingSchema.safeParse({ rating, comment });
  if (!parsed.success) {
    return { error: "Please select a rating from 1 to 5 stars." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { status: true, requestId: true },
  });
  if (!booking) return { error: "Booking not found." };
  if (booking.status !== "COMPLETED") {
    return { error: "You can only rate a job once it's marked completed." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      customerRating: parsed.data.rating,
      customerFeedback: parsed.data.comment || null,
      feedbackSubmittedAt: new Date(),
    },
  });
  revalidatePath(`/request/${booking.requestId}`);
  return { success: true };
}
