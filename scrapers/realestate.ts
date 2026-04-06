import { execFile } from "child_process";
import { join } from "path";

export interface SoldListing {
  address: string;
  price: number;
  date: string;
  bedrooms: number | null;
}

/**
 * Attempts to scrape realestate.com.au sold listings via a Playwright stealth
 * child process. realestate.com.au uses Kasada bot protection that fingerprints
 * at the TLS/network layer — this will return an empty array in most environments.
 * The calling agent (step4-property) falls back to AI-estimated comparables.
 *
 * Returns up to 10 results. Never throws — returns empty array on any failure.
 */
export async function getSoldListings(
  suburb: string,
  state: string,
  postcode: string
): Promise<SoldListing[]> {
  return new Promise((resolve) => {
    const scriptPath = join(process.cwd(), "scripts", "scrape-sold.ts");
    const tsxPath = join(process.cwd(), "node_modules", ".bin", "tsx");

    console.log(`[rea-stealth] Spawning child process for ${suburb} ${state} ${postcode}`);

    const child = execFile(
      tsxPath,
      [scriptPath, suburb, state, postcode],
      {
        timeout: 90_000,
        maxBuffer: 1024 * 1024 * 5,
        env: { ...process.env, PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin" },
      },
      (error, stdout, stderr) => {
        if (stderr) {
          stderr.split("\n").filter(Boolean).forEach((line) => console.log(line));
        }
        if (error) {
          console.error(`[rea-stealth] Child process error: ${error.message}`);
          resolve([]);
          return;
        }
        try {
          const results = JSON.parse(stdout.trim()) as SoldListing[];
          console.log(`[rea-stealth] Child process returned ${results.length} listings`);
          resolve(results);
        } catch {
          resolve([]);
        }
      }
    );

    child.on("error", (err) => {
      console.error(`[rea-stealth] Failed to spawn child: ${err.message}`);
      resolve([]);
    });
  });
}
