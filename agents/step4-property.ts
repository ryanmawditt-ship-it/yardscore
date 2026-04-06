import { GeocodedProperty, PropertyAnalysis } from "@/types";
import { scrapePropertyDetails } from "@/scrapers/onthehouse";
import { getSoldListings } from "@/scrapers/realestate";
import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT_WITH_SCRAPED =
  "You are a property data analyst. You will be given raw scraped property data including comparable recent sales. " +
  "Return ONLY a valid JSON object matching this TypeScript type: PropertyAnalysis. " +
  "Calculate medianPricePerSqm from the comparables where land size is available. " +
  "Write a 2 sentence trendSummary describing price movement based on the comparable sales data. " +
  "No markdown, no explanation, just the JSON object.";

const SYSTEM_PROMPT_ESTIMATE =
  "You are a property data analyst with deep knowledge of the Australian property market. " +
  "Comparable sales data could not be scraped from web sources for this property. " +
  "Use your knowledge of this suburb's property market to: " +
  "1. Generate 5 realistic comparable recent sales for similar properties in this suburb (mark each with source: 'estimated'). " +
  "2. Calculate medianPricePerSqm from those estimated comparables. " +
  "3. Write a 2 sentence trendSummary based on your knowledge of this suburb's price trends. " +
  "Be realistic — use your knowledge of actual median prices in this suburb. " +
  "IMPORTANT: If property details are unavailable from scraping, you MUST estimate realistic values. " +
  "For bedrooms, bathrooms, landSize, yearBuilt — never return null. Estimate based on the suburb and property type. " +
  "A typical 3 bedroom house: bedrooms 3, bathrooms 1-2, landSize 400-600sqm, yearBuilt estimated from suburb age. " +
  "Always return numbers for these fields, not null. " +
  "Return ONLY a valid JSON object matching the PropertyAnalysis TypeScript type. " +
  "No markdown, no explanation, just the JSON object.";

export async function analyseProperty(property: GeocodedProperty): Promise<PropertyAnalysis> {
  // Fetch property details and comparable sales in parallel
  const [raw, scrapedComparables] = await Promise.all([
    scrapePropertyDetails(property.address),
    getSoldListings(property.suburb, property.state, property.postcode),
  ]);

  const hasScrapedComparables = scrapedComparables.length > 0;
  console.log(`[step4] OnTheHouse scraped fields: ${Object.keys(raw).join(", ")}`);
  console.log(`[step4] realestate.com.au sold listings scraped: ${scrapedComparables.length}`);

  const systemPrompt = hasScrapedComparables
    ? SYSTEM_PROMPT_WITH_SCRAPED
    : SYSTEM_PROMPT_ESTIMATE;

  const userContent = JSON.stringify(
    {
      address: property.address,
      suburb: property.suburb,
      state: property.state,
      postcode: property.postcode,
      propertyType: "house",
      scrapedPropertyDetails: raw,
      scrapedComparableSales: scrapedComparables,
      note: hasScrapedComparables
        ? "Use the scraped comparable sales above."
        : "No comparable sales could be scraped. Estimate 5 realistic comparables from your knowledge of this suburb.",
    },
    null,
    2
  );

  const response = await askClaude(systemPrompt, userContent);

  return JSON.parse(response) as PropertyAnalysis;
}
