"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const sf = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

const MESSAGES = [
  "Finding properties that match your criteria…",
  "Running flood and risk overlay checks…",
  "Analysing comparable sales…",
  "Calculating rental yields and cashflow…",
  "Ranking top properties…",
  "Generating your report…",
];

const MESSAGE_DURATION = 8000;
const TOTAL_DURATION = 10 * 60 * 1000;

function CircleProgress({ progress }: { progress: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={128} height={128} viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={64} cy={64} r={r} fill="none" stroke="#f5f5f7" strokeWidth={6} />
      <circle
        cx={64} cy={64} r={r}
        fill="none"
        stroke="#0071e3"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

export default function LoadingReportPage() {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(95, (elapsed / TOTAL_DURATION) * 100));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 400);
    }, MESSAGE_DURATION);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const raw = typeof window !== "undefined" ? localStorage.getItem("ys_wizard") : null;
    let suburb = "New Farm, QLD";
    if (raw) {
      try {
        const answers = JSON.parse(raw);
        if (answers.location?.trim()) {
          const state = answers.targetState || "QLD";
          suburb = answers.location.split(",")[0].trim() + ", " + state;
        }
      } catch { /* ignore */ }
    }

    fetch("/api/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: suburb }),
    })
      .then((r) => r.json())
      .then((report) => {
        localStorage.setItem("ys_report", JSON.stringify(report));
        setProgress(100);
        setDone(true);
        setTimeout(() => router.push("/report"), 800);
      })
      .catch(() => {
        setProgress(100);
        setDone(true);
        setTimeout(() => router.push("/report"), 800);
      });
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        ...sf,
      }}
    >
      {/* Logo */}
      <p style={{ fontSize: 19, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em', marginBottom: 64 }}>
        Yardscore
      </p>

      {/* Ring + percentage */}
      <div style={{ position: 'relative', marginBottom: 48 }}>
        <CircleProgress progress={progress} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status message with fade */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 48 }}>
        <p
          style={{
            fontSize: 19,
            color: '#86868b',
            letterSpacing: '-0.01em',
            textAlign: 'center',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease',
            margin: 0,
          }}
        >
          {done ? "Report ready. Opening…" : MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Step list */}
      <div style={{ width: '100%', maxWidth: 420 }}>
        {MESSAGES.map((msg, i) => (
          <div
            key={msg}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              opacity: i > messageIndex && !done ? 0.3 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              flexShrink: 0,
              backgroundColor: (i < messageIndex || done) ? '#34c759' : i === messageIndex ? '#0071e3' : '#d2d2d7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.3s ease',
            }}>
              {(i < messageIndex || done) && (
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                  <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{
              fontSize: 15,
              color: i === messageIndex && !done ? '#1d1d1f' : '#86868b',
              letterSpacing: '-0.01em',
              textDecoration: (i < messageIndex || done) ? 'line-through' : 'none',
            }}>
              {msg}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: '#86868b', marginTop: 56, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
        We're running 20+ checks across flood risk, comparable sales, rental yields, infrastructure and valuations.
      </p>
    </div>
  );
}
