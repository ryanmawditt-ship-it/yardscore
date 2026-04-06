import axios from "axios";
import { readFileSync } from "fs";
import { join } from "path";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1500;
const API_URL = "https://api.anthropic.com/v1/messages";

/**
 * Reads ANTHROPIC_API_KEY directly from .env.local at call time.
 * This bypasses Next.js's env loading, which has been observed to cache
 * a stale or incorrect value for process.env.ANTHROPIC_API_KEY.
 */
function getApiKey(): string {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match?.[1]) {
      const key = match[1].trim();
      console.log("[claude] Key loaded from .env.local — tail:", key.slice(-10), "len:", key.length);
      return key;
    }
  } catch (e) {
    console.warn("[claude] Could not read .env.local, falling back to process.env");
  }
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  console.log("[claude] Key from process.env — tail:", key.slice(-10), "len:", key.length);
  return key;
}

/**
 * Calls the Anthropic Messages API directly via axios.
 * Used by all five analysis agents (property, risk, infrastructure, yield, valuation).
 */
export async function askClaude(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const apiKey = getApiKey();

  const response = await axios.post(
    API_URL,
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    },
    {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      timeout: 60_000,
    }
  );

  const block = response.data.content?.[0];
  if (!block || block.type !== "text") {
    throw new Error(`Unexpected Anthropic response: ${JSON.stringify(response.data)}`);
  }

  const text: string = block.text;
  const cleaned = text
    .replace(/^```json\n?/, "")
    .replace(/^```\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  return cleaned;
}
