"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const sf: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

/* ── Animated counter (fires when scrolled into view) ── */
function CountUp({
  target,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function StarRating() {
  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={17} height={17} viewBox="0 0 16 16" fill="#f59e0b">
          <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.71 4.13L8 10.5l-3.71 1.95.71-4.13L2 5.5l4.15-.75L8 1z" />
        </svg>
      ))}
    </div>
  );
}

function CheckIcon({ color = "#1a7f37" }: { color?: string }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: color === "#1a7f37" ? "#d1f7dc" : "#fde8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {color === "#1a7f37" ? (
        <svg width={12} height={9} viewBox="0 0 12 9" fill="none">
          <path
            d="M1 4.5L4.5 8L11 1"
            stroke="#1a7f37"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
          <path
            d="M1 1l9 9M10 1L1 10"
            stroke="#c0392b"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [heroCTAHovered, setHeroCTAHovered] = useState(false);
  const [bottomCTAHovered, setBottomCTAHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Property investor · 3 IPs",
      location: "Brisbane, QLD",
      quote:
        "I was spending weekends on realestate.com.au getting nowhere. Yardscore found me three properties in Caboolture under $650k with verified yields above 5%. I bought my third IP within a month.",
      badge: "Saved 4 weeks of research",
    },
    {
      name: "James K.",
      role: "Self-managed super fund",
      location: "Melbourne, VIC",
      quote:
        "The flood risk and zoning checks alone saved me from a Werribee property that looked perfect on paper. Medium flood overlay. Yardscore flagged it before I wasted money on a building inspection.",
      badge: "Avoided a high-risk purchase",
    },
    {
      name: "Priya L.",
      role: "First investment property",
      location: "Perth, WA",
      quote:
        "As someone new to property investing, getting a report with real AllHomes listings, yield estimates and comparable sales gave me the confidence to make an offer in Armadale. Settled 6 weeks later.",
      badge: "First IP purchased in 6 weeks",
    },
  ];

  const comparisonRows: {
    feature: string;
    piq: boolean;
    ba: boolean;
    piqNote?: string;
    baNote?: string;
    piqValue?: string;
    baValue?: string;
  }[] = [
    { feature: "Comparable sales analysis", piq: true, ba: true },
    { feature: "Rental yield estimates", piq: true, ba: true },
    { feature: "Flood & bushfire risk checks", piq: true, ba: true },
    { feature: "Zoning & heritage overlay review", piq: true, ba: true },
    { feature: "Investment score & shortlist ranking", piq: true, ba: true },
    {
      feature: "Delivered in under 10 minutes",
      piq: true,
      ba: false,
      baNote: "2–5 days typical",
    },
    {
      feature: "Price negotiation support",
      piq: false,
      ba: true,
      piqNote: "Not included",
    },
    {
      feature: "Off-market property access",
      piq: false,
      ba: true,
      piqNote: "Not included",
    },
    { feature: "Cost", piq: true, ba: false, piqValue: "$99", baValue: "$15,000+" },
  ];

  const steps = [
    { num: "1", title: "Answer 5 questions", desc: "Budget, location, type and goals" },
    { num: "2", title: "We find properties", desc: "Matching across target suburbs" },
    { num: "3", title: "AI runs due diligence", desc: "20+ checks per property" },
    { num: "4", title: "Properties ranked", desc: "By overall investment score" },
    { num: "5", title: "Report delivered", desc: "Ready in approximately 10 minutes" },
  ];

  const reportItems = [
    "Overall investment score out of 10",
    "Gross and net rental yield estimates",
    "Weekly cashflow projections",
    "Flood, bushfire and zoning risk flags",
    "Comparable recent sales",
    "Fair value range vs asking price",
    "Infrastructure and development pipeline",
    "Supply and demand signals",
    "Vacancy rate data",
    "Executive summary and investment thesis",
  ];

  return (
    <main style={{ ...sf, backgroundColor: "#fff", color: "#1d1d1f" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .hero-h1  { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .hero-sub { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .hero-cta { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
        .hero-badge { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.00s both; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .compare-col { display: none !important; }
          .compare-grid { grid-template-columns: 1fr 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .report-items-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-tagline { display: none !important; }
        }
      `}</style>

      {/* ─────────── NAV ─────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          transition: "background-color 0.35s ease, box-shadow 0.35s ease",
          backgroundColor: scrolled ? "rgba(255,255,255,0.94)" : "transparent",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          boxShadow: scrolled ? "0 0.5px 0 rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 32px",
            height: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <img
            src={scrolled ? "/logo.svg" : "/logo-white.svg"}
            alt="Yardscore"
            style={{ height: 32, width: "auto", transition: "opacity 0.35s" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <span
              className="nav-tagline"
              style={{
                fontSize: 14,
                color: scrolled ? "#86868b" : "rgba(255,255,255,0.6)",
                letterSpacing: "-0.01em",
                transition: "color 0.35s",
              }}
            >
              Australia-wide · $99 per report
            </span>
            <Link
              href="/wizard"
              style={{
                backgroundColor: "#0071e3",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "10px 22px",
                borderRadius: 980,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                boxShadow: "0 1px 4px rgba(0,113,227,0.4)",
                transition: "background 0.2s",
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────── HERO ─────────── */}
      <section
        style={{
          position: "relative",
          height: "96vh",
          minHeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=1920&q=85"
          alt="Brisbane skyline at dusk"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center 38%" }}
        />
        {/* Rich layered overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(165deg, rgba(5,10,20,0.80) 0%, rgba(10,20,40,0.60) 55%, rgba(0,0,0,0.40) 100%)",
          }}
        />
        {/* Bottom vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at bottom, rgba(0,0,0,0.4) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          {/* Trust badge */}
          <div
            className="hero-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.18)",
              borderRadius: 980,
              padding: "8px 18px",
              marginBottom: 36,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#34c759",
                animation: "pulse 2.2s ease infinite",
              }}
            />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", letterSpacing: "0.01em" }}>
              Australian property intelligence · 700+ suburbs tracked
            </span>
          </div>

          <h1
            className="hero-h1"
            style={{
              fontSize: "clamp(42px, 7vw, 80px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.038em",
              lineHeight: 1.04,
              marginBottom: 28,
            }}
          >
            Your $800,000 decision<br />deserves better<br />than a hunch.
          </h1>

          <p
            className="hero-sub"
            style={{
              fontSize: "clamp(18px, 2.2vw, 22px)",
              color: "rgba(255,255,255,0.72)",
              letterSpacing: "-0.01em",
              lineHeight: 1.65,
              margin: "0 auto 56px",
              maxWidth: 620,
            }}
          >
            Yardscore runs the same due diligence as a buyer's agent — comparable
            sales, flood risk, rental yield, zoning — and delivers a ranked shortlist
            in under 10 minutes. For $99.
          </p>

          <div
            className="hero-cta"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <Link
              href="/wizard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: heroCTAHovered ? "#0077ed" : "#0071e3",
                color: "#fff",
                fontSize: 19,
                fontWeight: 600,
                padding: "18px 40px",
                borderRadius: 980,
                textDecoration: "none",
                letterSpacing: "-0.02em",
                transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
                transform: heroCTAHovered ? "scale(1.02) translateY(-1px)" : "scale(1)",
                boxShadow: heroCTAHovered
                  ? "0 8px 32px rgba(0,113,227,0.55)"
                  : "0 4px 20px rgba(0,113,227,0.4)",
              }}
              onMouseOver={() => setHeroCTAHovered(true)}
              onMouseOut={() => setHeroCTAHovered(false)}
            >
              Start my report — $99
              <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                <path
                  d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {[
                "One report · No subscription",
                "~10 minute delivery",
                "vs $15,000 buyers agent",
              ].map((text, i) => (
                <span key={text} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && (
                    <span
                      style={{
                        color: "rgba(255,255,255,0.2)",
                        margin: "0 14px",
                        fontSize: 14,
                      }}
                    >
                      ·
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                    {text}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <svg width={14} height={9} viewBox="0 0 14 9" fill="none">
            <path
              d="M1 1l6 6 6-6"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ─────────── ANIMATED STATS ─────────── */}
      <section style={{ backgroundColor: "#0a0a0f", padding: "64px 24px" }}>
        <div
          className="stats-grid"
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
          }}
        >
          {[
            { target: 2400, suffix: "+", label: "Properties analysed", prefix: "" },
            { target: 20, suffix: "+", label: "Data points per property", prefix: "" },
            { target: 10, suffix: " min", label: "Average delivery", prefix: "" },
            { target: 99, suffix: "", label: "vs $15,000 agent fee", prefix: "$" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                padding: "12px 24px",
                borderLeft: i > 0 ? "0.5px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(38px, 4.5vw, 58px)",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.045em",
                  marginBottom: 6,
                  lineHeight: 1,
                }}
              >
                <CountUp
                  target={stat.target}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={1800}
                />
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.38)",
                  letterSpacing: "-0.01em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── FEATURE CARDS ─────────── */}
      <section style={{ backgroundColor: "#f5f5f7", padding: "130px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0071e3",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            What we do
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 700,
              color: "#1d1d1f",
              letterSpacing: "-0.038em",
              textAlign: "center",
              marginBottom: 18,
              lineHeight: 1.06,
            }}
          >
            Professional analysis.<br />Not the $15,000 kind.
          </h2>
          <p
            style={{
              fontSize: 20,
              color: "#86868b",
              textAlign: "center",
              letterSpacing: "-0.01em",
              lineHeight: 1.55,
              maxWidth: 480,
              margin: "0 auto 80px",
            }}
          >
            Everything a buyer's agent checks — done by AI, delivered in minutes.
          </p>
          <div
            className="features-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
          >
            {[
              {
                img: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=700&q=80",
                badge: "Due diligence",
                title: "20+ checks per property",
                desc: "Comparable sales, rental yields, zoning, heritage listings, flood risk, bushfire overlays — the complete investment picture in a single ranked report.",
              },
              {
                img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80",
                badge: "Risk screening",
                title: "Know before you bid",
                desc: "Every property is screened against natural disaster overlays, easements, social housing proximity and infrastructure constraints that aren't visible on the listing.",
              },
              {
                img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&q=80",
                badge: "Speed",
                title: "Report in under 10 minutes",
                desc: "No waiting for agent availability. No 2-day turnarounds. A fully scored, ranked shortlist with executive summaries — ready while you're still thinking about it.",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 22,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ height: 250, position: "relative", flexShrink: 0 }}>
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)",
                    }}
                  />
                  <div style={{ position: "absolute", top: 18, left: 18 }}>
                    <span
                      style={{
                        backgroundColor: "rgba(0,0,0,0.48)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "6px 14px",
                        borderRadius: 980,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "30px 30px 38px", flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#1d1d1f",
                      letterSpacing: "-0.028em",
                      marginBottom: 12,
                      lineHeight: 1.2,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: "#86868b",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── REPORT MOCKUP ─────────── */}
      <section style={{ backgroundColor: "#080c14", padding: "150px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#34c759",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 18,
              }}
            >
              What you receive
            </p>
            <h2
              style={{
                fontSize: "clamp(32px, 4.5vw, 56px)",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.038em",
                lineHeight: 1.06,
                marginBottom: 18,
              }}
            >
              A report worth acting on.
            </h2>
            <p
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "-0.01em",
                lineHeight: 1.55,
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              Professional-grade investment analysis. Clear signals. No fluff.
            </p>
          </div>

          {/* PDF mockup */}
          <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
            {/* Ambient glow */}
            <div
              style={{
                position: "absolute",
                inset: -60,
                background:
                  "radial-gradient(ellipse at center, rgba(0,113,227,0.18) 0%, transparent 68%)",
                filter: "blur(30px)",
                zIndex: 0,
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                backgroundColor: "#fff",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow:
                  "0 50px 120px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.08)",
              }}
            >
              {/* Report header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #071020 0%, #0d2645 100%)",
                  padding: "28px 36px 32px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <img src="/favicon.svg" alt="" style={{ width: 22, height: 22 }} />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      Yardscore Investment Report
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "-0.025em",
                      margin: "0 0 6px",
                    }}
                  >
                    QLD Growth Corridor · 3 properties ranked
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.38)",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    6 April 2025 · Budget $750k–$1M · 3 bed+ · Rental focus
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.38)",
                      marginBottom: 4,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Top score
                  </div>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 700,
                      color: "#34c759",
                      letterSpacing: "-0.045em",
                      lineHeight: 1,
                    }}
                  >
                    8.1
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    / 10
                  </div>
                </div>
              </div>

              {/* Key metrics strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  borderBottom: "0.5px solid #e8e8ed",
                  backgroundColor: "#fafafa",
                }}
              >
                {[
                  { label: "Gross yield", value: "5.4%", good: true },
                  { label: "Weekly rent est.", value: "$590", good: true },
                  { label: "Weekly cashflow", value: "+$62", good: true },
                  { label: "Flood risk", value: "Clear ✓", good: true },
                ].map((m, i) => (
                  <div
                    key={m.label}
                    style={{
                      padding: "18px 20px",
                      borderLeft: i > 0 ? "0.5px solid #e8e8ed" : "none",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{ fontSize: 12, color: "#86868b", marginBottom: 5 }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontSize: 21,
                        fontWeight: 700,
                        color: "#1d1d1f",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Property rows */}
              {[
                {
                  address: "38 Petersen Rd, Morayfield",
                  detail: "3 bed · 2 bath · 600m² · House",
                  score: 7.8,
                  signal: "BUY",
                  signalBg: "#d1f7dc",
                  signalColor: "#1a7f37",
                  rank: 1,
                  price: "$569,000",
                },
                {
                  address: "107 King St, Caboolture",
                  detail: "3 bed · 1 bath · 450m² · Villa",
                  score: 7.2,
                  signal: "BUY",
                  signalBg: "#d1f7dc",
                  signalColor: "#1a7f37",
                  rank: 2,
                  price: "$550,000",
                },
                {
                  address: "4 Spalding Cres, Goodna",
                  detail: "3 bed · 1 bath · 380m² · House",
                  score: 6.8,
                  signal: "HOLD",
                  signalBg: "#fff3cd",
                  signalColor: "#856404",
                  rank: 3,
                  price: "$530,000",
                },
              ].map((p, i) => (
                <div
                  key={p.address}
                  style={{
                    padding: "22px 36px",
                    borderBottom: i < 2 ? "0.5px solid #e8e8ed" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  {/* Rank badge */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: i === 0 ? "#0071e3" : "#f0f0f5",
                      color: i === 0 ? "#fff" : "#86868b",
                      fontSize: 15,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {p.rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#1d1d1f",
                        letterSpacing: "-0.015em",
                        margin: "0 0 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.address}
                    </p>
                    <p style={{ fontSize: 13, color: "#86868b", margin: 0 }}>
                      {p.detail}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#86868b", marginBottom: 2 }}>
                      Asking
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1d1d1f",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p.price}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#86868b", marginBottom: 2 }}>
                      Score
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#1d1d1f",
                        letterSpacing: "-0.035em",
                        lineHeight: 1,
                      }}
                    >
                      {p.score}
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: p.signalBg,
                      color: p.signalColor,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "6px 16px",
                      borderRadius: 980,
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                    }}
                  >
                    {p.signal}
                  </span>
                </div>
              ))}

              {/* Blurred preview section */}
              <div style={{ position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    padding: "24px 36px 20px",
                    borderTop: "0.5px solid #e8e8ed",
                    filter: "blur(4px)",
                    opacity: 0.5,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#86868b",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    Executive Summary
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#1d1d1f",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    38 Petersen Rd, Morayfield presents a strong investment opportunity
                    in one of SEQ's fastest growing corridors. With a gross yield
                    of 5.4% and a vacancy rate below 1%, the rental fundamentals are
                    strong. Clear of flood and bushfire overlays, with Morayfield's
                    $823k median and rapid population growth supporting values...
                  </p>
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.96) 50%, rgba(255,255,255,1) 100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: 22,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#86868b",
                      textAlign: "center",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Full analysis unlocked after payment · $99 flat fee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── COMPARISON ─────────── */}
      <section style={{ backgroundColor: "#fff", padding: "150px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0071e3",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 18,
              }}
            >
              Honest comparison
            </p>
            <h2
              style={{
                fontSize: "clamp(32px, 4.5vw, 56px)",
                fontWeight: 700,
                color: "#1d1d1f",
                letterSpacing: "-0.038em",
                lineHeight: 1.06,
                marginBottom: 18,
              }}
            >
              Yardscore vs a buyer's agent.
            </h2>
            <p
              style={{
                fontSize: 20,
                color: "#86868b",
                letterSpacing: "-0.01em",
                lineHeight: 1.55,
                maxWidth: 540,
                margin: "0 auto",
              }}
            >
              We're the research layer. They're the relationship layer. Here's
              exactly what you get — and don't get — with each.
            </p>
          </div>

          <div
            style={{
              borderRadius: 22,
              overflow: "hidden",
              border: "0.5px solid #d2d2d7",
              boxShadow: "0 4px 40px rgba(0,0,0,0.07)",
            }}
          >
            {/* Header */}
            <div
              className="compare-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                backgroundColor: "#f5f5f7",
              }}
            >
              <div
                style={{
                  padding: "22px 28px",
                  borderRight: "0.5px solid #d2d2d7",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#86868b",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Feature
                </span>
              </div>
              <div
                style={{
                  padding: "22px 28px",
                  borderRight: "0.5px solid #d2d2d7",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <img src="/favicon.svg" alt="" style={{ width: 20, height: 20 }} />
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1d1d1f",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Yardscore
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0071e3",
                    letterSpacing: "-0.03em",
                  }}
                >
                  $99
                </span>
              </div>
              <div style={{ padding: "22px 28px", textAlign: "center" }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1d1d1f",
                    letterSpacing: "-0.01em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Buyer's Agent
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#86868b",
                    letterSpacing: "-0.03em",
                  }}
                >
                  $15,000+
                </span>
              </div>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className="compare-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderTop: "0.5px solid #d2d2d7",
                  backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <div
                  style={{
                    padding: "20px 28px",
                    borderRight: "0.5px solid #d2d2d7",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      color: "#1d1d1f",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {row.feature}
                  </span>
                </div>
                <div
                  style={{
                    padding: "20px 28px",
                    borderRight: "0.5px solid #d2d2d7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {row.piqValue ? (
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#0071e3",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {row.piqValue}
                    </span>
                  ) : row.piq ? (
                    <CheckIcon color="#1a7f37" />
                  ) : (
                    <span style={{ fontSize: 13, color: "#86868b" }}>
                      {row.piqNote ?? "—"}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    padding: "20px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {row.baValue ? (
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#86868b",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {row.baValue}
                    </span>
                  ) : row.ba ? (
                    <CheckIcon color="#1a7f37" />
                  ) : (
                    <span style={{ fontSize: 13, color: "#86868b" }}>
                      {row.baNote ?? "—"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 15,
              color: "#86868b",
              textAlign: "center",
              marginTop: 28,
              lineHeight: 1.65,
            }}
          >
            We're honest: buyer's agents are worth it for negotiation and off-market
            access.{" "}
            <strong style={{ color: "#1d1d1f", fontWeight: 600 }}>
              Yardscore is the research layer
            </strong>{" "}
            — the intelligence that makes you a smarter buyer, at 0.66% of the cost.
          </p>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section style={{ backgroundColor: "#f5f5f7", padding: "130px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0071e3",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            The process
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 700,
              color: "#1d1d1f",
              letterSpacing: "-0.038em",
              textAlign: "center",
              marginBottom: 18,
              lineHeight: 1.06,
            }}
          >
            From question to report<br />in five steps.
          </h2>
          <p
            style={{
              fontSize: 20,
              color: "#86868b",
              textAlign: "center",
              letterSpacing: "-0.01em",
              lineHeight: 1.55,
              maxWidth: 400,
              margin: "0 auto 88px",
            }}
          >
            No phone calls. No meetings. Just answers.
          </p>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 28,
                left: "calc(10% + 36px)",
                right: "calc(10% + 36px)",
                height: 1,
                backgroundColor: "#d2d2d7",
                zIndex: 0,
              }}
            />
            <div
              className="steps-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 16,
                position: "relative",
                zIndex: 1,
              }}
            >
              {steps.map((step) => (
                <div
                  key={step.num}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      backgroundColor: "#0071e3",
                      color: "#fff",
                      fontSize: 20,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 22,
                      flexShrink: 0,
                      boxShadow:
                        "0 0 0 7px #f5f5f7, 0 4px 14px rgba(0,113,227,0.35)",
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1d1d1f",
                      letterSpacing: "-0.01em",
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#86868b",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── SOCIAL PROOF ─────────── */}
      <section style={{ backgroundColor: "#fff", padding: "130px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0071e3",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            Investor stories
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 700,
              color: "#1d1d1f",
              letterSpacing: "-0.038em",
              textAlign: "center",
              marginBottom: 18,
              lineHeight: 1.06,
            }}
          >
            From Australian investors<br />who've used Yardscore.
          </h2>
          <p
            style={{
              fontSize: 20,
              color: "#86868b",
              textAlign: "center",
              letterSpacing: "-0.01em",
              lineHeight: 1.55,
              maxWidth: 400,
              margin: "0 auto 80px",
            }}
          >
            Real investors. Real outcomes.
          </p>

          <div
            className="testimonials-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                style={{
                  backgroundColor: "#f5f5f7",
                  borderRadius: 22,
                  padding: "38px 34px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <StarRating />
                <p
                  style={{
                    fontSize: 17,
                    color: "#1d1d1f",
                    lineHeight: 1.78,
                    marginBottom: 36,
                    flex: 1,
                    fontStyle: "italic",
                    letterSpacing: "-0.01em",
                  }}
                >
                  "{t.quote}"
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1d1d1f",
                        margin: "0 0 3px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {t.name}
                    </p>
                    <p style={{ fontSize: 13, color: "#86868b", margin: 0 }}>
                      {t.role} · {t.location}
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#d1f7dc",
                      color: "#1a7f37",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "5px 12px",
                      borderRadius: 980,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── WHAT'S IN THE REPORT ─────────── */}
      <section style={{ backgroundColor: "#f5f5f7", padding: "130px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0071e3",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            Report contents
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 700,
              color: "#1d1d1f",
              letterSpacing: "-0.038em",
              textAlign: "center",
              marginBottom: 18,
              lineHeight: 1.06,
            }}
          >
            Everything in your $99 report.
          </h2>
          <p
            style={{
              fontSize: 20,
              color: "#86868b",
              textAlign: "center",
              letterSpacing: "-0.01em",
              lineHeight: 1.55,
              maxWidth: 400,
              margin: "0 auto 72px",
            }}
          >
            20+ data points per property. No filler.
          </p>
          <div
            className="report-items-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {reportItems.map((item) => (
              <div
                key={item}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: "#e8f0fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width={13} height={10} viewBox="0 0 13 10" fill="none">
                    <path
                      d="M1 5L5 9L12 1"
                      stroke="#0071e3"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 15,
                    color: "#1d1d1f",
                    lineHeight: 1.4,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── BOTTOM CTA ─────────── */}
      <section
        style={{ backgroundColor: "#080c14", padding: "170px 24px", textAlign: "center" }}
      >
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#34c759",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 24,
            }}
          >
            Ready when you are
          </p>
          <h2
            style={{
              fontSize: "clamp(38px, 5.5vw, 70px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.04em",
              marginBottom: 22,
              lineHeight: 1.04,
            }}
          >
            Stop guessing.<br />Start knowing.
          </h2>
          <p
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 60,
              letterSpacing: "-0.01em",
              lineHeight: 1.65,
              maxWidth: 500,
              margin: "0 auto 60px",
            }}
          >
            Answer 5 questions and we'll do the rest. One flat fee, no subscription,
            no surprises.
          </p>
          <Link
            href="/wizard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: bottomCTAHovered ? "#0077ed" : "#0071e3",
              color: "#fff",
              fontSize: 20,
              fontWeight: 600,
              padding: "20px 48px",
              borderRadius: 980,
              textDecoration: "none",
              letterSpacing: "-0.025em",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              transform: bottomCTAHovered
                ? "scale(1.02) translateY(-2px)"
                : "scale(1)",
              boxShadow: bottomCTAHovered
                ? "0 12px 40px rgba(0,113,227,0.6)"
                : "0 4px 24px rgba(0,113,227,0.45)",
            }}
            onMouseOver={() => setBottomCTAHovered(true)}
            onMouseOut={() => setBottomCTAHovered(false)}
          >
            Get my property report — $99
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10h12M10.5 4.5L16 10l-5.5 5.5"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {["~10 minute delivery", "No subscription", "vs $15,000 buyers agent"].map(
              (text, i) => (
                <span key={text} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && (
                    <span
                      style={{
                        color: "rgba(255,255,255,0.15)",
                        margin: "0 16px",
                        fontSize: 16,
                      }}
                    >
                      ·
                    </span>
                  )}
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.32)" }}>
                    {text}
                  </span>
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer
        style={{
          borderTop: "0.5px solid rgba(255,255,255,0.06)",
          backgroundColor: "#080c14",
          padding: "60px 32px 44px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <img src="/logo-white.svg" alt="Yardscore" style={{ height: 26, width: "auto" }} />
          </div>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.28)",
              margin: "0 0 36px",
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}
          >
            AI-powered property research for Australian investors
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 36,
              marginBottom: 36,
            }}
          >
            {["Privacy Policy", "Terms of Service", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.28)",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.28)")
                }
              >
                {link}
              </a>
            ))}
          </div>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.18)",
              textAlign: "center",
              margin: 0,
            }}
          >
            © 2025 Yardscore. All rights reserved. Not financial advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
