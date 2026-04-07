import axios from "axios";
import { GeocodedProperty } from "@/types";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const SUBURB_POSTCODES: Record<string, string> = {
  "new farm": "4005",
  "paddington": "4064",
  "ascot": "4007",
  "newstead": "4006",
  "west end": "4101",
  "fortitude valley": "4006",
  "teneriffe": "4005",
  "bulimba": "4171",
  "surry hills": "2010",
  "newtown": "2042",
  "manly": "2095",
  "parramatta": "2150",
  "newcastle": "2300",
  "bondi": "2026",
  "glebe": "2037",
  "balmain": "2041",
  "pyrmont": "2009",
  "chippendale": "2008",
  "fitzroy": "3065",
  "richmond": "3121",
  "st kilda": "3182",
  "brunswick": "3056",
  "geelong": "3220",
  "collingwood": "3066",
  "prahran": "3181",
  "south yarra": "3141",
  "carlton": "3053",
  "footscray": "3011",
  "fremantle": "6160",
  "subiaco": "6008",
  "cottesloe": "6011",
  "northbridge": "6003",
  "leederville": "6007",
  "mount lawley": "6050",
  "unley": "5061",
  "norwood": "5067",
  "glenelg": "5045",
  "prospect": "5082",
  "bowden": "5007",
};

export async function geocodeAddress(address: string): Promise<GeocodedProperty> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

  const response = await axios.get(GEOCODE_URL, {
    params: { address, key: apiKey },
  });

  const { status, results } = response.data;

  if (status === "ZERO_RESULTS") {
    throw new Error(`Address could not be resolved: "${address}"`);
  }
  if (status !== "OK") {
    throw new Error(`Google Maps Geocoding API error: ${status}`);
  }

  const result = results[0];
  const components: { types: string[]; long_name: string; short_name: string }[] =
    result.address_components;

  const get = (type: string, field: "long_name" | "short_name" = "long_name") =>
    components.find((c) => c.types.includes(type))?.[field] ?? null;

  const suburb = get("locality") || get("sublocality") || get("neighborhood") || "";
  const state = get("administrative_area_level_1", "short_name") || "";
  let postcode = get("postal_code") || "";

  // Fallback 1: extract postcode from the address string using regex
  if (!postcode) {
    const postcodeMatch = address.match(/\b(\d{4})\b/);
    if (postcodeMatch) {
      postcode = postcodeMatch[1];
      console.log(`[geocode] Extracted postcode from address string: ${postcode}`);
    }
  }

  // Fallback 2: look up postcode from suburb name
  if (!postcode && suburb) {
    const suburbKey = suburb.toLowerCase().trim();
    if (SUBURB_POSTCODES[suburbKey]) {
      postcode = SUBURB_POSTCODES[suburbKey];
      console.log(`[geocode] Looked up postcode for ${suburb}: ${postcode}`);
    }
  }

  if (!postcode) {
    console.warn(`[geocode] Could not determine postcode for "${address}" — continuing with empty postcode`);
  }

  if (!suburb) {
    console.warn(`[geocode] Could not extract suburb from "${address}" — continuing`);
  }

  if (!state) {
    console.warn(`[geocode] Could not extract state from "${address}" — continuing`);
  }

  return {
    address: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    suburb,
    state,
    postcode,
  };
}

export function getPostcodeForSuburb(suburb: string): string | null {
  return SUBURB_POSTCODES[suburb.toLowerCase().trim()] ?? null;
}
