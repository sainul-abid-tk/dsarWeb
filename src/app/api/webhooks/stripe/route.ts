import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleStripeWebhook } from "@/app/actions/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test", {
  apiVersion: "2024-12-31.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  try {
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    await handleStripeWebhook(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 400 }
    );
  }
}
