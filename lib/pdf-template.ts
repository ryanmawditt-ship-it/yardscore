import { FinalReport } from "@/types";

export interface WizardInputs {
  state?: string;
  budgetLabel?: string;
  maxBudget?: number;
  purpose?: string;
  propertyType?: string;
  bedrooms?: number;
}

function esc(s: string | undefined | null): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtPrice(n: number | null | undefined): string {
  if (!n) return "Est.";
  return "$" + n.toLocaleString();
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "Est.";
  return n.toFixed(2) + "%";
}

export function generatePDFHTML(reports: FinalReport[], wizardInputs: WizardInputs): string {
  const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const dateShort = new Date().toLocaleDateString("en-AU");
  const uniqueSuburbs = new Set(reports.map((r) => r.property?.suburb).filter(Boolean));

  const logoSvg = `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="white"/><line x1="11" y1="9" x2="20" y2="20" stroke="#0F1F3D" stroke-width="3" stroke-linecap="round"/><line x1="29" y1="9" x2="20" y2="20" stroke="#0F1F3D" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="20" x2="20" y2="31" stroke="#0F1F3D" stroke-width="3" stroke-linecap="round"/></svg>`;
  const logoSvgDark = `<svg width="28" height="28" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#0F1F3D"/><line x1="11" y1="9" x2="20" y2="20" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="29" y1="9" x2="20" y2="20" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="20" x2="20" y2="31" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>`;

  const propertyPages = reports
    .map((report, index) => {
      const p = report.property ?? { address: "", suburb: "", state: "", postcode: "" };
      const v = report.valuation as unknown as Record<string, unknown> | undefined;
      const y = report.yield as unknown as Record<string, unknown> | undefined;
      const r = report.risk as unknown as Record<string, unknown> | undefined;
      const infra = report.infrastructure as unknown as Record<string, unknown> | undefined;

      const signal = String(v?.signal ?? "hold").toLowerCase();
      const floodRisk = String(r?.floodRisk ?? "none");
      const bushfireRisk = String(r?.bushfireRisk ?? "none");
      const hasHeritage = Boolean(r?.hasHeritage);
      const hasEasement = Boolean(r?.hasEasement);
      const infraScore = Number(infra?.infrastructureScore ?? 0);
      const opportunitySummary = String(infra?.opportunitySummary ?? "Infrastructure data being compiled.");

      const rankLabel = index === 0 ? "TOP RECOMMENDATION" : index === 1 ? "SECOND RECOMMENDATION" : "RECOMMENDATION";
      const scoreColor = report.overallScore >= 7 ? "#4ade80" : report.overallScore >= 5 ? "#fbbf24" : "#f87171";

      const listingUrl = report.listingSearchUrl ??
        `https://www.realestate.com.au/buy/in-${p.suburb.toLowerCase().replace(/ /g, "-")},+${p.state.toLowerCase()}+${p.postcode}/list-1?propertyTypes=house&numBeds-min=${wizardInputs.bedrooms ?? 3}&price-max=${wizardInputs.maxBudget ?? 750000}`;

      return `
    <div class="page property-page">
      <div class="navy-header">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="flex:1;">
            <div style="font-family:system-ui;font-size:11px;color:#C9A84C;letter-spacing:0.15em;margin-bottom:12px;">#${index + 1} ${rankLabel}</div>
            <div style="font-family:system-ui;font-size:26px;font-weight:800;line-height:1.2;margin-bottom:16px;">${esc(p.address)}</div>
            <div style="font-family:system-ui;font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:20px;">${esc(p.suburb)}, ${esc(p.state)} ${esc(p.postcode)}</div>
            <span class="${signal}">${signal.toUpperCase()} SIGNAL</span>
          </div>
          <div style="text-align:center;min-width:120px;">
            <div style="font-family:system-ui;font-size:56px;font-weight:800;color:${scoreColor};">${report.overallScore ?? 0}</div>
            <div style="font-family:system-ui;font-size:13px;color:rgba(255,255,255,0.5);">out of 10</div>
          </div>
        </div>
      </div>

      ${report.suburbPhotoUrl ? `<div style="height:180px;overflow:hidden;margin-bottom:24px;border-radius:8px;"><img src="${report.suburbPhotoUrl}" style="width:100%;height:180px;object-fit:cover;"/></div>` : ""}

      <div style="font-family:system-ui;font-size:11px;letter-spacing:0.12em;color:#666;margin-bottom:12px;">RISK ASSESSMENT</div>
      <div class="risk-grid">
        <div class="risk-item ${floodRisk === "none" ? "risk-clear" : "risk-amber"}">
          <div style="font-family:system-ui;font-size:10px;color:#666;letter-spacing:0.1em;margin-bottom:4px;">FLOOD</div>
          <div style="font-family:system-ui;font-size:13px;font-weight:700;color:${floodRisk === "none" ? "#16a34a" : "#d97706"};">${floodRisk === "none" ? "Clear" : floodRisk}</div>
        </div>
        <div class="risk-item ${bushfireRisk === "none" ? "risk-clear" : "risk-amber"}">
          <div style="font-family:system-ui;font-size:10px;color:#666;letter-spacing:0.1em;margin-bottom:4px;">BUSHFIRE</div>
          <div style="font-family:system-ui;font-size:13px;font-weight:700;color:${bushfireRisk === "none" ? "#16a34a" : "#d97706"};">${bushfireRisk === "none" ? "Clear" : bushfireRisk}</div>
        </div>
        <div class="risk-item ${!hasHeritage ? "risk-clear" : "risk-amber"}">
          <div style="font-family:system-ui;font-size:10px;color:#666;letter-spacing:0.1em;margin-bottom:4px;">HERITAGE</div>
          <div style="font-family:system-ui;font-size:13px;font-weight:700;color:${!hasHeritage ? "#16a34a" : "#d97706"};">${hasHeritage ? "Listed" : "Clear"}</div>
        </div>
        <div class="risk-item ${!hasEasement ? "risk-clear" : "risk-amber"}">
          <div style="font-family:system-ui;font-size:10px;color:#666;letter-spacing:0.1em;margin-bottom:4px;">EASEMENT</div>
          <div style="font-family:system-ui;font-size:13px;font-weight:700;color:${!hasEasement ? "#16a34a" : "#d97706"};">${hasEasement ? "Present" : "Clear"}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0;">
        <div>
          <div style="font-family:system-ui;font-size:11px;letter-spacing:0.12em;color:#666;margin-bottom:12px;">VALUATION</div>
          <table class="metrics-table">
            <tr><td style="color:#666;">Fair value (low)</td><td>${fmtPrice(v?.fairValueLow as number)}</td></tr>
            <tr><td style="color:#666;">Fair value (mid)</td><td style="color:#0F1F3D;font-size:15px;">${fmtPrice(v?.fairValueMid as number)}</td></tr>
            <tr><td style="color:#666;">Fair value (high)</td><td>${fmtPrice(v?.fairValueHigh as number)}</td></tr>
          </table>
        </div>
        <div>
          <div style="font-family:system-ui;font-size:11px;letter-spacing:0.12em;color:#666;margin-bottom:12px;">RENTAL INCOME</div>
          <table class="metrics-table">
            <tr><td style="color:#666;">Weekly rent est.</td><td>${y?.estimatedWeeklyRent ? "$" + y.estimatedWeeklyRent + " pw" : "Est."}</td></tr>
            <tr><td style="color:#666;">Gross yield</td><td style="color:#16a34a;">${fmtPct(y?.grossYieldPct as number)}</td></tr>
            <tr><td style="color:#666;">Net yield</td><td>${fmtPct(y?.netYieldPct as number)}</td></tr>
            <tr><td style="color:#666;">Vacancy rate</td><td>${y?.vacancyRatePct ? y.vacancyRatePct + "%" : "Est."}</td></tr>
            <tr><td style="color:#666;">Weekly cashflow</td><td style="color:${Number(y?.cashflowWeekly ?? 0) >= 0 ? "#16a34a" : "#dc2626"};">$${Math.abs(Number(y?.cashflowWeekly ?? 0))} ${Number(y?.cashflowWeekly ?? 0) >= 0 ? "positive" : "negative"} pw</td></tr>
          </table>
        </div>
      </div>

      <div class="infra-box">
        <div style="font-family:system-ui;font-size:11px;letter-spacing:0.12em;color:#0F1F3D;margin-bottom:8px;font-weight:700;">INFRASTRUCTURE PIPELINE · Score: ${infraScore}/10</div>
        <div style="font-size:13px;line-height:1.8;color:#444;">${esc(opportunitySummary)}</div>
      </div>

      <div class="thesis-box">
        <div style="font-family:system-ui;font-size:10px;letter-spacing:0.15em;color:#C9A84C;margin-bottom:12px;font-style:normal;font-weight:700;">INVESTMENT THESIS</div>
        ${esc(report.executiveSummary || String(v?.investmentThesis ?? "Investment analysis pending."))}
      </div>

      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-family:system-ui;font-size:12px;color:#666;margin-bottom:8px;">Find current listings matching this profile</div>
        <div style="font-family:system-ui;font-size:13px;color:#0F1F3D;font-weight:600;">realestate.com.au · ${esc(p.suburb)} · ${esc(p.state)} · Houses · ${wizardInputs.bedrooms ?? 3}+ bed · Under ${fmtPrice(wizardInputs.maxBudget)}</div>
        <div style="font-family:system-ui;font-size:11px;color:#888;margin-top:8px;">${esc(listingUrl)}</div>
      </div>
    </div>`;
    })
    .join("");

  const summaryRows = reports
    .map(
      (r, i) => `
      <tr>
        <td style="font-weight:700;color:#0F1F3D;">#${i + 1}</td>
        <td style="font-size:12px;">${esc(r.property?.address?.split(",")[0])}</td>
        <td>${esc(r.property?.suburb)}</td>
        <td style="font-weight:700;color:${r.overallScore >= 7 ? "#16a34a" : r.overallScore >= 5 ? "#d97706" : "#dc2626"};">${r.overallScore}/10</td>
        <td><span class="${String((r.valuation as unknown as Record<string, unknown>)?.signal ?? "hold").toLowerCase()}">${String((r.valuation as unknown as Record<string, unknown>)?.signal ?? "HOLD").toUpperCase()}</span></td>
        <td>${(r.yield as unknown as Record<string, unknown>)?.grossYieldPct ? Number((r.yield as unknown as Record<string, unknown>).grossYieldPct).toFixed(2) + "%" : "Est."}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; color: #1a1a2e; }
    .page { width: 794px; min-height: 1123px; padding: 0; page-break-after: always; }
    .cover { background: #0F1F3D; color: white; padding: 60px; min-height: 1123px; display: flex; flex-direction: column; }
    .property-page { padding: 40px; }
    .navy-header { background: #0F1F3D; color: white; padding: 40px; margin: -40px -40px 32px; }
    .gold { color: #C9A84C; }
    .risk-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
    .risk-item { padding: 12px; border-radius: 8px; text-align: center; }
    .risk-clear { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .risk-amber { background: #fefce8; border: 1px solid #fde68a; }
    .risk-red { background: #fef2f2; border: 1px solid #fecaca; }
    .metrics-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .metrics-table tr { border-bottom: 1px solid #e5e7eb; }
    .metrics-table td { padding: 10px 0; font-size: 13px; }
    .metrics-table td:last-child { text-align: right; font-weight: 600; }
    .infra-box { background: #f8fafc; border-left: 4px solid #0F1F3D; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .thesis-box { border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px; margin: 24px 0; font-style: italic; line-height: 1.8; font-size: 13px; }
    .buy { background: #16a34a; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
    .hold { background: #d97706; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
    .avoid { background: #dc2626; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
    .summary-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .summary-table th { background: #0F1F3D; color: white; padding: 12px; text-align: left; font-size: 12px; }
    .summary-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .summary-table tr:nth-child(even) { background: #f9fafb; }
    @media print { .page { page-break-after: always; } }
  </style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page cover">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:80px;">
    ${logoSvg}
    <span style="font-family:system-ui;font-size:20px;font-weight:700;">Yardscore</span>
  </div>
  <div style="flex:1;">
    <div style="font-family:system-ui;font-size:11px;letter-spacing:0.2em;color:#C9A84C;margin-bottom:20px;">INVESTMENT RESEARCH REPORT</div>
    <div style="font-family:system-ui;font-size:42px;font-weight:800;line-height:1.1;margin-bottom:16px;">${esc(wizardInputs.state || "Australian")}<br>Property Investment<br>Analysis</div>
    <div style="font-family:system-ui;font-size:16px;color:rgba(255,255,255,0.6);margin-bottom:48px;">Budget ${esc(wizardInputs.budgetLabel)} &middot; ${esc(wizardInputs.purpose || "Investment")} &middot; ${esc(wizardInputs.propertyType || "House")} &middot; ${wizardInputs.bedrooms ?? 3} Bedrooms</div>
    <div style="border-top:1px solid #C9A84C;padding-top:8px;"></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px;border-top:1px solid rgba(255,255,255,0.2);padding-top:32px;">
    <div><div style="font-family:system-ui;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;margin-bottom:6px;">PREPARED FOR</div><div style="font-family:system-ui;font-size:15px;">Yardscore Client</div></div>
    <div><div style="font-family:system-ui;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;margin-bottom:6px;">DATE</div><div style="font-family:system-ui;font-size:15px;">${date}</div></div>
    <div><div style="font-family:system-ui;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;margin-bottom:6px;">PROPERTIES ANALYSED</div><div style="font-family:system-ui;font-size:15px;">${reports.length} properties &middot; ${uniqueSuburbs.size} suburbs</div></div>
  </div>
</div>

<!-- EXECUTIVE SUMMARY PAGE -->
<div class="page" style="padding:60px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:48px;">
    <div style="display:flex;align-items:center;gap:10px;">${logoSvgDark}<span style="font-family:system-ui;font-size:16px;font-weight:700;">Yardscore</span></div>
    <div style="font-family:system-ui;font-size:13px;color:#888;">${dateShort}</div>
  </div>
  <div style="border-left:4px solid #C9A84C;padding-left:24px;margin-bottom:40px;">
    <div style="font-family:system-ui;font-size:11px;letter-spacing:0.15em;color:#C9A84C;margin-bottom:8px;">EXECUTIVE SUMMARY</div>
    <div style="font-family:system-ui;font-size:28px;font-weight:700;margin-bottom:16px;">AI-Selected Investment Opportunities</div>
    <div style="font-size:14px;line-height:1.8;color:#444;">Based on your criteria, Yardscore has identified ${reports.length} investment opportunities across ${uniqueSuburbs.size} suburbs in ${esc(wizardInputs.state || "Australia")}.</div>
  </div>
  <table class="summary-table">
    <thead><tr><th>Rank</th><th>Property</th><th>Suburb</th><th>Score</th><th>Signal</th><th>Gross Yield</th></tr></thead>
    <tbody>${summaryRows}</tbody>
  </table>
</div>

<!-- PROPERTY PAGES -->
${propertyPages}

<!-- DISCLAIMER PAGE -->
<div class="page" style="padding:60px;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:48px;">${logoSvgDark}<span style="font-family:system-ui;font-size:16px;font-weight:700;">Yardscore</span></div>
  <div style="border-left:4px solid #C9A84C;padding-left:24px;margin-bottom:40px;"><div style="font-family:system-ui;font-size:24px;font-weight:700;">Methodology &amp; Disclaimer</div></div>
  <div style="font-size:13px;line-height:1.9;color:#444;margin-bottom:32px;">
    <p style="margin-bottom:16px;"><strong style="font-family:system-ui;">How Yardscore Works</strong><br>Yardscore uses artificial intelligence to analyse Australian residential properties across 20+ data points. Our system queries multiple data sources including government spatial data portals, public property databases, demographic data from the Australian Bureau of Statistics, and infrastructure pipeline announcements from state and federal governments.</p>
    <p style="margin-bottom:16px;"><strong style="font-family:system-ui;">Data Sources</strong><br>Risk overlays (flood, bushfire, zoning) sourced from Queensland Globe and equivalent state portals. Demographic data from ABS Census. Rental yield estimates based on suburb-level market data and comparable property analysis. Infrastructure data from state government project portals and public announcements. Property addresses are representative examples.</p>
    <p style="margin-bottom:16px;"><strong style="font-family:system-ui;">Important Limitations</strong><br>Property addresses generated by Yardscore are indicative examples based on suburb analysis. They may not represent currently listed properties. Always verify property availability, exact pricing and current listing status on realestate.com.au or domain.com.au before making any investment decision.</p>
    <p style="margin-bottom:16px;"><strong style="font-family:system-ui;">Financial Advice Disclaimer</strong><br>This report is for research and information purposes only. It does not constitute financial, investment, legal or taxation advice. Past performance is not indicative of future results. Property investment involves risk including possible loss of capital. You should seek independent financial advice from a qualified advisor before making any investment decision.</p>
  </div>
  <div style="background:#0F1F3D;color:white;padding:24px;border-radius:8px;text-align:center;">
    <div style="font-family:system-ui;font-size:13px;color:rgba(255,255,255,0.6);">&copy; ${new Date().getFullYear()} Yardscore</div>
    <div style="font-family:system-ui;font-size:11px;color:rgba(255,255,255,0.4);margin-top:8px;">AI-powered property investment research for Australian investors</div>
  </div>
</div>

</body>
</html>`;
}
