"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FinalReport, MultiPropertyReport } from "@/types";

const sf = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

/* ── SVG Arc Gauge score display ── */
function ScoreGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  const size = 148;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270° arc
  const arcLength = circumference * 0.75;
  const fillLength = animated ? (score / 10) * arcLength : 0;

  const color =
    score >= 7.5 ? "#34c759" : score >= 5 ? "#ff9f0a" : "#ff3b30";
  const bgColor =
    score >= 7.5 ? "rgba(52,199,89,0.08)" : score >= 5 ? "rgba(255,159,10,0.08)" : "rgba(255,59,48,0.08)";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: bgColor,
        borderRadius: "50%",
      }}
    >
      {/* SVG arc - rotated so arc starts at bottom-left */}
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", inset: 0, transform: "rotate(135deg)" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8e8ed"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${fillLength} ${circumference - fillLength}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)",
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 800,
            color,
            letterSpacing: "-0.045em",
            lineHeight: 1,
          }}
        >
          {score.toFixed(1)}
        </span>
        <span style={{ fontSize: 13, color: "#86868b", marginTop: 3, letterSpacing: "-0.01em" }}>
          / 10
        </span>
      </div>
    </div>
  );
}

/* ── Signal badge ── */
function SignalBadge({ signal }: { signal: "buy" | "hold" | "avoid" }) {
  const map = {
    buy: { bg: "#d1f7dc", color: "#1a7f37", label: "Buy Signal", dot: "#34c759" },
    hold: { bg: "#fff3cd", color: "#856404", label: "Hold", dot: "#f59e0b" },
    avoid: { bg: "#fde8e8", color: "#c0392b", label: "Avoid", dot: "#ff3b30" },
  };
  const s = map[signal] ?? map.hold;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        backgroundColor: s.bg,
        color: s.color,
        fontSize: 14,
        fontWeight: 700,
        padding: "8px 18px",
        borderRadius: 980,
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: s.dot,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

/* ── Risk pill ── */
function RiskPill({
  severity,
  label,
}: {
  severity: "green" | "amber" | "red";
  label: string;
}) {
  const map = {
    green: { bg: "#d1f7dc", color: "#1a7f37", icon: "✓" },
    amber: { bg: "#fff3cd", color: "#856404", icon: "⚠" },
    red: { bg: "#fde8e8", color: "#c0392b", icon: "✕" },
  };
  const s = map[severity];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: s.bg,
        color: s.color,
        fontSize: 13,
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: 980,
        letterSpacing: "-0.01em",
      }}
    >
      <span style={{ fontSize: 11 }}>{s.icon}</span>
      {label}
    </span>
  );
}

/* ── Metric row ── */
function MetricRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        borderBottom: "0.5px solid #e8e8ed",
      }}
    >
      <span style={{ fontSize: 15, color: "#86868b", letterSpacing: "-0.01em" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 15,
          color: accent ? "#0071e3" : "#1d1d1f",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Premium section card ── */
function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: { label: string; color: string; bg: string };
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "0.5px solid #e8e8ed",
        borderRadius: 20,
        padding: "32px",
        marginBottom: 16,
        backgroundColor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1d1d1f",
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {badge && (
          <span
            style={{
              display: "inline-block",
              backgroundColor: badge.bg,
              color: badge.color,
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 980,
            }}
          >
            {badge.label}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function fmt(n: number | null | undefined, prefix = "", suffix = "", fallback = "Estimating...") {
  if (n === null || n === undefined) return fallback;
  return `${prefix}${n.toLocaleString()}${suffix}`;
}

export default function ReportPage() {
  const [report, setReport] = useState<FinalReport | null>(null);
  const [multiReport, setMultiReport] = useState<MultiPropertyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadHovered, setDownloadHovered] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("ys_report");
    if (!raw) {
      setError("No report found. Please complete the wizard first.");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.error) {
        setError(parsed.error);
      } else if (parsed.properties && Array.isArray(parsed.properties)) {
        // Multi-property report
        setMultiReport(parsed as MultiPropertyReport);
        // Set first property as the "main" report for backwards compatibility
        if (parsed.properties.length > 0) setReport(parsed.properties[0]);
      } else {
        setReport(parsed as FinalReport);
      }
    } catch {
      setError("Failed to load report data.");
    }
  }, []);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...sf,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#fde8e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
              <path
                d="M14 9v6M14 19v1M4 14a10 10 0 1020 0A10 10 0 004 14z"
                stroke="#c0392b"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1d1d1f",
              letterSpacing: "-0.025em",
              marginBottom: 10,
            }}
          >
            Report not found
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#86868b",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>
          <Link
            href="/wizard"
            style={{
              display: "inline-block",
              backgroundColor: "#0071e3",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              padding: "14px 28px",
              borderRadius: 14,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            Start a new report
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ position: "relative", width: 48, height: 48 }}>
          <svg
            width={48}
            height={48}
            viewBox="0 0 48 48"
            style={{ animation: "spin 0.9s linear infinite" }}
          >
            <circle cx={24} cy={24} r={18} fill="none" stroke="#e8e8ed" strokeWidth={4} />
            <circle
              cx={24}
              cy={24}
              r={18}
              fill="none"
              stroke="#0071e3"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="28 84"
            />
          </svg>
        </div>
        <p style={{ fontSize: 15, color: "#86868b", letterSpacing: "-0.01em", ...sf }}>
          Loading your report…
        </p>
      </div>
    );
  }

  const property = report.property ?? { address: "", suburb: "", state: "", postcode: "", lat: 0, lng: 0 };

  const safeAnalysis = report.analysis as unknown as Record<string, unknown> | undefined;
  const analysis = {
    address: (safeAnalysis?.address as string) ?? "",
    lastSalePrice: (safeAnalysis?.lastSalePrice as number | null) ?? null,
    lastSaleDate: (safeAnalysis?.lastSaleDate as string | null) ?? null,
    landSize: (safeAnalysis?.landSize as number | null) ?? null,
    bedrooms: (safeAnalysis?.bedrooms as number | null) ?? null,
    bathrooms: (safeAnalysis?.bathrooms as number | null) ?? null,
    yearBuilt: (safeAnalysis?.yearBuilt as number | null) ?? null,
    priceHistory: (safeAnalysis?.priceHistory as { date: string; price: number }[]) ?? [],
    comparables: (safeAnalysis?.comparables as { address: string; price: number; date: string; distanceM: number }[]) ?? [],
    medianPricePerSqm: (safeAnalysis?.medianPricePerSqm as number | null) ?? null,
    trendSummary: (safeAnalysis?.trendSummary as string) ?? "",
  };

  const safeRisk = report.risk as unknown as Record<string, unknown> | undefined;
  const risk = {
    floodRisk: (safeRisk?.floodRisk as string) ?? "none",
    bushfireRisk: (safeRisk?.bushfireRisk as string) ?? "none",
    zoningCode: (safeRisk?.zoningCode as string) ?? "",
    zoningDescription: (safeRisk?.zoningDescription as string) ?? "",
    hasHeritage: (safeRisk?.hasHeritage as boolean) ?? false,
    hasEasement: (safeRisk?.hasEasement as boolean) ?? false,
    socialHousingPct: (safeRisk?.socialHousingPct as number | null) ?? null,
    riskFlags: (safeRisk?.riskFlags as { label: string; severity: "green" | "amber" | "red" }[]) ?? [],
    riskSummary: (safeRisk?.riskSummary as string) ?? "",
  };

  const safeInfra = report.infrastructure as unknown as Record<string, unknown> | undefined;
  const infrastructure = {
    projects: (safeInfra?.projects as { name: string; type: string; status: string; distanceKm: number; completionYear: number | null }[]) ?? [],
    supplyDemandSignal: (safeInfra?.supplyDemandSignal as string) ?? "balanced",
    daysOnMarket: (safeInfra?.daysOnMarket as number | null) ?? null,
    infrastructureScore: (safeInfra?.infrastructureScore as number) ?? 0,
    opportunitySummary: (safeInfra?.opportunitySummary as string) ?? "",
  };

  const safeYield = report.yield as unknown as Record<string, unknown> | undefined;
  const yieldData = {
    estimatedWeeklyRent: (safeYield?.estimatedWeeklyRent as number | null) ?? null,
    grossYieldPct: (safeYield?.grossYieldPct as number | null) ?? null,
    netYieldPct: (safeYield?.netYieldPct as number | null) ?? null,
    vacancyRatePct: (safeYield?.vacancyRatePct as number | null) ?? null,
    cashflowWeekly: (safeYield?.cashflowWeekly as number | null) ?? null,
    rentalDemandSummary: (safeYield?.rentalDemandSummary as string) ?? "",
  };

  const safeVal = report.valuation as unknown as Record<string, unknown> | undefined;
  const valuation = {
    fairValueLow: (safeVal?.fairValueLow as number) ?? 0,
    fairValueMid: (safeVal?.fairValueMid as number) ?? 0,
    fairValueHigh: (safeVal?.fairValueHigh as number) ?? 0,
    askingPrice: (safeVal?.askingPrice as number | null) ?? null,
    vendorExpectationGap: (safeVal?.vendorExpectationGap as number | null) ?? null,
    negotiationHeadroomPct: (safeVal?.negotiationHeadroomPct as number | null) ?? null,
    signal: ((safeVal?.signal as string) ?? "hold") as "buy" | "hold" | "avoid",
    investmentThesis: (safeVal?.investmentThesis as string) ?? "",
  };

  const overallScore = report.overallScore ?? 0;
  const executiveSummary = report.executiveSummary ?? "";
  const generatedAt = report.generatedAt ?? "";

  const reportDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const scoreColor =
    overallScore >= 7.5 ? "#34c759" : overallScore >= 5 ? "#ff9f0a" : "#ff3b30";
  const scoreLabel =
    overallScore >= 7.5 ? "Strong buy" : overallScore >= 5 ? "Moderate" : "Avoid";

  return (
    <div style={{ backgroundColor: "#f5f5f7", minHeight: "100vh", ...sf }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .report-fade { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
        @media (max-width: 640px) {
          .report-header-inner { flex-direction: column !important; align-items: flex-start !important; }
          .metrics-grid { grid-template-columns: 1fr 1fr !important; }
          .valuation-grid { grid-template-columns: 1fr !important; }
          .risk-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header
        className="no-print"
        style={{
          backgroundColor: "#fff",
          borderBottom: "0.5px solid #e8e8ed",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/logo.svg" alt="Yardscore" style={{ height: 32, width: "auto" }} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#86868b", letterSpacing: "-0.01em" }}>
            Generated {reportDate}
          </span>
          <button
            onClick={() => window.print()}
            onMouseEnter={() => setDownloadHovered(true)}
            onMouseLeave={() => setDownloadHovered(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: downloadHovered ? "#0077ed" : "#0071e3",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              transform: downloadHovered ? "translateY(-1px)" : "none",
              boxShadow: downloadHovered
                ? "0 4px 16px rgba(0,113,227,0.45)"
                : "0 2px 8px rgba(0,113,227,0.3)",
              ...sf,
            }}
          >
            <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
              <path
                d="M7.5 1v9M4 7l3.5 3.5L11 7M2 12h11"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download PDF
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main
        className="report-fade"
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "40px 24px 100px",
        }}
      >
        {/* ── SUBURB RECOMMENDATIONS (multi-property only) ── */}
        {multiReport && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 22,
              padding: "32px 28px",
              marginBottom: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0071e3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, ...sf }}>
              AI-selected suburbs
            </p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.03em", marginBottom: 16, ...sf }}>
              Why these suburbs?
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {multiReport.recommendedSuburbs.map((suburb) => (
                <span
                  key={suburb}
                  style={{
                    display: "inline-block",
                    padding: "8px 18px",
                    borderRadius: 980,
                    backgroundColor: "#f0f0f5",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1d1d1f",
                    letterSpacing: "-0.01em",
                    ...sf,
                  }}
                >
                  {suburb}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 16, color: "#444", lineHeight: 1.7, margin: 0, ...sf }}>
              <span dangerouslySetInnerHTML={{ __html: multiReport.suburbReasoning.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </p>
            {(multiReport.properties?.length ?? 0) > 1 && (
              <p style={{ fontSize: 14, color: "#86868b", marginTop: 16, marginBottom: 0, ...sf }}>
                {multiReport.properties.length} properties analysed and ranked by investment score
              </p>
            )}
          </div>
        )}

        {/* ── PROPERTY HERO CARD ── */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 22,
            overflow: "hidden",
            marginBottom: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}
        >
          {/* Suburb photo */}
          {report.suburbPhotoUrl && (
            <img
              src={report.suburbPhotoUrl}
              alt={property.suburb}
              style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
            />
          )}
          {/* Dark header band */}
          <div
            style={{
              background: "linear-gradient(135deg, #071020 0%, #0d2645 100%)",
              padding: "28px 36px 32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <img src="/favicon.svg" alt="" style={{ width: 22, height: 22 }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Yardscore Investment Report
              </span>
            </div>
            <div
              className="report-header-inner"
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    fontSize: "clamp(22px, 3.5vw, 34px)",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    marginBottom: 8,
                    lineHeight: 1.1,
                  }}
                >
                  {property.address}
                </h1>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.55)",
                    margin: "0 0 20px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {property.suburb}, {property.state} {property.postcode}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <SignalBadge signal={valuation.signal} />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 500,
                      padding: "7px 14px",
                      borderRadius: 980,
                    }}
                  >
                    Generated {reportDate}
                  </span>
                </div>
              </div>
              <ScoreGauge score={overallScore} />
            </div>
          </div>

          {/* Executive summary */}
          <div style={{ padding: "28px 36px 32px", borderBottom: "0.5px solid #e8e8ed" }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#86868b",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              Executive Summary
            </p>
            <p
              style={{
                fontSize: 17,
                color: "#1d1d1f",
                lineHeight: 1.72,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {executiveSummary}
            </p>
          </div>

          {/* Key metrics strip */}
          <div
            className="metrics-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            {[
              {
                label: "Gross yield",
                value: fmt(yieldData.grossYieldPct, "", "%"),
                positive: (yieldData.grossYieldPct ?? 0) >= 4,
              },
              {
                label: "Net yield",
                value: fmt(yieldData.netYieldPct, "", "%"),
                positive: (yieldData.netYieldPct ?? 0) >= 3,
              },
              {
                label: "Weekly cashflow",
                value: fmt(yieldData.cashflowWeekly, "$"),
                positive: (yieldData.cashflowWeekly ?? 0) > 0,
              },
              {
                label: "Weekly rent est.",
                value: fmt(yieldData.estimatedWeeklyRent, "$"),
                positive: true,
              },
            ].map((m, i) => (
              <div
                key={m.label}
                style={{
                  padding: "22px 20px",
                  borderLeft: i > 0 ? "0.5px solid #e8e8ed" : "none",
                  textAlign: "center",
                }}
              >
                <p
                  style={{ fontSize: 12, color: "#86868b", margin: "0 0 6px" }}
                >
                  {m.label}
                </p>
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: m.positive ? "#1d1d1f" : "#ff3b30",
                    letterSpacing: "-0.035em",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── VALUATION ── */}
        <Section
          title="Valuation Analysis"
          badge={
            valuation.negotiationHeadroomPct && valuation.negotiationHeadroomPct > 0
              ? {
                  label: `${valuation.negotiationHeadroomPct}% headroom`,
                  color: "#1a7f37",
                  bg: "#d1f7dc",
                }
              : undefined
          }
        >
          {/* Fair value range */}
          <div
            className="valuation-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Low estimate",
                value: fmt(valuation.fairValueLow, "$"),
                accent: false,
              },
              {
                label: "Mid estimate",
                value: fmt(valuation.fairValueMid, "$"),
                accent: true,
              },
              {
                label: "High estimate",
                value: fmt(valuation.fairValueHigh, "$"),
                accent: false,
              },
            ].map((v) => (
              <div
                key={v.label}
                style={{
                  borderRadius: 16,
                  padding: "20px 18px",
                  textAlign: "center",
                  backgroundColor: v.accent ? "#e8f0fe" : "#f5f5f7",
                  border: v.accent ? "1px solid rgba(0,113,227,0.2)" : "none",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: v.accent ? "#0071e3" : "#86868b",
                    marginBottom: 8,
                    fontWeight: v.accent ? 700 : 400,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {v.label}
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: v.accent ? "#0071e3" : "#1d1d1f",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  {v.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "0.5px solid #e8e8ed" }}>
            {valuation.askingPrice !== null && valuation.askingPrice !== undefined && (
              <MetricRow label="Asking price" value={fmt(valuation.askingPrice, "$")} />
            )}
            {valuation.negotiationHeadroomPct !== null &&
              valuation.negotiationHeadroomPct !== undefined && (
                <MetricRow
                  label="Negotiation headroom"
                  value={fmt(valuation.negotiationHeadroomPct, "", "%")}
                  accent
                />
              )}
          </div>

          {valuation.investmentThesis && (
            <div
              style={{
                backgroundColor: "#f5f5f7",
                borderRadius: 14,
                padding: "18px 22px",
                marginTop: 20,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#86868b",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                Investment thesis
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: "#1d1d1f",
                  lineHeight: 1.72,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {valuation.investmentThesis}
              </p>
            </div>
          )}
        </Section>

        {/* ── RISK OVERVIEW ── */}
        <Section title="Risk Overview">
          {/* Risk grid */}
          <div
            className="risk-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              { label: "Flood risk", value: risk.floodRisk },
              { label: "Bushfire risk", value: risk.bushfireRisk },
              { label: "Heritage", value: risk.hasHeritage ? "Yes" : "No" },
              { label: "Easement", value: risk.hasEasement ? "Yes" : "No" },
            ].map((r) => {
              const isGood =
                r.value === "none" || r.value === "low" || r.value === "No";
              const isBad =
                r.value === "high" || r.value === "Yes";
              const isWarn = !isGood && !isBad;
              const color = isGood ? "#34c759" : isBad ? "#ff3b30" : "#ff9f0a";
              const bg = isGood
                ? "#d1f7dc"
                : isBad
                ? "#fde8e8"
                : "#fff3cd";
              const textColor = isGood
                ? "#1a7f37"
                : isBad
                ? "#c0392b"
                : "#856404";
              return (
                <div
                  key={r.label}
                  style={{
                    backgroundColor: bg,
                    borderRadius: 14,
                    padding: "18px 16px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: textColor,
                      marginBottom: 8,
                      fontWeight: 600,
                      opacity: 0.7,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {r.label}
                  </p>
                  <p
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: textColor,
                      textTransform: "capitalize",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {r.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Risk pills */}
          {(risk.riskFlags ?? []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {(risk.riskFlags ?? []).map((f, i) => (
                <RiskPill key={i} severity={f.severity} label={f.label} />
              ))}
            </div>
          )}

          {risk.zoningCode && (
          <MetricRow
            label="Zoning"
            value={`${risk.zoningCode}${risk.zoningDescription ? ` — ${risk.zoningDescription}` : ""}`}
          />
          )}

          {risk.riskSummary && (
            <p
              style={{
                fontSize: 15,
                color: "#86868b",
                lineHeight: 1.72,
                marginTop: 18,
                marginBottom: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {risk.riskSummary}
            </p>
          )}
        </Section>

        {/* ── RENTAL DEMAND ── */}
        <Section title="Rental Demand & Yield">
          <div style={{ borderTop: "0.5px solid #e8e8ed" }}>
            <MetricRow
              label="Estimated weekly rent"
              value={fmt(yieldData.estimatedWeeklyRent, "$")}
            />
            <MetricRow
              label="Gross yield"
              value={fmt(yieldData.grossYieldPct, "", "%")}
            />
            <MetricRow
              label="Net yield"
              value={fmt(yieldData.netYieldPct, "", "%")}
            />
            <MetricRow
              label="Vacancy rate"
              value={fmt(yieldData.vacancyRatePct, "", "%")}
            />
            <MetricRow
              label="Weekly cashflow"
              value={fmt(yieldData.cashflowWeekly, "$")}
              accent
            />
          </div>
          {yieldData.rentalDemandSummary && (
            <p
              style={{
                fontSize: 15,
                color: "#86868b",
                lineHeight: 1.72,
                marginTop: 18,
                marginBottom: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {yieldData.rentalDemandSummary}
            </p>
          )}
        </Section>

        {/* ── PROPERTY DETAILS ── */}
        <Section title="Property Details">
          <div style={{ borderTop: "0.5px solid #e8e8ed" }}>
            <MetricRow label="Bedrooms" value={fmt(analysis.bedrooms)} />
            <MetricRow label="Bathrooms" value={fmt(analysis.bathrooms)} />
            <MetricRow
              label="Land size"
              value={
                analysis.landSize
                  ? `${analysis.landSize.toLocaleString()} m²`
                  : "—"
              }
            />
            <MetricRow label="Year built" value={fmt(analysis.yearBuilt)} />
            <MetricRow
              label="Last sale price"
              value={
                analysis.lastSalePrice
                  ? `$${analysis.lastSalePrice.toLocaleString()}`
                  : "—"
              }
            />
            <MetricRow
              label="Last sale date"
              value={analysis.lastSaleDate ?? "—"}
            />
          </div>
          {analysis.trendSummary && (
            <p
              style={{
                fontSize: 15,
                color: "#86868b",
                lineHeight: 1.72,
                marginTop: 20,
                marginBottom: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {analysis.trendSummary}
            </p>
          )}
        </Section>

        {/* ── INFRASTRUCTURE ── */}
        <Section title="Infrastructure & Opportunity">
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {/* Supply/demand signal */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 16px",
                borderRadius: 980,
                textTransform: "capitalize",
                backgroundColor:
                  infrastructure.supplyDemandSignal === "undersupplied"
                    ? "#d1f7dc"
                    : infrastructure.supplyDemandSignal === "balanced"
                    ? "#fff3cd"
                    : "#fde8e8",
                color:
                  infrastructure.supplyDemandSignal === "undersupplied"
                    ? "#1a7f37"
                    : infrastructure.supplyDemandSignal === "balanced"
                    ? "#856404"
                    : "#c0392b",
              }}
            >
              {infrastructure.supplyDemandSignal}
            </span>

            {infrastructure.daysOnMarket !== null && infrastructure.daysOnMarket !== undefined && (
              <span style={{ fontSize: 14, color: "#86868b" }}>
                Avg days on market:{" "}
                <strong style={{ color: "#1d1d1f", fontWeight: 700 }}>
                  {infrastructure.daysOnMarket}
                </strong>
              </span>
            )}
            <span style={{ fontSize: 14, color: "#86868b", marginLeft: "auto" }}>
              Infrastructure score:{" "}
              <strong style={{ color: "#1d1d1f", fontWeight: 700 }}>
                {infrastructure.infrastructureScore ?? 0}/10
              </strong>
            </span>
          </div>

          {(infrastructure.projects ?? []).length > 0 && (
            <div style={{ borderTop: "0.5px solid #e8e8ed", marginBottom: 16 }}>
              {(infrastructure.projects ?? []).map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "0.5px solid #e8e8ed",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#1d1d1f",
                        fontWeight: 600,
                        marginBottom: 3,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p.name}
                    </p>
                    <p style={{ fontSize: 13, color: "#86868b", margin: 0 }}>
                      {p.type} · {p.distanceKm}km away
                      {p.completionYear ? ` · Est. ${p.completionYear}` : ""}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "5px 14px",
                      borderRadius: 980,
                      backgroundColor:
                        p.status === "under-construction"
                          ? "#d1f7dc"
                          : p.status === "confirmed"
                          ? "#e8f0fe"
                          : "#f5f5f7",
                      color:
                        p.status === "under-construction"
                          ? "#1a7f37"
                          : p.status === "confirmed"
                          ? "#0071e3"
                          : "#86868b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {infrastructure.opportunitySummary && (
            <p
              style={{
                fontSize: 15,
                color: "#86868b",
                lineHeight: 1.72,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {infrastructure.opportunitySummary}
            </p>
          )}
        </Section>

        {/* ── COMPARABLE SALES ── */}
        {(analysis.comparables ?? []).length > 0 && (
          <Section title="Comparable Sales">
            <div style={{ borderTop: "0.5px solid #e8e8ed" }}>
              {(analysis.comparables ?? []).map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "0.5px solid #e8e8ed",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#1d1d1f",
                        fontWeight: 600,
                        marginBottom: 3,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {c.address}
                    </p>
                    <p style={{ fontSize: 13, color: "#86868b", margin: 0 }}>
                      {c.date} · {c.distanceM}m away
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#1d1d1f",
                      letterSpacing: "-0.02em",
                      flexShrink: 0,
                    }}
                  >
                    ${c.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div
          className="no-print"
          style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}
        >
          <button
            onClick={() => window.print()}
            style={{
              flex: 1,
              minWidth: 200,
              backgroundColor: "#0071e3",
              color: "#fff",
              fontSize: 17,
              fontWeight: 600,
              padding: "16px 24px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.015em",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              boxShadow: "0 4px 16px rgba(0,113,227,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              ...sf,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#0077ed";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,113,227,0.45)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#0071e3";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,113,227,0.35)";
            }}
          >
            <svg width={17} height={17} viewBox="0 0 17 17" fill="none">
              <path
                d="M8.5 1.5v10M5 8.5l3.5 4L12 8.5M2 13.5h13"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download PDF report
          </button>
          <Link
            href="/wizard"
            style={{
              flex: 1,
              minWidth: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "#fff",
              color: "#1d1d1f",
              fontSize: 17,
              fontWeight: 500,
              padding: "16px 24px",
              borderRadius: 14,
              border: "1.5px solid #e8e8ed",
              textDecoration: "none",
              letterSpacing: "-0.015em",
              transition: "border-color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#1d1d1f")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#e8e8ed")}
          >
            New report →
          </Link>
        </div>

        {/* Listing search link */}
        {report.listingSearchUrl && (
          <div style={{ marginBottom: 16 }}>
            <a
              href={report.listingSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#0071e3",
                color: "#fff",
                borderRadius: 12,
                fontFamily: "system-ui",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              View current listings in {property.suburb} on realestate.com.au →
            </a>
            <p style={{ fontSize: 12, color: "#86868b", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
              Links open realestate.com.au filtered to your criteria.
              Yardscore analyses suburb fundamentals — verify specific listing details independently.
            </p>
          </div>
        )}

        {/* Report footer */}
        <div
          style={{
            borderTop: "0.5px solid #e8e8ed",
            marginTop: 56,
            paddingTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <img src="/logo.svg" alt="Yardscore" style={{ height: 22, width: "auto", opacity: 0.5 }} />
          <p style={{ fontSize: 12, color: "#86868b", margin: 0 }}>
            This report is for research purposes only and does not constitute financial
            advice.
          </p>
        </div>
      </main>
    </div>
  );
}
