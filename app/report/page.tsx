"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { FinalReport, MultiPropertyReport } from "@/types";

/* ── Brand ── */
const NAVY = "#0F1F3D";
const GOLD = "#C9A84C";
const GREEN = "#16A34A";
const AMBER = "#D97706";
const RED = "#DC2626";
const LIGHT_GREY = "#F8F9FA";

const sf = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const georgia = {
  fontFamily: "Georgia, serif",
};

/* ── Helpers ── */
function fmt(n: number | null | undefined, prefix = "", suffix = "", fallback = "—") {
  if (n === null || n === undefined) return fallback;
  return `${prefix}${n.toLocaleString()}${suffix}`;
}

function fmtCashflow(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n >= 0) return "$" + Math.abs(n).toLocaleString() + " pw";
  return "-$" + Math.abs(n).toLocaleString() + " pw";
}

function scoreColor(score: number): string {
  if (score >= 7) return GREEN;
  if (score >= 5) return AMBER;
  return RED;
}

function signalConfig(signal: string) {
  const s = (signal ?? "hold").toLowerCase();
  if (s === "buy") return { bg: GREEN, label: "BUY SIGNAL" };
  if (s === "avoid") return { bg: RED, label: "AVOID" };
  return { bg: AMBER, label: "HOLD" };
}

function riskStyle(value: string) {
  const v = (value ?? "none").toLowerCase();
  if (v === "none" || v === "low" || v === "clear" || v === "no" || v === "false") {
    return { bg: "#F0FDF4", border: "#BBF7D0", color: GREEN, display: v === "low" ? "Low" : "Clear" };
  }
  if (v === "high" || v === "yes" || v === "true") {
    return { bg: "#FEF2F2", border: "#FECACA", color: RED, display: v === "high" ? "High" : "Listed" };
  }
  return { bg: "#FEFCE8", border: "#FDE68A", color: AMBER, display: v.charAt(0).toUpperCase() + v.slice(1) };
}

/* ── Logo SVG ── */
function YardscoreLogo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  const circleFill = dark ? NAVY : "white";
  const lineFill = dark ? "white" : NAVY;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill={circleFill} />
      <line x1="11" y1="9" x2="20" y2="20" stroke={lineFill} strokeWidth="3" strokeLinecap="round" />
      <line x1="29" y1="9" x2="20" y2="20" stroke={lineFill} strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="20" x2="20" y2="31" stroke={lineFill} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Animated Number Counter ── */
function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1200 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

/* ── Score Gauge ── */
function ScoreGauge({ score, size = 100 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const fillLength = animated ? (score / 10) * arcLength : 0;
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(135deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth} strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${fillLength} ${circumference - fillLength}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.38, fontWeight: 800, color, lineHeight: 1, ...sf }}>{score}</span>
        <span style={{ fontSize: size * 0.13, color: "rgba(255,255,255,0.5)", marginTop: 2, ...sf }}>/ 10</span>
      </div>
    </div>
  );
}

/* ── Comparison Chart (SVG bar chart) ── */
function ComparisonChart({ reports }: { reports: FinalReport[] }) {
  if (reports.length === 0) return null;

  const metrics = [
    { key: "overallScore", label: "Overall Score", max: 10, format: (v: number) => `${v}/10` },
    { key: "grossYield", label: "Gross Yield %", max: 10, format: (v: number) => `${v.toFixed(1)}%` },
    { key: "infraScore", label: "Infrastructure", max: 10, format: (v: number) => `${v}/10` },
  ];

  const colors = [GOLD, GREEN, "#2563EB"];
  const barHeight = 18;
  const barGap = 6;
  const groupGap = 24;
  const labelWidth = 110;
  const chartWidth = 700;
  const barAreaWidth = chartWidth - labelWidth - 80;

  const totalHeight = metrics.length * (reports.length * (barHeight + barGap) + groupGap) + 50;

  return (
    <div style={{ backgroundColor: LIGHT_GREY, borderRadius: 12, padding: "24px 28px", border: "1px solid #E5E7EB", marginBottom: 28 }}>
      <div style={{ ...sf, fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: "0.08em", marginBottom: 16 }}>
        PROPERTY COMPARISON
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        {reports.slice(0, 3).map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors[i] }} />
            <span style={{ ...sf, fontSize: 12, color: "#555" }}>{r.property?.suburb ?? `Property ${i + 1}`}</span>
          </div>
        ))}
      </div>

      <svg width={chartWidth} height={totalHeight} viewBox={`0 0 ${chartWidth} ${totalHeight}`}>
        {metrics.map((metric, mi) => {
          const groupY = mi * (reports.length * (barHeight + barGap) + groupGap);
          return (
            <g key={metric.key}>
              <text x="0" y={groupY + 12} fontFamily="system-ui,-apple-system,sans-serif" fontSize="11" fontWeight="600" fill="#666" letterSpacing="0.05em">
                {metric.label.toUpperCase()}
              </text>
              {reports.map((r, ri) => {
                let val = 0;
                if (metric.key === "overallScore") val = r.overallScore ?? 0;
                else if (metric.key === "grossYield") val = r.yield?.grossYieldPct ?? 0;
                else if (metric.key === "infraScore") val = r.infrastructure?.infrastructureScore ?? 0;

                const barW = Math.max(6, (val / metric.max) * barAreaWidth);
                const barY = groupY + 20 + ri * (barHeight + barGap);
                const suburb = r.property?.suburb?.substring(0, 14) ?? "";

                return (
                  <g key={ri}>
                    <text x={labelWidth - 8} y={barY + 13} fontFamily="system-ui,-apple-system,sans-serif" fontSize="10" fill="#888" textAnchor="end">
                      {suburb}
                    </text>
                    <rect x={labelWidth} y={barY} width={barW} height={barHeight} rx="4" fill={colors[ri % colors.length]} opacity="0.85" />
                    <text x={labelWidth + barW + 8} y={barY + 13} fontFamily="system-ui,-apple-system,sans-serif" fontSize="11" fontWeight="700" fill="#333">
                      {metric.format(val)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Key Highlights Strip ── */
function HighlightsStrip({ report }: { report: FinalReport }) {
  const v = report.valuation;
  const y = report.yield;
  const infra = report.infrastructure;

  const highlights = [
    { label: "FAIR VALUE", value: fmt(v?.fairValueMid, "$"), color: NAVY },
    { label: "GROSS YIELD", value: y?.grossYieldPct != null ? y.grossYieldPct.toFixed(1) + "%" : "—", color: (y?.grossYieldPct ?? 0) >= 5 ? GREEN : NAVY },
    { label: "CASHFLOW", value: fmtCashflow(y?.cashflowWeekly), color: (y?.cashflowWeekly ?? 0) >= 0 ? GREEN : RED },
    { label: "INFRA SCORE", value: `${infra?.infrastructureScore ?? 0}/10`, color: (infra?.infrastructureScore ?? 0) >= 7 ? GREEN : NAVY },
  ];

  return (
    <div style={{ display: "flex", backgroundColor: "#FAFBFC", borderBottom: "1px solid #E5E7EB" }}>
      {highlights.map((h, i) => (
        <div key={h.label} style={{ flex: 1, textAlign: "center", padding: "16px 12px", borderLeft: i > 0 ? "1px solid #E5E7EB" : "none" }}>
          <div style={{ ...sf, fontSize: 10, letterSpacing: "0.1em", color: "#999", marginBottom: 4 }}>{h.label}</div>
          <div style={{ ...sf, fontSize: 18, fontWeight: 800, color: h.color }}>{h.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Property Card Component ── */
function PropertyCard({ report, index, total }: { report: FinalReport; index: number; total: number }) {
  const p = report.property ?? { address: "", suburb: "", state: "", postcode: "", lat: 0, lng: 0 };
  const v = report.valuation;
  const y = report.yield;
  const r = report.risk;
  const a = report.analysis;
  const infra = report.infrastructure;
  const meta = report.pipelineMeta;
  const sc = report.overallScore ?? 0;
  const signal = signalConfig(String(v?.signal ?? "hold"));

  const flood = riskStyle(String(r?.floodRisk ?? "none"));
  const bushfire = riskStyle(String(r?.bushfireRisk ?? "none"));
  const heritage = riskStyle(r?.hasHeritage ? "yes" : "no");
  const easement = riskStyle(r?.hasEasement ? "yes" : "no");

  const investmentThesis = report.executiveSummary || String(v?.investmentThesis ?? "");
  const listingUrl = report.listingSearchUrl;
  const listingSiteName = listingUrl?.includes("allhomes.com.au") ? "AllHomes.com.au"
    : listingUrl?.includes("homely.com.au") ? "Homely.com.au"
    : listingUrl?.includes("view.com.au") ? "View.com.au"
    : listingUrl?.includes("domain.com.au") ? "Domain.com.au"
    : "AllHomes.com.au";

  return (
    <div style={{ marginBottom: 32 }}>
      {total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: GOLD, opacity: 0.4 }} />
          <span style={{ ...sf, fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: "0.1em" }}>
            PROPERTY {index + 1} OF {total}
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: GOLD, opacity: 0.4 }} />
        </div>
      )}

      <div className="property-card" style={{ backgroundColor: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", transition: "box-shadow 0.3s" }}>
        {/* NAVY HEADER */}
        <div style={{ backgroundColor: NAVY, color: "white", padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...sf, fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 10, fontWeight: 600 }}>
                PROPERTY {index + 1} OF {total}
              </div>
              <h2 style={{ ...sf, fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 8, color: "white" }}>
                {p.address}
              </h2>
              <p style={{ ...sf, fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                {p.suburb} · {p.state} {p.postcode}
              </p>
              <span style={{ display: "inline-block", padding: "6px 18px", borderRadius: 20, backgroundColor: signal.bg, color: "white", ...sf, fontSize: 12, fontWeight: 700 }}>
                {signal.label}
              </span>
            </div>
            <div style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ ...sf, fontSize: 10, letterSpacing: "0.12em", color: GOLD, marginBottom: 4, fontWeight: 600 }}>YARDSCORE</div>
              <ScoreGauge score={sc} size={90} />
            </div>
          </div>
        </div>

        {/* SUBURB PHOTO */}
        {report.suburbPhotoUrl && (
          <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
            <img src={report.suburbPhotoUrl} alt={p.suburb} style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, rgba(0,0,0,0.55))" }} />
            <span style={{ position: "absolute", bottom: 12, left: 20, ...sf, fontSize: 15, fontWeight: 600, color: "white" }}>
              {p.suburb} {p.postcode}
            </span>
          </div>
        )}

        {/* KEY HIGHLIGHTS */}
        <HighlightsStrip report={report} />

        {/* WHY THIS PROPERTY */}
        {meta && (
          <div style={{ backgroundColor: "#EFF6FF", padding: "18px 32px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <span style={{ ...sf, fontSize: 12, backgroundColor: "#F0FDF4", color: GREEN, padding: "5px 14px", borderRadius: 20, fontWeight: 600 }}>
                Passed {meta.checksRun?.length ?? 0} of {meta.checksRun?.length ?? 0} quality checks
              </span>
              <span style={{ ...sf, fontSize: 12, backgroundColor: "#EFF6FF", color: "#2563EB", padding: "5px 14px", borderRadius: 20, fontWeight: 600, border: "1px solid #BFDBFE" }}>
                Ranked #{meta.rankPosition} of {meta.candidatesPassed} candidates
              </span>
              <span style={{ ...sf, fontSize: 12, backgroundColor: "#F5F3FF", color: "#7C3AED", padding: "5px 14px", borderRadius: 20, fontWeight: 600 }}>
                Client score: {meta.clientScore}/10
              </span>
            </div>
            <p style={{ ...sf, fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
              Selected from {meta.candidatesFound} initial candidates across 3 suburbs
            </p>
          </div>
        )}

        {/* TWO COLUMN: RISK + FINANCIAL */}
        <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {/* LEFT: Risk */}
          <div style={{ padding: "28px 32px", borderRight: "1px solid #F0F0F0" }}>
            <h3 style={{ ...sf, fontSize: 11, letterSpacing: "0.12em", color: "#666", marginBottom: 16, fontWeight: 600 }}>RISK ASSESSMENT</h3>
            <div className="risk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "FLOOD RISK", data: flood },
                { label: "BUSHFIRE RISK", data: bushfire },
                { label: "HERITAGE", data: heritage, display: r?.hasHeritage ? "Listed" : "Clear" },
                { label: "EASEMENT", data: easement, display: r?.hasEasement ? "Present" : "Clear" },
              ].map((item) => (
                <div key={item.label} style={{ backgroundColor: item.data.bg, border: `1px solid ${item.data.border}`, borderRadius: 8, padding: "12px 10px", textAlign: "center" }}>
                  <div style={{ ...sf, fontSize: 10, color: "#666", letterSpacing: "0.1em", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ ...sf, fontSize: 15, fontWeight: 700, color: item.data.color }}>{item.display ?? item.data.display}</div>
                </div>
              ))}
            </div>
            {r?.zoningCode && (
              <div style={{ ...sf, fontSize: 13, color: "#555", marginBottom: 6 }}>
                <strong style={{ color: "#333" }}>Zoning:</strong> {r.zoningCode}{r.zoningDescription ? ` — ${r.zoningDescription}` : ""}
              </div>
            )}
            {r?.socialHousingPct != null && (
              <div style={{ ...sf, fontSize: 13, color: "#555", marginBottom: 6 }}>
                <strong style={{ color: "#333" }}>Social housing:</strong> {r.socialHousingPct}%
              </div>
            )}
            {r?.riskSummary && (
              <p style={{ ...georgia, fontSize: 13, fontStyle: "italic", color: "#666", lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
                {r.riskSummary}
              </p>
            )}
          </div>

          {/* RIGHT: Financial */}
          <div style={{ padding: "28px 32px" }}>
            <h3 style={{ ...sf, fontSize: 11, letterSpacing: "0.12em", color: "#666", marginBottom: 16, fontWeight: 600 }}>FINANCIAL ANALYSIS</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  { label: "Fair value range", value: `${fmt(v?.fairValueLow, "$")} – ${fmt(v?.fairValueHigh, "$")}` },
                  { label: "Fair value mid", value: fmt(v?.fairValueMid, "$"), bold: true, color: NAVY },
                  { label: "Weekly rent est.", value: y?.estimatedWeeklyRent ? `$${y.estimatedWeeklyRent.toLocaleString()} pw` : "—" },
                  { label: "Gross yield", value: y?.grossYieldPct != null ? y.grossYieldPct.toFixed(2) + "%" : "—", bold: true, color: (y?.grossYieldPct ?? 0) >= 5 ? GREEN : "#333" },
                  { label: "Net yield", value: y?.netYieldPct != null ? y.netYieldPct.toFixed(2) + "%" : "—" },
                  { label: "Weekly cashflow", value: fmtCashflow(y?.cashflowWeekly), bold: true, color: (y?.cashflowWeekly ?? 0) >= 0 ? GREEN : RED },
                  { label: "Vacancy rate", value: y?.vacancyRatePct != null ? y.vacancyRatePct + "%" : "—" },
                  { label: "Bedrooms", value: a?.bedrooms != null ? String(a.bedrooms) : "—" },
                  { label: "Bathrooms", value: a?.bathrooms != null ? String(a.bathrooms) : "—" },
                  { label: "Land size", value: a?.landSize ? a.landSize.toLocaleString() + " m²" : "—" },
                  { label: "Year built", value: a?.yearBuilt ? String(a.yearBuilt) : "—" },
                ].map((row, i) => (
                  <tr key={row.label} style={{ backgroundColor: i % 2 === 0 ? LIGHT_GREY : "white" }}>
                    <td style={{ ...sf, padding: "9px 12px", fontSize: 13, color: "#666" }}>{row.label}</td>
                    <td style={{ ...sf, padding: "9px 12px", fontSize: row.bold ? 14 : 13, fontWeight: row.bold ? 700 : 500, color: row.color ?? "#333", textAlign: "right" }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* INFRASTRUCTURE */}
        <div style={{ backgroundColor: "#F0F4FF", borderLeft: `4px solid ${NAVY}`, margin: "0 24px", padding: "20px 24px", borderRadius: "0 8px 8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ ...sf, fontSize: 15, fontWeight: 700, color: NAVY }}>Infrastructure Pipeline</span>
            <span style={{ display: "inline-block", padding: "4px 14px", backgroundColor: NAVY, color: "white", borderRadius: 12, ...sf, fontSize: 12, fontWeight: 700 }}>
              {infra?.infrastructureScore ?? 0}/10
            </span>
          </div>
          {infra?.opportunitySummary && (
            <p style={{ ...georgia, fontSize: 14, lineHeight: 1.7, color: "#444", marginBottom: (infra?.projects?.length ?? 0) > 0 ? 12 : 0 }}>
              {infra.opportunitySummary}
            </p>
          )}
          {(infra?.projects ?? []).length > 0 && (
            <div style={{ borderTop: "1px solid #E5E7EB" }}>
              {(infra?.projects ?? []).map((proj, i) => {
                const statusColor = proj.status === "under-construction" ? GREEN : proj.status === "confirmed" ? "#2563EB" : AMBER;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #E5E7EB" }}>
                    <div>
                      <span style={{ ...sf, fontSize: 14, fontWeight: 600, color: NAVY }}>{proj.name}</span>
                      <span style={{ ...sf, fontSize: 12, color: "#888", marginLeft: 10 }}>{proj.distanceKm}km{proj.completionYear ? ` · Est. ${proj.completionYear}` : ""}</span>
                    </div>
                    <span style={{ ...sf, fontSize: 11, fontWeight: 700, color: statusColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {proj.status.replace("-", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* INVESTMENT THESIS */}
        {investmentThesis && (
          <div style={{ margin: "24px", padding: "24px", border: "1px solid #E5E7EB", borderRadius: 10 }}>
            <div style={{ ...sf, fontSize: 10, letterSpacing: "0.15em", color: GOLD, marginBottom: 12, fontWeight: 700 }}>
              INVESTMENT THESIS — YARDSCORE AI ANALYSIS
            </div>
            <p style={{ ...georgia, fontStyle: "italic", fontSize: 15, lineHeight: 1.9, color: "#333", margin: 0 }}
               dangerouslySetInnerHTML={{ __html: investmentThesis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>
        )}

        {/* LISTING LINK */}
        {listingUrl && (
          <div style={{ padding: "0 24px 24px" }}>
            <a href={listingUrl} target="_blank" rel="noopener noreferrer"
              className="listing-btn"
              style={{
                display: "block", textAlign: "center", padding: "16px",
                backgroundColor: "#2563EB", color: "white", borderRadius: 10,
                ...sf, fontSize: 15, fontWeight: 600, textDecoration: "none",
                transition: "background-color 0.2s, transform 0.15s",
              }}
            >
              View current listings on {listingSiteName} →
            </a>
            <p style={{ ...sf, fontSize: 11, color: "#999", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
              Yardscore analyses suburb fundamentals. Verify specific listing details independently.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* MAIN REPORT PAGE                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ReportPage() {
  const [multiReport, setMultiReport] = useState<MultiPropertyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadHovered, setDownloadHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("ys_report");
    if (!raw) { setError("No report found. Please complete the wizard first."); return; }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.error) { setError(parsed.error); }
      else if (parsed.properties && Array.isArray(parsed.properties)) { setMultiReport(parsed as MultiPropertyReport); }
      else {
        setMultiReport({
          recommendedSuburbs: [parsed.property?.suburb ?? ""],
          suburbReasoning: "",
          properties: [parsed as FinalReport],
          generatedAt: parsed.generatedAt ?? new Date().toISOString(),
        });
      }
    } catch { setError("Failed to load report data."); }
  }, []);

  // Scroll shadow on navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    try {
      const wizardRaw = localStorage.getItem("ys_wizard");
      const wizard = wizardRaw ? JSON.parse(wizardRaw) : {};
      const reportRaw = localStorage.getItem("ys_report");
      const reportData = reportRaw ? JSON.parse(reportRaw) : {};

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData, wizardInputs: wizard }),
      });

      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Yardscore-Report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { window.print(); }
  }, []);

  /* Error state */
  if (error) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: LIGHT_GREY, display: "flex", alignItems: "center", justifyContent: "center", ...sf }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
              <path d="M14 9v6M14 19v1M4 14a10 10 0 1020 0A10 10 0 004 14z" stroke={RED} strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Report not found</h2>
          <p style={{ fontSize: 16, color: "#888", marginBottom: 28, lineHeight: 1.6 }}>{error}</p>
          <Link href="/wizard" style={{ display: "inline-block", backgroundColor: NAVY, color: GOLD, fontSize: 16, fontWeight: 600, padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}>
            Start a new report
          </Link>
        </div>
      </div>
    );
  }

  /* Loading */
  if (!multiReport) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 48, height: 48 }}>
          <svg width={48} height={48} viewBox="0 0 48 48" style={{ animation: "spin 0.9s linear infinite" }}>
            <circle cx={24} cy={24} r={18} fill="none" stroke="#E5E7EB" strokeWidth={4} />
            <circle cx={24} cy={24} r={18} fill="none" stroke={NAVY} strokeWidth={4} strokeLinecap="round" strokeDasharray="28 84" />
          </svg>
        </div>
        <p style={{ fontSize: 15, color: "#888", ...sf }}>Loading your report…</p>
      </div>
    );
  }

  const allProperties = multiReport.properties ?? [];
  if (allProperties.length === 0) return null;

  const generatedAt = multiReport.generatedAt ?? allProperties[0]?.generatedAt ?? "";
  const reportDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const totalFound = multiReport.pipelineSummary?.candidatesFound ?? 0;
  const totalPassed = multiReport.pipelineSummary?.candidatesPassed ?? 0;

  return (
    <div style={{ backgroundColor: LIGHT_GREY, minHeight: "100vh", ...sf }}>
      {/* ── STYLES ── */}
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .report-fade { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .property-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important; }
        .listing-btn:hover { background-color: #1D4ED8 !important; transform: translateY(-1px); }

        /* ── Print optimised stylesheet ── */
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .report-fade { animation: none !important; }
          .property-card { box-shadow: none !important; border: 1px solid #ddd !important; page-break-inside: avoid; }
          .property-card:hover { box-shadow: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          .two-col-grid { grid-template-columns: 1fr 1fr !important; }
          .risk-grid { grid-template-columns: 1fr 1fr !important; }
          img { max-height: 160px !important; }
          a { color: #333 !important; text-decoration: none !important; }
          svg circle { transition: none !important; }
        }

        @media (max-width:768px) {
          .two-col-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── STICKY NAVBAR ── */}
      <header className="no-print" style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "white",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        transition: "box-shadow 0.3s, background-color 0.3s",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <YardscoreLogo size={24} dark />
          <span style={{ ...sf, fontSize: 16, fontWeight: 700, color: NAVY }}>Yardscore</span>
        </Link>
        <span style={{ ...sf, fontSize: 13, color: "#999" }}>Generated {reportDate}</span>
        <button onClick={handleDownloadPDF}
          onMouseEnter={() => setDownloadHovered(true)}
          onMouseLeave={() => setDownloadHovered(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: NAVY, color: GOLD,
            fontSize: 14, fontWeight: 600, padding: "10px 22px", borderRadius: 8,
            border: "none", cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.2s",
            transform: downloadHovered ? "translateY(-1px)" : "none",
            boxShadow: downloadHovered ? `0 4px 16px rgba(15,31,61,0.4)` : `0 2px 8px rgba(15,31,61,0.25)`,
            ...sf,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1v9M4 7l3.5 3.5L11 7M2 12h11" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download PDF
        </button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="report-fade" style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 100px" }}>

        {/* ── SUBURB RATIONALE ── */}
        {multiReport.suburbReasoning && (
          <div style={{ backgroundColor: "white", borderRadius: 16, padding: "32px", marginBottom: 28, borderLeft: `4px solid ${GOLD}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ ...sf, fontSize: 11, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              AI-SELECTED SUBURBS
            </p>
            <h2 style={{ ...sf, fontSize: 24, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Why these suburbs?</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {(multiReport.recommendedSuburbs ?? []).map((suburb) => (
                <span key={suburb} style={{ display: "inline-block", padding: "8px 20px", borderRadius: 20, backgroundColor: NAVY, color: "white", ...sf, fontSize: 14, fontWeight: 600 }}>
                  {suburb}
                </span>
              ))}
            </div>
            <p style={{ ...sf, fontSize: 15, color: "#444", lineHeight: 1.75, margin: 0 }}
               dangerouslySetInnerHTML={{ __html: multiReport.suburbReasoning.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />

            {/* Animated screening stats */}
            {multiReport.pipelineSummary && (
              <div style={{
                marginTop: 24,
                background: `linear-gradient(135deg, ${NAVY} 0%, #1a3260 100%)`,
                borderRadius: 12, padding: "20px 28px",
                display: "flex", justifyContent: "space-around", textAlign: "center",
              }}>
                <div>
                  <div style={{ ...sf, fontSize: 28, fontWeight: 800, color: "white" }}>
                    <AnimatedNumber value={totalFound} />
                  </div>
                  <div style={{ ...sf, fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginTop: 4 }}>DISCOVERED</div>
                </div>
                <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
                <div>
                  <div style={{ ...sf, fontSize: 28, fontWeight: 800, color: "white" }}>
                    <AnimatedNumber value={totalPassed} />
                  </div>
                  <div style={{ ...sf, fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginTop: 4 }}>PASSED CHECKS</div>
                </div>
                <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
                <div>
                  <div style={{ ...sf, fontSize: 28, fontWeight: 800, color: GOLD }}>
                    <AnimatedNumber value={allProperties.length} />
                  </div>
                  <div style={{ ...sf, fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginTop: 4 }}>RECOMMENDED</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COMPARISON CHART ── */}
        {allProperties.length > 1 && (
          <ComparisonChart reports={allProperties} />
        )}

        {/* ── PROPERTY CARDS ── */}
        {allProperties.map((currentReport, i) => (
          <PropertyCard key={i} report={currentReport} index={i} total={allProperties.length} />
        ))}

        {/* ── BOTTOM BUTTONS ── */}
        <div className="no-print" style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
          <button onClick={handleDownloadPDF}
            style={{
              flex: 1, minWidth: 200, backgroundColor: NAVY, color: GOLD,
              fontSize: 17, fontWeight: 600, padding: "16px 24px", borderRadius: 10,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "transform 0.15s, box-shadow 0.2s",
              boxShadow: `0 4px 16px rgba(15,31,61,0.3)`, ...sf,
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            <svg width={17} height={17} viewBox="0 0 17 17" fill="none">
              <path d="M8.5 1.5v10M5 8.5l3.5 4L12 8.5M2 13.5h13" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download PDF Report
          </button>
          <Link href="/wizard"
            style={{
              flex: 1, minWidth: 160, display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "white", color: NAVY, fontSize: 17, fontWeight: 500,
              padding: "16px 24px", borderRadius: 10, border: `1.5px solid #E5E7EB`,
              textDecoration: "none", transition: "border-color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = NAVY)}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          >
            Start a new search →
          </Link>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 56, paddingTop: 28, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <YardscoreLogo size={24} dark />
          </div>
          <p style={{ ...sf, fontSize: 12, color: "#999", lineHeight: 1.6, maxWidth: 600, margin: "0 auto 8px" }}>
            This report is for research and information purposes only and does not constitute financial, investment, legal or taxation advice.
            Property investment involves risk including possible loss of capital.
          </p>
          <p style={{ ...sf, fontSize: 11, color: "#bbb" }}>
            © {new Date().getFullYear()} Yardscore · yardscore.com.au · hello@yardscore.com.au
          </p>
        </div>
      </main>
    </div>
  );
}
