const API_URL = "http://localhost:3000/api/analyse";

const TEST_ADDRESSES = [
  "42 Crown St, Surry Hills NSW 2010",
  "15 George St, Fitzroy VIC 3065",
  "8 Moray St, New Farm QLD 4005",
];

async function testAddress(address: string): Promise<boolean> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${address}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
      signal: AbortSignal.timeout(300000),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`FAIL (${response.status}):`, data);
      return false;
    }

    // Validate FinalReport structure
    const requiredKeys = [
      "property",
      "analysis",
      "risk",
      "infrastructure",
      "yield",
      "valuation",
      "overallScore",
      "executiveSummary",
      "generatedAt",
    ];

    const missingKeys = requiredKeys.filter((k) => !(k in data));
    if (missingKeys.length > 0) {
      console.error(`FAIL: Missing keys in FinalReport: ${missingKeys.join(", ")}`);
      return false;
    }

    if (typeof data.overallScore !== "number" || data.overallScore < 0 || data.overallScore > 10) {
      console.error(`FAIL: overallScore is invalid: ${data.overallScore}`);
      return false;
    }

    if (typeof data.executiveSummary !== "string" || data.executiveSummary.length < 10) {
      console.error(`FAIL: executiveSummary is missing or too short`);
      return false;
    }

    console.log(`PASS: ${address}`);
    console.log(`  Score: ${data.overallScore}/10`);
    console.log(`  State: ${data.property.state}`);
    console.log(`  Suburb: ${data.property.suburb}`);
    console.log(`  Summary: ${data.executiveSummary.substring(0, 120)}...`);
    return true;
  } catch (error) {
    console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function main() {
  console.log(`\nYardscore Australia-wide Pipeline Test`);
  console.log(`API: ${API_URL}`);
  console.log(`Addresses: ${TEST_ADDRESSES.length}\n`);

  const results: boolean[] = [];

  for (const address of TEST_ADDRESSES) {
    const passed = await testAddress(address);
    results.push(passed);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results: ${results.filter(Boolean).length}/${results.length} passed`);
  console.log(`${"=".repeat(60)}\n`);

  if (results.some((r) => !r)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
