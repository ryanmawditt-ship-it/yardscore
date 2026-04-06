"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const STATES = ["QLD", "NSW", "VIC", "WA", "SA", "TAS", "ACT", "NT"] as const;

const STATE_SUBURB_CHIPS: Record<string, string[]> = {
  QLD: ["New Farm", "Paddington", "Ascot", "Newstead", "West End"],
  NSW: ["Surry Hills", "Newtown", "Manly", "Parramatta", "Newcastle"],
  VIC: ["Fitzroy", "Richmond", "St Kilda", "Brunswick", "Geelong"],
  WA: ["Fremantle", "Subiaco", "Cottesloe", "Northbridge"],
  SA: ["Unley", "Norwood", "Glenelg"],
  TAS: ["Battery Point", "Sandy Bay", "North Hobart"],
  ACT: ["Braddon", "Kingston", "Griffith"],
  NT: ["Stuart Park", "Fannie Bay", "Parap"],
};

const TOTAL_STEPS = 5;

const sf: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

/* ── Elegant step indicator ── */
function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 72,
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        const num = i + 1;
        const isCompleted = num < step;
        const isCurrent = num === step;
        const isUpcoming = num > step;

        return (
          <div key={num} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div
                style={{
                  width: 52,
                  height: 1.5,
                  backgroundColor: isCompleted ? "#0071e3" : "#e8e8ed",
                  transition: "background-color 0.4s ease",
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                backgroundColor: isCompleted
                  ? "#0071e3"
                  : isCurrent
                  ? "#fff"
                  : "#fff",
                border: isCurrent
                  ? "2px solid #0071e3"
                  : isCompleted
                  ? "none"
                  : "1.5px solid #e0e0e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                flexShrink: 0,
                boxShadow: isCurrent
                  ? "0 0 0 5px rgba(0,113,227,0.12)"
                  : "none",
              }}
            >
              {isCompleted ? (
                <svg width={15} height={11} viewBox="0 0 15 11" fill="none">
                  <path
                    d="M1 5.5L5.5 10L14 1"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isCurrent ? "#0071e3" : "#c0c0c8",
                    transition: "color 0.3s",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {num}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Option card (full width) ── */
function OptionCard({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "22px 28px",
        borderRadius: 16,
        border: selected ? "2px solid #0071e3" : "1.5px solid #e8e8ed",
        backgroundColor: selected
          ? "rgba(0,113,227,0.04)"
          : hovered
          ? "#fafafa"
          : "#fff",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: selected
          ? "0 0 0 4px rgba(0,113,227,0.1)"
          : hovered
          ? "0 2px 12px rgba(0,0,0,0.07)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: selected ? "scale(1.005)" : "scale(1)",
        outline: "none",
        ...sf,
      }}
    >
      {/* Radio indicator */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: selected ? "none" : "1.5px solid #d0d0d8",
          backgroundColor: selected ? "#0071e3" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {selected && (
          <svg width={12} height={9} viewBox="0 0 12 9" fill="none">
            <path
              d="M1 4.5L4.5 8L11 1"
              stroke="white"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div>
        <span
          style={{
            fontSize: 19,
            fontWeight: selected ? 600 : 400,
            color: selected ? "#0071e3" : "#1d1d1f",
            letterSpacing: "-0.015em",
            display: "block",
            transition: "color 0.15s, font-weight 0.15s",
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: 14,
              color: selected ? "rgba(0,113,227,0.7)" : "#86868b",
              marginTop: 3,
              display: "block",
              transition: "color 0.15s",
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}

/* ── Grid tile button (for property type, bedrooms) ── */
function TileButton({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "22px 16px",
        borderRadius: 16,
        border: selected ? "2px solid #0071e3" : "1.5px solid #e8e8ed",
        backgroundColor: selected
          ? "rgba(0,113,227,0.04)"
          : hovered
          ? "#fafafa"
          : "#fff",
        color: selected ? "#0071e3" : "#1d1d1f",
        fontSize: 18,
        fontWeight: selected ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
        letterSpacing: "-0.015em",
        outline: "none",
        boxShadow: selected
          ? "0 0 0 4px rgba(0,113,227,0.1)"
          : hovered
          ? "0 2px 12px rgba(0,0,0,0.07)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: selected ? "scale(1.02)" : "scale(1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...sf,
      }}
    >
      {selected && (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: "#0071e3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
          }}
        >
          <svg width={10} height={8} viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 7L9 1"
              stroke="white"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      {label}
      {sublabel && (
        <span
          style={{
            fontSize: 12,
            color: selected ? "rgba(0,113,227,0.7)" : "#86868b",
            fontWeight: 400,
          }}
        >
          {sublabel}
        </span>
      )}
    </button>
  );
}

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState<WizardAnswers>({
    budget: "",
    purpose: "",
    targetState: "",
    location: "",
    openToSuggestions: false,
    propertyType: "",
    minBedrooms: "",
    goal: "",
    minYield: "",
  });

  const update = (key: keyof WizardAnswers, value: string | boolean) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 1) return !!answers.budget;
    if (step === 2) return !!answers.purpose;
    if (step === 3) return (!!answers.targetState && !!answers.location.trim()) || answers.openToSuggestions;
    if (step === 4) return !!answers.propertyType && !!answers.minBedrooms;
    if (step === 5) return !!answers.goal && !!answers.minYield;
    return false;
  };

  const next = () => {
    if (step < TOTAL_STEPS) {
      setAnimKey((k) => k + 1);
      setStep((s) => s + 1);
    } else {
      setShowSummary(true);
    }
  };

  const back = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (step > 1) {
      setAnimKey((k) => k + 1);
      setStep((s) => s - 1);
    }
  };

  const handlePay = () => {
    localStorage.setItem("ys_wizard", JSON.stringify(answers));
    router.push("/loading-report");
  };

  const labelMap: Record<string, string> = {
    budget: "Budget",
    purpose: "Purpose",
    targetState: "State",
    location: "Location",
    propertyType: "Property type",
    minBedrooms: "Min bedrooms",
    goal: "Primary goal",
    minYield: "Min yield target",
    openToSuggestions: "Open to suburb suggestions",
  };

  // Summary page
  if (showSummary) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", ...sf }}>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .summary-fade { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        `}</style>

        {/* Nav */}
        <header
          style={{
            borderBottom: "0.5px solid #e8e8ed",
            padding: "0 32px",
            height: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, #0071e3, #34c759)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>YS</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.025em", color: "#1d1d1f" }}>
              Yardscore
            </span>
          </div>
          <span style={{ fontSize: 13, color: "#86868b" }}>Order summary</span>
        </header>

        <div
          className="summary-fade"
          style={{ maxWidth: 620, margin: "0 auto", padding: "80px 24px 100px" }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0071e3",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 16,
            }}
          >
            Almost there
          </p>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "#1d1d1f",
              letterSpacing: "-0.035em",
              marginBottom: 10,
              lineHeight: 1.1,
            }}
          >
            Review your report criteria.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#86868b",
              marginBottom: 56,
              letterSpacing: "-0.01em",
              lineHeight: 1.6,
            }}
          >
            Check that everything looks right before we run your analysis.
          </p>

          {/* Criteria list */}
          <div
            style={{
              border: "0.5px solid #e8e8ed",
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 28,
            }}
          >
            {(
              Object.entries(answers) as [keyof WizardAnswers, string | boolean][]
            )
              .filter(([, v]) => v !== "" && v !== false)
              .map(([k, v], i) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 28px",
                    borderBottom: "0.5px solid #e8e8ed",
                    backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                >
                  <span style={{ fontSize: 15, color: "#86868b", letterSpacing: "-0.01em" }}>
                    {labelMap[k] ?? k}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: "#1d1d1f",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {typeof v === "boolean" ? "Yes" : v}
                  </span>
                </div>
              ))}

            {/* Total row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "24px 28px",
                backgroundColor: "#f5f5f7",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1d1d1f",
                    letterSpacing: "-0.02em",
                    margin: "0 0 4px",
                  }}
                >
                  Yardscore Investment Report
                </p>
                <p style={{ fontSize: 13, color: "#86868b", margin: 0 }}>
                  3–5 properties · 20+ data points · ~10 minute delivery
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#1d1d1f",
                    letterSpacing: "-0.04em",
                  }}
                >
                  $99
                </span>
                <p style={{ fontSize: 12, color: "#86868b", margin: "2px 0 0", textAlign: "right" }}>
                  one-time fee
                </p>
              </div>
            </div>
          </div>

          {/* Value callout */}
          <div
            style={{
              backgroundColor: "#e8f0fe",
              borderRadius: 14,
              padding: "18px 24px",
              marginBottom: 36,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3v5l3 3"
                stroke="#0071e3"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p style={{ fontSize: 14, color: "#0071e3", margin: 0, lineHeight: 1.5 }}>
              <strong>Less than 0.7% of the cost of a buyer's agent</strong> — with the
              same due diligence data delivered in minutes, not days.
            </p>
          </div>

          <button
            onClick={handlePay}
            style={{
              width: "100%",
              backgroundColor: "#0071e3",
              color: "#fff",
              fontSize: 18,
              fontWeight: 600,
              padding: "18px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.015em",
              ...sf,
              marginBottom: 14,
              boxShadow: "0 4px 20px rgba(0,113,227,0.4)",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0077ed")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0071e3")}
          >
            Pay and generate my report →
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: "#86868b", marginBottom: 16 }}>
            Your report will be ready in approximately 10 minutes
          </p>
          <button
            onClick={back}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "#86868b",
              fontSize: 15,
              fontWeight: 400,
              padding: "14px",
              borderRadius: 14,
              border: "1px solid #e8e8ed",
              cursor: "pointer",
              ...sf,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#1d1d1f";
              e.currentTarget.style.color = "#1d1d1f";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#e8e8ed";
              e.currentTarget.style.color = "#86868b";
            }}
          >
            ← Edit my answers
          </button>
        </div>
      </div>
    );
  }

  // Step labels for context
  const stepContext = [
    "Let's start with your budget",
    "What's the purpose of this purchase?",
    "Where are you looking to buy?",
    "What kind of property suits you?",
    "What matters most to you?",
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", ...sf }}>
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-content {
          animation: stepIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #c0c0c8; }
        @media (max-width: 600px) {
          .wizard-grid-2 { grid-template-columns: 1fr !important; }
          .wizard-grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header
        style={{
          borderBottom: "0.5px solid #e8e8ed",
          padding: "0 32px",
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #0071e3, #34c759)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>YS</span>
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#1d1d1f",
            }}
          >
            Yardscore
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 13,
              color: "#86868b",
              letterSpacing: "-0.01em",
            }}
          >
            Step {step} of {TOTAL_STEPS}
          </span>
          <div
            style={{
              width: 80,
              height: 4,
              backgroundColor: "#f0f0f5",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#0071e3",
                borderRadius: 2,
                width: `${(step / TOTAL_STEPS) * 100}%`,
                transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "72px 24px 80px",
        }}
      >
        {/* Step indicator */}
        <StepIndicator step={step} total={TOTAL_STEPS} />

        {/* Step content with animation */}
        <div key={animKey} className="step-content">
          {/* Context label */}
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0071e3",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            {stepContext[step - 1]}
          </p>

          {/* ── Step 1: Budget ── */}
          {step === 1 && (
            <div>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 700,
                  color: "#1d1d1f",
                  letterSpacing: "-0.038em",
                  marginBottom: 48,
                  lineHeight: 1.1,
                }}
              >
                What is your maximum<br />purchase budget?
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Under $500k", sublabel: "Entry-level opportunities" },
                  { label: "$500k–$750k", sublabel: "Strong mid-market options" },
                  { label: "$750k–$1M", sublabel: "Premium inner-city access" },
                  { label: "$1M–$1.5M", sublabel: "Top-tier suburbs" },
                  { label: "$1.5M+", sublabel: "Prestige market" },
                ].map((opt) => (
                  <OptionCard
                    key={opt.label}
                    label={opt.label}
                    sublabel={opt.sublabel}
                    selected={answers.budget === opt.label}
                    onClick={() => update("budget", opt.label)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Purpose ── */}
          {step === 2 && (
            <div>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 700,
                  color: "#1d1d1f",
                  letterSpacing: "-0.038em",
                  marginBottom: 48,
                  lineHeight: 1.1,
                }}
              >
                Are you buying to invest<br />or to live in?
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    label: "Investment property",
                    sublabel: "Rental income and capital growth focus",
                  },
                  {
                    label: "Owner occupier",
                    sublabel: "Planning to live in the property",
                  },
                  {
                    label: "Not sure yet",
                    sublabel: "Exploring options — flexible analysis",
                  },
                ].map((opt) => (
                  <OptionCard
                    key={opt.label}
                    label={opt.label}
                    sublabel={opt.sublabel}
                    selected={answers.purpose === opt.label}
                    onClick={() => update("purpose", opt.label)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Location ── */}
          {step === 3 && (
            <div>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 700,
                  color: "#1d1d1f",
                  letterSpacing: "-0.038em",
                  marginBottom: 16,
                  lineHeight: 1.1,
                }}
              >
                Which suburbs<br />are you targeting?
              </h1>
              <p
                style={{
                  fontSize: 17,
                  color: "#86868b",
                  marginBottom: 36,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.6,
                }}
              >
                Enter one or more suburbs, or let us suggest the best options for your
                budget and goals.
              </p>

              {/* State selector */}
              <select
                value={answers.targetState}
                onChange={(e) => {
                  update("targetState", e.target.value);
                  update("location", "");
                }}
                style={{
                  width: "100%",
                  border: "1.5px solid #e8e8ed",
                  borderRadius: 16,
                  padding: "16px 22px",
                  fontSize: 17,
                  color: answers.targetState ? "#1d1d1f" : "#c0c0c8",
                  backgroundColor: "#fff",
                  letterSpacing: "-0.01em",
                  marginBottom: 20,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2386868b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 20px center",
                  cursor: "pointer",
                  ...sf,
                }}
              >
                <option value="" disabled>Select state or territory</option>
                {STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>

              {/* Suburb chips hint */}
              {answers.targetState && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {(STATE_SUBURB_CHIPS[answers.targetState] || []).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => {
                          const current = answers.location.trim();
                          if (!current.includes(s)) {
                            update(
                              "location",
                              current ? `${current}, ${s}` : s
                            );
                          }
                        }}
                        style={{
                          padding: "7px 16px",
                          borderRadius: 980,
                          border: "1px solid #e8e8ed",
                          backgroundColor: "#fafafa",
                          fontSize: 14,
                          color: "#1d1d1f",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          ...sf,
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#e8f0fe";
                          e.currentTarget.style.borderColor = "#0071e3";
                          e.currentTarget.style.color = "#0071e3";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "#fafafa";
                          e.currentTarget.style.borderColor = "#e8e8ed";
                          e.currentTarget.style.color = "#1d1d1f";
                        }}
                      >
                        + {s}
                      </button>
                    )
                  )}
                </div>
              )}

              <textarea
                value={answers.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. New Farm QLD, Surry Hills NSW, Fitzroy VIC..."
                rows={4}
                style={{
                  width: "100%",
                  border: "1.5px solid #e8e8ed",
                  borderRadius: 16,
                  padding: "18px 22px",
                  fontSize: 17,
                  color: "#1d1d1f",
                  backgroundColor: "#fff",
                  resize: "none",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.65,
                  marginBottom: 20,
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  ...sf,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0071e3";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(0,113,227,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e8e8ed";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {/* Open to suggestions checkbox */}
              <button
                onClick={() => update("openToSuggestions", !answers.openToSuggestions)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: "16px 20px",
                  borderRadius: 14,
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: answers.openToSuggestions
                    ? "rgba(0,113,227,0.04)"
                    : "#fafafa",
                  transition: "background 0.15s",
                  ...sf,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    border: answers.openToSuggestions
                      ? "none"
                      : "1.5px solid #d0d0d8",
                    backgroundColor: answers.openToSuggestions ? "#0071e3" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  {answers.openToSuggestions && (
                    <svg width={12} height={9} viewBox="0 0 12 9" fill="none">
                      <path
                        d="M1 4.5L4.5 8L11 1"
                        stroke="white"
                        strokeWidth={1.9}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 16,
                    color: answers.openToSuggestions ? "#0071e3" : "#1d1d1f",
                    letterSpacing: "-0.01em",
                    fontWeight: answers.openToSuggestions ? 600 : 400,
                    transition: "color 0.15s",
                  }}
                >
                  I'm open to suburb suggestions based on my budget and goals
                </span>
              </button>
            </div>
          )}

          {/* ── Step 4: Property type ── */}
          {step === 4 && (
            <div>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 700,
                  color: "#1d1d1f",
                  letterSpacing: "-0.038em",
                  marginBottom: 48,
                  lineHeight: 1.1,
                }}
              >
                What type of property<br />are you looking for?
              </h1>

              <div
                className="wizard-grid-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 56,
                }}
              >
                {[
                  { label: "House", sublabel: "Land + structure" },
                  { label: "Townhouse", sublabel: "Low maintenance" },
                  { label: "Unit", sublabel: "Apartment or flat" },
                  { label: "Any", sublabel: "Best value wins" },
                ].map((opt) => (
                  <TileButton
                    key={opt.label}
                    label={opt.label}
                    sublabel={opt.sublabel}
                    selected={answers.propertyType === opt.label}
                    onClick={() => update("propertyType", opt.label)}
                  />
                ))}
              </div>

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0071e3",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 18,
                }}
              >
                Minimum bedrooms
              </p>
              <div
                className="wizard-grid-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {["1", "2", "3", "4+"].map((opt) => (
                  <TileButton
                    key={opt}
                    label={opt}
                    selected={answers.minBedrooms === opt}
                    onClick={() => update("minBedrooms", opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 5: Goals ── */}
          {step === 5 && (
            <div>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 700,
                  color: "#1d1d1f",
                  letterSpacing: "-0.038em",
                  marginBottom: 48,
                  lineHeight: 1.1,
                }}
              >
                What matters most<br />to you?
              </h1>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 56,
                }}
              >
                {[
                  {
                    label: "Maximum rental yield",
                    sublabel: "Prioritise weekly income and cash flow",
                  },
                  {
                    label: "Long term capital growth",
                    sublabel: "Focus on suburbs with strong appreciation history",
                  },
                  {
                    label: "Balance of both",
                    sublabel: "Steady yield with solid growth potential",
                  },
                ].map((opt) => (
                  <OptionCard
                    key={opt.label}
                    label={opt.label}
                    sublabel={opt.sublabel}
                    selected={answers.goal === opt.label}
                    onClick={() => update("goal", opt.label)}
                  />
                ))}
              </div>

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0071e3",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 18,
                }}
              >
                Minimum yield target
              </p>
              <div
                className="wizard-grid-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  { label: "No preference", sublabel: "Show me the best overall" },
                  { label: "3%+", sublabel: "Conservative threshold" },
                  { label: "4%+", sublabel: "Solid cash flow target" },
                  { label: "5%+", sublabel: "High-yield focus" },
                ].map((opt) => (
                  <TileButton
                    key={opt.label}
                    label={opt.label}
                    sublabel={opt.sublabel}
                    selected={answers.minYield === opt.label}
                    onClick={() => update("minYield", opt.label)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 64,
          }}
        >
          {step > 1 && (
            <button
              onClick={back}
              style={{
                padding: "16px 28px",
                borderRadius: 14,
                border: "1.5px solid #e8e8ed",
                backgroundColor: "#fff",
                color: "#1d1d1f",
                fontSize: 17,
                fontWeight: 400,
                cursor: "pointer",
                letterSpacing: "-0.01em",
                transition: "border-color 0.15s",
                ...sf,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#1d1d1f")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.borderColor = "#e8e8ed")
              }
            >
              ←
            </button>
          )}
          <button
            onClick={next}
            disabled={!canProceed()}
            style={{
              flex: 1,
              padding: "16px 28px",
              borderRadius: 14,
              border: "none",
              backgroundColor: canProceed() ? "#0071e3" : "#e8e8ed",
              color: canProceed() ? "#fff" : "#afafb8",
              fontSize: 17,
              fontWeight: 600,
              cursor: canProceed() ? "pointer" : "not-allowed",
              letterSpacing: "-0.015em",
              transition: "background-color 0.2s, box-shadow 0.2s, transform 0.15s",
              boxShadow: canProceed() ? "0 4px 16px rgba(0,113,227,0.35)" : "none",
              ...sf,
            }}
            onMouseOver={(e) => {
              if (canProceed()) {
                e.currentTarget.style.backgroundColor = "#0077ed";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,113,227,0.45)";
              }
            }}
            onMouseOut={(e) => {
              if (canProceed()) {
                e.currentTarget.style.backgroundColor = "#0071e3";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,113,227,0.35)";
              }
            }}
          >
            {step === TOTAL_STEPS ? "Review my order →" : "Continue →"}
          </button>
        </div>

        {/* Skip hint */}
        {step < TOTAL_STEPS && (
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#c0c0c8",
              marginTop: 20,
              letterSpacing: "-0.01em",
            }}
          >
            {!canProceed()
              ? `Select an option to continue`
              : `Press Continue or hit Enter`}
          </p>
        )}
      </div>
    </div>
  );
}
