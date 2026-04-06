import axios from "axios";

const BASE = "https://spatial-gis.information.qld.gov.au/arcgis/rest/services";

// ArcGIS REST layer endpoints
const LAYERS = {
  flood:
    `${BASE}/Flooding/FloodRiskManagement/MapServer/0`,
  bushfire:
    `${BASE}/NaturalHazards/BushfireManagement/MapServer/0`,
  zoning:
    `${BASE}/PlanningCadastre/LocalGovernmentZoning/MapServer/0`,
  heritage:
    `${BASE}/NationalParks/QueenslandHeritage/MapServer/0`,
  easements:
    `${BASE}/PlanningCadastre/LandParcelPropertyFramework/MapServer/4`,
};

interface OverlayResult {
  floodRisk: string;
  bushfireRisk: string;
  zoningCode: string;
  hasHeritage: boolean;
  hasEasement: boolean;
}

const SAFE_DEFAULTS: OverlayResult = {
  floodRisk: "none",
  bushfireRisk: "none",
  zoningCode: "unknown",
  hasHeritage: false,
  hasEasement: false,
};

/**
 * Builds the ArcGIS REST query params for a point intersection query.
 */
function pointQueryParams(lat: number, lng: number, outFields: string) {
  return {
    geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
    inSR: 4326,
    outFields,
    returnGeometry: false,
    tolerance: 10,
    f: "json",
  };
}

/**
 * Queries a single ArcGIS layer and returns the first feature's attributes,
 * or null if no features intersect the point.
 */
async function queryLayer(
  url: string,
  lat: number,
  lng: number,
  outFields = "*"
): Promise<Record<string, unknown> | null> {
  const response = await axios.get(`${url}/query`, {
    params: pointQueryParams(lat, lng, outFields),
    timeout: 10_000,
  });

  const features: { attributes: Record<string, unknown> }[] = response.data?.features ?? [];
  return features.length > 0 ? features[0].attributes : null;
}

/**
 * Maps a raw flood category field value to a normalised risk level.
 */
function parseFloodRisk(attrs: Record<string, unknown> | null): string {
  if (!attrs) return "none";

  // Common field names used across QLD flood layers
  const raw =
    attrs["DFE_CATEGORY"] ??
    attrs["FLOOD_CLASS"] ??
    attrs["FLOOD_CATEGORY"] ??
    attrs["CATEGORY"] ??
    "";

  const val = String(raw).toLowerCase();
  if (val.includes("high")) return "high";
  if (val.includes("medium") || val.includes("med")) return "medium";
  if (val.includes("low")) return "low";
  if (val === "" || val === "null" || val === "none") return "none";
  // Feature exists but category is unknown — treat as low
  return "low";
}

/**
 * Maps a raw bushfire management zone to a normalised risk level.
 */
function parseBushfireRisk(attrs: Record<string, unknown> | null): string {
  if (!attrs) return "none";

  const raw =
    attrs["BMZ_CATEGORY"] ??
    attrs["BUSHFIRE_CATEGORY"] ??
    attrs["ZONE"] ??
    attrs["CATEGORY"] ??
    "";

  const val = String(raw).toLowerCase();
  if (val.includes("high")) return "high";
  if (val.includes("medium") || val.includes("mod")) return "medium";
  if (val.includes("low")) return "low";
  if (val === "" || val === "null" || val === "none") return "none";
  return "low";
}

/**
 * Queries Queensland Globe overlays for a given lat/lng point and returns
 * structured risk and zoning data. Individual layer failures return safe defaults.
 */
export async function getOverlays(
  lat: number,
  lng: number
): Promise<OverlayResult> {
  const [floodAttrs, bushfireAttrs, zoningAttrs, heritageAttrs, easementAttrs] =
    await Promise.all([
      queryLayer(LAYERS.flood, lat, lng).catch(() => null),
      queryLayer(LAYERS.bushfire, lat, lng).catch(() => null),
      queryLayer(LAYERS.zoning, lat, lng, "ZONE_CODE,ZONE_NAME").catch(() => null),
      queryLayer(LAYERS.heritage, lat, lng, "OBJECTID").catch(() => null),
      queryLayer(LAYERS.easements, lat, lng, "OBJECTID").catch(() => null),
    ]);

  const zoningCode =
    zoningAttrs
      ? String(zoningAttrs["ZONE_CODE"] ?? zoningAttrs["ZONE_NAME"] ?? "unknown")
      : SAFE_DEFAULTS.zoningCode;

  return {
    floodRisk: parseFloodRisk(floodAttrs),
    bushfireRisk: parseBushfireRisk(bushfireAttrs),
    zoningCode,
    hasHeritage: heritageAttrs !== null,
    hasEasement: easementAttrs !== null,
  };
}
