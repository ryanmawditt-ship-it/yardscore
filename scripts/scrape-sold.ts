/**
 * Standalone Playwright scraper — runs as a child process spawned by the
 * Next.js API route. This keeps Playwright entirely outside Next.js webpack.
 *
 * Usage: npx tsx scripts/scrape-sold.ts <suburb> <state> <postcode>
 * Output: JSON array written to stdout
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require("playwright-extra");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

chromium.use(StealthPlugin());

interface SoldListing {
  address: string;
  price: number;
  date: string;
  bedrooms: number | null;
}

async function run() {
  const [suburb, state, postcode] = process.argv.slice(2);

  if (!suburb || !state || !postcode) {
    process.stdout.write(JSON.stringify([]));
    process.exit(0);
  }

  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "+");
  const stateSlug = state.toLowerCase();
  const url = `https://www.realestate.com.au/sold/in-${suburbSlug}+${stateSlug}+${postcode}/list-1`;

  process.stderr.write(`[rea-stealth] Navigating to: ${url}\n`);

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: "en-AU",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // Step 1: Visit homepage first to establish session cookies / pass initial Kasada check
    process.stderr.write(`[rea-stealth] Visiting homepage to establish session...\n`);
    await page.goto("https://www.realestate.com.au/", { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(2000 + Math.floor(Math.random() * 1000));

    const homeTitle = await page.title();
    process.stderr.write(`[rea-stealth] Homepage title: "${homeTitle}"\n`);

    // Step 2: Navigate to target sold listings page
    process.stderr.write(`[rea-stealth] Navigating to sold listings: ${url}\n`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

    const delay = 2000 + Math.floor(Math.random() * 2000);
    process.stderr.write(`[rea-stealth] Waiting ${delay}ms...\n`);
    await page.waitForTimeout(delay);

    const title = await page.title();
    process.stderr.write(`[rea-stealth] Sold page title: "${title}"\n`);

    // If we're still on a Kasada challenge page, wait a bit more for it to resolve
    const bodyStart = await page.evaluate(() => document.body?.innerHTML?.slice(0, 200) ?? "");
    if (bodyStart.includes("KPSDK") || title === "") {
      process.stderr.write(`[rea-stealth] Kasada challenge detected — waiting 5s for resolution...\n`);
      await page.waitForTimeout(5000);
      await page.waitForLoadState("networkidle").catch(() => {});
      const titleAfter = await page.title();
      process.stderr.write(`[rea-stealth] Title after wait: "${titleAfter}"\n`);
    }

    const results: SoldListing[] = [];

    // Strategy 1: data-testid cards
    const cards = await page.$$("[data-testid='soldCard'], [data-testid='listing-card']");
    process.stderr.write(`[rea-stealth] data-testid cards: ${cards.length}\n`);

    if (cards.length > 0) {
      for (const card of cards.slice(0, 10)) {
        try {
          const address = await card
            .$eval(
              "[data-testid='residential-card__address-wrapper'], [data-testid='address'], [class*='address']",
              (el: Element) => el.textContent?.trim() ?? ""
            )
            .catch(() => "");

          const priceRaw = await card
            .$eval(
              "[data-testid='listing-card-price'], [data-testid='price'], [class*='price']",
              (el: Element) => el.textContent?.trim() ?? ""
            )
            .catch(() => "");
          const priceMatch = priceRaw.match(/\$\s*([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : null;

          const dateRaw = await card
            .$eval("time, [data-testid='sold-date'], [class*='date']", (el: Element) =>
              el.textContent?.trim() ?? ""
            )
            .catch(() => "");

          const bedsRaw = await card
            .$eval(
              "[data-testid='property-features-bedrooms'], [aria-label*='bed'], [class*='bed']",
              (el: Element) => el.textContent?.trim() ?? ""
            )
            .catch(() => "");
          const bedsMatch = bedsRaw.match(/\d+/);
          const bedrooms = bedsMatch ? parseInt(bedsMatch[0], 10) : null;

          if (address && price && price > 100_000) {
            results.push({ address, price, date: dateRaw, bedrooms });
          }
        } catch {
          // skip individual card errors
        }
      }
    }

    // Strategy 2: __NEXT_DATA__ from live (JS-rendered) DOM
    if (results.length === 0) {
      process.stderr.write(`[rea-stealth] Trying __NEXT_DATA__...\n`);
      try {
        const nextDataJson = await page.$eval(
          "script#__NEXT_DATA__",
          (el: Element) => el.textContent ?? ""
        );
        if (nextDataJson) {
          process.stderr.write(`[rea-stealth] __NEXT_DATA__ length: ${nextDataJson.length}\n`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nextData: any = JSON.parse(nextDataJson);
          const pageProps = nextData?.props?.pageProps ?? {};
          process.stderr.write(`[rea-stealth] pageProps keys: ${Object.keys(pageProps).join(", ")}\n`);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const listings: any[] =
            pageProps?.searchResults?.results?.exact?.items ??
            pageProps?.searchResults?.results?.items ??
            pageProps?.listings?.exact?.items ??
            pageProps?.listings?.items ??
            pageProps?.results?.items ??
            [];

          process.stderr.write(`[rea-stealth] __NEXT_DATA__ listings: ${listings.length}\n`);

          for (const item of listings.slice(0, 10)) {
            const listing = item?.listing ?? item;
            const address: string =
              listing?.address?.display?.fullAddress ??
              listing?.address?.display?.shortAddress ??
              [listing?.address?.streetAddress, listing?.address?.suburb, listing?.address?.state]
                .filter(Boolean)
                .join(", ");

            let price: number | null = null;
            if (typeof listing?.price?.value === "number") price = listing.price.value;
            else {
              const raw: string = listing?.price?.display ?? listing?.displayPrice ?? "";
              const m = raw.match(/\$\s*([\d,]+)/);
              if (m) price = parseInt(m[1].replace(/,/g, ""), 10);
            }

            const date: string = listing?.soldDate ?? listing?.dateSold ?? "";
            const bedrooms: number | null =
              typeof listing?.features?.general?.bedrooms === "number"
                ? listing.features.general.bedrooms
                : typeof listing?.bedrooms === "number"
                ? listing.bedrooms
                : null;

            if (address && price && price > 100_000) {
              results.push({ address, price, date, bedrooms });
            }
          }
        }
      } catch (err) {
        process.stderr.write(`[rea-stealth] __NEXT_DATA__ failed: ${err}\n`);
      }
    }

    // Strategy 3: generic selectors
    if (results.length === 0) {
      process.stderr.write(`[rea-stealth] Trying generic selectors...\n`);
      const genericCards = await page.$$(
        "article, [class*='ListingCard'], [class*='listing-card'], li[class*='residential']"
      );
      process.stderr.write(`[rea-stealth] Generic cards: ${genericCards.length}\n`);

      for (const card of genericCards.slice(0, 10)) {
        try {
          const address = await card
            .$eval("[class*='address'], [class*='Address'], h2, h3", (el: Element) =>
              el.textContent?.trim() ?? ""
            )
            .catch(() => "");
          const priceRaw = await card
            .$eval("[class*='price'], [class*='Price']", (el: Element) =>
              el.textContent?.trim() ?? ""
            )
            .catch(() => "");
          const priceMatch = priceRaw.match(/\$\s*([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : null;
          if (address && price && price > 100_000)
            results.push({ address, price, date: "", bedrooms: null });
        } catch { /* skip */ }
      }
    }

    process.stderr.write(`[rea-stealth] Final results: ${results.length}\n`);

    if (results.length === 0) {
      const snippet = await page.evaluate(() => document.body?.innerHTML?.slice(0, 1500) ?? "");
      process.stderr.write(`[rea-stealth] Body snippet:\n${snippet}\n`);
    }

    process.stdout.write(JSON.stringify(results));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[rea-stealth] Fatal error: ${message}\n`);
    process.stdout.write(JSON.stringify([]));
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

run();
