"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const sf = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

// Pipeline steps with target progress %, duration weight, and status message
const STEPS = [
  { target: 5,   label: "Selecting the best suburbs for your criteria...",          duration: 3000  },
  { target: 15,  label: "Searching for properties across Homely, Domain and more...", duration: 18000 },
  { target: 25,  label: "Running flood, zoning and yield checks...",                 duration: 12000 },
  { target: 40,  label: "Analysing comparable sales and market data...",             duration: 30000 },
  { target: 55,  label: "Calculating rental yields and cashflow...",                 duration: 25000 },
  { target: 65,  label: "Scoring infrastructure and growth potential...",             duration: 15000 },
  { target: 75,  label: "Running valuations...",                                     duration: 15000 },
  { target: 85,  label: "Ranking properties by your investment goals...",            duration: 10000 },
  { target: 93,  label: "Writing your investment recommendations...",                duration: 12000 },
  { target: 99,  label: "Finalising your report...",                                 duration: 60000 },
];

function CircleProgress({ progress }: { progress: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={128} height={128} viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={64} cy={64} r={r} fill="none" stroke="#f5f5f7" strokeWidth={6} />
      <circle
        cx={64} cy={64} r={r}
        fill="none" stroke="#0071e3" strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

export default function LoadingReportPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [apiComplete, setApiComplete] = useState(false);
  const hasFetched = useRef(false);
  const startTime = useRef(Date.now());

  // Smart progress simulator — advances through steps based on elapsed time
  // but NEVER reaches 100% until API responds
  useEffect(() => {
    if (done) return;

    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      let cumulativeDuration = 0;
      let currentStep = 0;
      let currentProgress = 0;

      for (let i = 0; i < STEPS.length; i++) {
        const stepStart = cumulativeDuration;
        const stepEnd = cumulativeDuration + STEPS[i].duration;

        if (elapsed < stepEnd) {
          currentStep = i;
          const stepProgress = (elapsed - stepStart) / STEPS[i].duration;
          const prevTarget = i > 0 ? STEPS[i - 1].target : 0;
          currentProgress = prevTarget + stepProgress * (STEPS[i].target - prevTarget);
          break;
        }
        cumulativeDuration = stepEnd;
        currentProgress = STEPS[i].target;
        currentStep = i;
      }

      // Cap at 99% — only API completion pushes to 100
      const cappedProgress = Math.min(currentProgress, apiComplete ? 100 : 99);

      setProgress((prev) => Math.max(prev, cappedProgress)); // never go backwards
      setStepIndex(currentStep);
    };

    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [done, apiComplete]);

  // When API completes, jump to 100%
  useEffect(() => {
    if (apiComplete && !done) {
      setProgress(100);
      setStepIndex(STEPS.length - 1);
      setDone(true);
      setTimeout(() => router.push("/report"), 900);
    }
  }, [apiComplete, done, router]);

  // Fire the API call once
  const handleApiResponse = useCallback((data: unknown) => {
    console.log("[loading-report] API response received");
    localStorage.setItem("ys_report", JSON.stringify(data));
    setApiComplete(true);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const raw = typeof window !== "undefined" ? localStorage.getItem("ys_wizard") : null;
    let requestBody: Record<string, string> = { address: "New Farm, QLD, Australia" };

    if (raw) {
      try {
        const answers = JSON.parse(raw);
        if (answers.targetState) {
          requestBody = {
            state: answers.targetState,
            budget: answers.budget || "",
            purpose: answers.purpose || "",
            propertyType: answers.propertyType || "",
            bedrooms: answers.minBedrooms || "",
            yieldTarget: answers.minYield || "",
            goal: answers.goal || "",
          };
        } else if (answers.location?.trim()) {
          const state = answers.targetState || "QLD";
          requestBody = { address: `${answers.location.split(",")[0].trim()}, ${state}, Australia` };
        }
      } catch { /* ignore */ }
    }

    console.log("[loading-report] Sending to analyse:", requestBody);

    fetch("/api/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then((r) => r.json())
      .then(handleApiResponse)
      .catch(() => {
        // Still navigate to report — it will show the error
        localStorage.setItem("ys_report", JSON.stringify({ error: "Report generation failed. Please try again." }));
        setApiComplete(true);
      });
  }, [router, handleApiResponse]);

  const currentLabel = done
    ? "Report ready. Opening..."
    : STEPS[stepIndex]?.label ?? "Processing...";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        ...sf,
      }}
    >
      {/* Logo */}
      <img src="/logo.svg" alt="Yardscore" style={{ height: 32, width: "auto", marginBottom: 64 }} />

      {/* Ring + percentage */}
      <div style={{ position: "relative", marginBottom: 48 }}>
        <CircleProgress progress={progress} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Current status message */}
      <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
        <p
          style={{
            fontSize: 19,
            color: done ? "#34c759" : "#86868b",
            letterSpacing: "-0.01em",
            textAlign: "center",
            margin: 0,
            fontWeight: done ? 600 : 400,
            transition: "color 0.3s, font-weight 0.3s",
          }}
        >
          {currentLabel}
        </p>
      </div>

      {/* Step list */}
      <div style={{ width: "100%", maxWidth: 440 }}>
        {STEPS.map((step, i) => {
          const isComplete = progress >= step.target;
          const isCurrent = i === stepIndex && !done;
          const isFuture = !isComplete && !isCurrent;

          return (
            <div
              key={step.target}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 0",
                opacity: isFuture ? 0.3 : 1,
                transition: "opacity 0.4s ease",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: isComplete ? "#34c759" : isCurrent ? "#0071e3" : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.4s ease",
                }}
              >
                {isComplete && (
                  <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                    <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isCurrent && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#fff" }} />
                )}
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: isCurrent ? "#1d1d1f" : isComplete ? "#86868b" : "#c0c4cc",
                  letterSpacing: "-0.01em",
                  fontWeight: isCurrent ? 600 : 400,
                  transition: "color 0.3s, font-weight 0.3s",
                }}
              >
                {step.label.replace("...", "")}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 13, color: "#86868b", marginTop: 56, textAlign: "center", maxWidth: 380, lineHeight: 1.6 }}>
        We're running 20+ checks across flood risk, comparable sales, rental yields, infrastructure and valuations. This typically takes 2-5 minutes.
      </p>
    </div>
  );
}
