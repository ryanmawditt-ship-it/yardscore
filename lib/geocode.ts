import axios from "axios";
import { GeocodedProperty } from "@/types";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

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

  const suburb = get("locality");
  const state = get("administrative_area_level_1", "short_name");
  const postcode = get("postal_code");

  if (!suburb) throw new Error(`Could not extract suburb from address: "${address}"`);
  if (!state) throw new Error(`Could not extract state from address: "${address}"`);
  if (!postcode) throw new Error(`Could not extract postcode from address: "${address}"`);

  return {
    address: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    suburb,
    state,
    postcode,
  };
}
