import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suburb, budget, purpose, bedrooms, yieldTarget } = body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900,
      currency: "aud",
      metadata: {
        suburb: suburb || "",
        budget: budget || "",
        purpose: purpose || "",
        bedrooms: bedrooms || "",
        yieldTarget: yieldTarget || "",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[create-payment-intent] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
