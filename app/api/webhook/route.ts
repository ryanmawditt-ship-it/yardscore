import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      console.warn("[webhook] STRIPE_WEBHOOK_SECRET not set — parsing event without verification");
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { suburb, budget, purpose, bedrooms, yieldTarget } = paymentIntent.metadata;

    console.log("[webhook] Payment succeeded:", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      suburb,
      budget,
      purpose,
      bedrooms,
      yieldTarget,
    });

    // Trigger analysis in the background
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: suburb }),
      });
      console.log("[webhook] Analysis triggered for:", suburb);
    } catch (error) {
      console.error("[webhook] Failed to trigger analysis:", error instanceof Error ? error.message : String(error));
    }
  }

  return NextResponse.json({ received: true });
}
