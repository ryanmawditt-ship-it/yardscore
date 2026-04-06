import { NextRequest, NextResponse } from "next/server";
import { generatePDFHTML, WizardInputs } from "@/lib/pdf-template";
import { FinalReport } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { reports, wizardInputs } = (await request.json()) as {
      reports: FinalReport[];
      wizardInputs: WizardInputs;
    };

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return NextResponse.json({ error: "No reports provided" }, { status: 400 });
    }

    const html = generatePDFHTML(reports, wizardInputs || {});

    // Return the HTML directly — PDF rendering can be done client-side
    // or via a headless browser on the server
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-pdf] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
