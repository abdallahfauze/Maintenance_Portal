"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const FeedbackSchema = z.object({
  page: z.string().trim().min(1).max(200),
  comment: z.string().trim().min(2, "Please write a comment.").max(2000),
});

export type FeedbackFormState = { error?: string; success?: boolean };

export async function submitFeedback(
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const parsed = FeedbackSchema.safeParse({
    page: formData.get("page"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your comment." };
  }

  await prisma.feedback.create({ data: parsed.data });
  revalidatePath("/admin/feedback");

  return { success: true };
}

export async function toggleFeedbackResolved(id: string, resolved: boolean) {
  await prisma.feedback.update({ where: { id }, data: { resolved } });
  revalidatePath("/admin/feedback");
}
