"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// MOCK subscription: instantly activates company
export async function createCheckoutSession(companyId: string) {
  try {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: "active",
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    revalidatePath("/owner");
    revalidatePath("/admin");
    revalidatePath("/c");

    return { success: true, url: "/owner?subscribed=true" };
  } catch (error) {
    console.error("Mock subscribe error:", error);
    return { success: false, error: "Subscription failed" };
  }
}

// Not used anymore – kept so imports don’t break
export async function handleStripeWebhook(_: any) {
  return { success: true };
}
