import axios from "axios";

// ---------------------------------------------------------------------------
// Queensland Globe (ArcGIS REST) — used for QLD addresses
// ---------------------------------------------------------------------------

const QLD_BASE = "https://spatial-gis.information.qld.gov.au/arcgis/rest/services";

const QLD_LAYERS = {
  flood: `${QLD_BASE}/Flooding/FloodRiskManagement/MapServer/0`,
  bushfire: `${QLD_BASE}/NaturalHazards/BushfireManagement/MapServer/0`,
  zoning: `${QLD_BASE}/PlanningCadastre/LocalGovernmentZoning/MapServer/0`,
  heritage: `${QLD_BASE}/NationalParks/QueenslandHeritage/MapServer/0`,
  easements: `${QLD_BASE}/PlanningCadastre/LandParcelPropertyFramework/MapServer/4`,
};

// ---------------------------------------------------------------------------
// National data.gov.au WFS endpoints — used for non-QLD states
// ---------------------------------------------------------------------------

const NATIONAL_FLOOD_WFS =
  "https://data.gov.au/geoserver/national-flood-mapping/wfs";
const NATIONAL_BUSHFIRE_WFS =
  "https://data.gov.au/geoserver/national-indicative-aggregated-fire-danger-rating/wfs";

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

// ---------------------------------------------------------------------------
// ArcGIS REST helpers (QLD)
// ---------------------------------------------------------------------------

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

function parseFloodRisk(attrs: Record<string, unknown> | null): string {
  if (!attrs) return "none";

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
  return "low";
}

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

// ---------------------------------------------------------------------------
// QLD overlays via Queensland Globe
// ---------------------------------------------------------------------------

async function getQldOverlays(lat: number, lng: number): Promise<OverlayResult> {
  const [floodAttrs, bushfireAttrs, zoningAttrs, heritageAttrs, easementAttrs] =
    await Promise.all([
      queryLayer(QLD_LAYERS.flood, lat, lng).catch(() => null),
      queryLayer(QLD_LAYERS.bushfire, lat, lng).catch(() => null),
      queryLayer(QLD_LAYERS.zoning, lat, lng, "ZONE_CODE,ZONE_NAME").catch(() => null),
      queryLayer(QLD_LAYERS.heritage, lat, lng, "OBJECTID").catch(() => null),
      queryLayer(QLD_LAYERS.easements, lat, lng, "OBJECTID").catch(() => null),
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

// ---------------------------------------------------------------------------
// National overlays via data.gov.au WFS (non-QLD states)
// ---------------------------------------------------------------------------

async function queryWfs(
  wfsUrl: string,
  lat: number,
  lng: number
): Promise<Record<string, unknown> | null> {
  try {
    const response = await axios.get(wfsUrl, {
      params: {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        outputFormat: "application/json",
        srsName: "EPSG:4326",
        bbox: `${lat - 0.001},${lng - 0.001},${lat + 0.001},${lng + 0.001},EPSG:4326`,
        maxFeatures: 1,
      },
      timeout: 10_000,
    });

    const features = response.data?.features ?? [];
    return features.length > 0 ? (features[0].properties ?? null) : null;
  } catch {
    return null;
  }
}

function parseNationalFlood(props: Record<string, unknown> | null): string {
  if (!props) return "none";
  const raw = String(
    props["flood_class"] ?? props["FLOOD_CLASS"] ?? props["category"] ?? ""
  ).toLowerCase();
  if (raw.includes("high")) return "high";
  if (raw.includes("medium") || raw.includes("mod")) return "medium";
  if (raw.includes("low")) return "low";
  if (raw === "" || raw === "null" || raw === "none") return "none";
  return "low";
}

function parseNationalBushfire(props: Record<string, unknown> | null): string {
  if (!props) return "none";
  const raw = String(
    props["fire_danger"] ?? props["FIRE_DANGER"] ?? props["rating"] ?? props["category"] ?? ""
  ).toLowerCase();
  if (raw.includes("extreme") || raw.includes("catastrophic") || raw.includes("high")) return "high";
  if (raw.includes("medium") || raw.includes("very high") || raw.includes("mod")) return "medium";
  if (raw.includes("low")) return "low";
  if (raw === "" || raw === "null" || raw === "none") return "none";
  return "low";
}

async function getNationalOverlays(lat: number, lng: number): Promise<OverlayResult> {
  const [floodProps, bushfireProps] = await Promise.all([
    queryWfs(NATIONAL_FLOOD_WFS, lat, lng),
    queryWfs(NATIONAL_BUSHFIRE_WFS, lat, lng),
  ]);

  return {
    floodRisk: parseNationalFlood(floodProps),
    bushfireRisk: parseNationalBushfire(bushfireProps),
    zoningCode: "Contact local council for zoning details",
    hasHeritage: false,
    hasEasement: false,
  };
}

// ---------------------------------------------------------------------------
// Main export — routes to QLD or national overlay sources based on state
// ---------------------------------------------------------------------------

export async function getOverlays(
  lat: number,
  lng: number,
  state?: string
): Promise<OverlayResult> {
  const s = (state ?? "").toUpperCase().trim();

  if (s === "QLD" || s === "QUEENSLAND") {
    return getQldOverlays(lat, lng);
  }

  return getNationalOverlays(lat, lng);
}
