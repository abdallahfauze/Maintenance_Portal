"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/constants";
import { QUALITY_TIERS, tierBrandAndPrice } from "@/lib/catalog";
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

    const { brand, price, laborFee } = tierBrandAndPrice(accessoryRecord, item.qualityTier);

    bookingsData.push({
      ...shared,
      requestId,
      category: item.category,
      subcategory: item.subcategory,
      accessory: item.accessory,
      qualityTier: item.qualityTier,
      quantity: item.quantity,
      description: item.description,
      selectedBrand: brand,
      selectedPrice: price,
      laborFee,
      totalPrice: item.quantity * (price + laborFee),
      locationMapLink: locationMapLink || null,
    });
  }

  await prisma.$transaction(
    bookingsData.map((data) => prisma.booking.create({ data }))
  );

  redirect(`/request/${requestId}`);
}
