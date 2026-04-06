"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const sf: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

interface WizardAnswers {
  budget: string;
  purpose: string;
  targetState: string;
  location: string;
  openToSuggestions: boolean;
  propertyType: string;
  minBedrooms: string;
  goal: string;
  minYield: string;
}

function CheckoutForm({ answers }: { answers: WizardAnswers }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/loading-report`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setLoading(false);
      return;
    }

    // Payment succeeded — redirect to loading page
    localStorage.setItem("ys_wizard", JSON.stringify(answers));
    localStorage.setItem("ys_paid", "true");
    router.push("/loading-report");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          border: "1.5px solid #e8e8ed",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
          backgroundColor: "#fff",
        }}
      >
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 20,
            fontSize: 14,
            color: "#dc2626",
            ...sf,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: "100%",
          backgroundColor: loading ? "#86868b" : "#0071e3",
          color: "#fff",
          fontSize: 18,
          fontWeight: 600,
          padding: "18px",
          borderRadius: 14,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "-0.015em",
          ...sf,
          marginBottom: 14,
          boxShadow: loading ? "none" : "0 4px 20px rgba(0,113,227,0.4)",
          transition: "background 0.2s",
        }}
      >
        {loading ? "Processing..." : "Pay $99 and generate my report"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: "#86868b", marginBottom: 24, ...sf }}>
        Secure payment via Stripe. Report delivered within 10 minutes.
      </p>

      {/* Trust badges */}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, ...sf }}>
        {[
          { icon: "🔒", label: "SSL secured" },
          { icon: "✕", label: "No subscription" },
          { icon: "⚡", label: "Instant delivery" },
        ].map((badge) => (
          <div
            key={badge.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#86868b",
            }}
          >
            <span style={{ fontSize: 14 }}>{badge.icon}</span>
            {badge.label}
          </div>
        ))}
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<WizardAnswers | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("ys_wizard");
    if (!raw) {
      router.push("/wizard");
      return;
    }

    let parsed: WizardAnswers;
    try {
      parsed = JSON.parse(raw);
    } catch {
      router.push("/wizard");
      return;
    }

    setAnswers(parsed);

    // Create payment intent
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        suburb: parsed.location,
        budget: parsed.budget,
        purpose: parsed.purpose,
        bedrooms: parsed.minBedrooms,
        yieldTarget: parsed.minYield,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => setError(err.message));
  }, [router]);

  if (!answers) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", ...sf }}>
        <p style={{ color: "#86868b" }}>Loading...</p>
      </div>
    );
  }

  const labelMap: Record<string, string> = {
    budget: "Budget",
    purpose: "Purpose",
    targetState: "State",
    location: "Location",
    propertyType: "Property type",
    minBedrooms: "Min bedrooms",
    goal: "Primary goal",
    minYield: "Min yield target",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f7", ...sf }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "0.5px solid #e8e8ed",
          padding: "0 32px",
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        <img src="/logo.svg" alt="Yardscore" style={{ height: 32, width: "auto" }} />
        <span style={{ fontSize: 13, color: "#86868b" }}>Secure checkout</span>
      </header>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            color: "#1d1d1f",
            letterSpacing: "-0.035em",
            marginBottom: 8,
            lineHeight: 1.1,
          }}
        >
          Your property report
        </h1>
        <p style={{ fontSize: 17, color: "#86868b", marginBottom: 36, letterSpacing: "-0.01em" }}>
          Review your order and complete payment.
        </p>

        {/* Order summary */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "0.5px solid #e8e8ed",
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 32,
          }}
        >
          {(Object.entries(answers) as [keyof WizardAnswers, string | boolean][])
            .filter(([k, v]) => v !== "" && v !== false && k !== "openToSuggestions")
            .map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 24px",
                  borderBottom: "0.5px solid #e8e8ed",
                  backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <span style={{ fontSize: 14, color: "#86868b" }}>{labelMap[k] ?? k}</span>
                <span style={{ fontSize: 14, color: "#1d1d1f", fontWeight: 600 }}>
                  {typeof v === "boolean" ? "Yes" : v}
                </span>
              </div>
            ))}

          {/* Price row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              backgroundColor: "#f5f5f7",
            }}
          >
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", margin: "0 0 2px" }}>
                Yardscore Investment Report
              </p>
              <p style={{ fontSize: 12, color: "#86868b", margin: 0 }}>
                3-5 properties · 20+ data points · ~10 min delivery
              </p>
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.03em" }}>
              $99
            </span>
          </div>
        </div>

        {/* Stripe payment form */}
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 20,
              fontSize: 14,
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#0071e3",
                  borderRadius: "12px",
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                },
              },
            }}
          >
            <CheckoutForm answers={answers} />
          </Elements>
        ) : !error ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#86868b", fontSize: 15 }}>Loading payment form...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
