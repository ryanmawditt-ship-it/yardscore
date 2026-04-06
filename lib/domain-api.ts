import axios from "axios";

const AUTH_URL = "https://auth.domain.com.au/v1/connect/token";
const API_BASE = "https://api.domain.com.au/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtains an OAuth2 access token using client credentials.
 * Tokens are cached until 60s before expiry.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.DOMAIN_CLIENT_ID;
  const clientSecret = process.env.DOMAIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("DOMAIN_CLIENT_ID and DOMAIN_CLIENT_SECRET must be set");
  }

  const response = await axios.post(
    AUTH_URL,
    new URLSearchParams({
      grant_type: "client_credentials",
      scope: "api_listings_read api_salesresults_read api_properties_read",
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: { username: clientId, password: clientSecret },
      timeout: 10_000,
    }
  );

  const { access_token, expires_in } = response.data;
  cachedToken = {
    token: access_token,
    expiresAt: Date.now() + (expires_in - 60) * 1000,
  };

  console.log("[domain-api] Token obtained, expires in", expires_in, "seconds");
  return access_token;
}

export interface DomainListing {
  id: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  price: string;
  priceNumeric: number | null;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  propertyType: string;
  listingUrl: string;
  imageUrl: string | null;
  headline: string;
}

/**
 * Searches Domain API for residential listings matching the given criteria.
 * Returns up to `limit` listings. Falls back gracefully on any error.
 */
export async function searchListings(params: {
  suburb: string;
  state: string;
  postcode?: string;
  propertyTypes?: string[];
  minBedrooms?: number;
  maxPrice?: number;
  limit?: number;
}): Promise<DomainListing[]> {
  const limit = params.limit ?? 3;

  try {
    const token = await getAccessToken();

    const stateMap: Record<string, string> = {
      QLD: "Queensland",
      NSW: "NewSouthWales",
      VIC: "Victoria",
      WA: "WesternAustralia",
      SA: "SouthAustralia",
      TAS: "Tasmania",
      ACT: "AustralianCapitalTerritory",
      NT: "NorthernTerritory",
    };

    const propertyTypes = params.propertyTypes ?? ["House"];

    const searchBody = {
      listingType: "Sale",
      propertyTypes,
      minBedrooms: params.minBedrooms ?? 2,
      maxPrice: params.maxPrice,
      locations: [
        {
          state: stateMap[params.state] ?? params.state,
          suburb: params.suburb,
          postCode: params.postcode ?? "",
          includeSurroundingSuburbs: false,
        },
      ],
      pageSize: limit,
      sort: { sortKey: "DateUpdated", direction: "Descending" },
    };

    console.log(`[domain-api] Searching ${params.suburb} ${params.state}: ${propertyTypes.join(",")} under $${params.maxPrice?.toLocaleString()}, ${params.minBedrooms}+ bed`);

    const response = await axios.post(
      `${API_BASE}/listings/residential/_search`,
      searchBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      }
    );

    const results = response.data as Array<Record<string, unknown>>;

    const listings: DomainListing[] = results.map((item) => {
      const listing = (item.listing ?? item) as Record<string, unknown>;
      const propDetails = (listing.propertyDetails ?? {}) as Record<string, unknown>;
      const addr = (propDetails.displayableAddress ?? listing.addressParts ?? {}) as Record<string, unknown>;
      const priceDetails = (listing.priceDetails ?? {}) as Record<string, unknown>;
      const media = (listing.media ?? []) as Array<Record<string, unknown>>;

      const streetAddr = String(propDetails.displayableAddress ?? addr.displayAddress ?? "");
      const suburbName = String(propDetails.suburb ?? addr.suburb ?? params.suburb);
      const stateName = String(propDetails.state ?? addr.state ?? params.state);
      const postcode = String(propDetails.postcode ?? addr.postcode ?? params.postcode ?? "");

      const fullAddress = streetAddr
        ? `${streetAddr}, ${suburbName} ${stateName} ${postcode}`
        : `${suburbName} ${stateName} ${postcode}`;

      let priceNum: number | null = null;
      const displayPrice = String(priceDetails.displayPrice ?? "");
      const priceMatch = displayPrice.replace(/,/g, "").match(/\$?([\d]+)/);
      if (priceMatch) priceNum = parseInt(priceMatch[1], 10);

      const firstImage = media.length > 0 ? String(media[0].url ?? "") : null;

      return {
        id: String(listing.id ?? item.id ?? ""),
        address: fullAddress,
        suburb: suburbName,
        state: stateName,
        postcode,
        price: displayPrice || "Contact agent",
        priceNumeric: priceNum,
        bedrooms: Number(propDetails.bedrooms ?? 0),
        bathrooms: Number(propDetails.bathrooms ?? 0),
        carSpaces: Number(propDetails.carSpaces ?? 0),
        propertyType: String(propDetails.propertyType ?? "House"),
        listingUrl: `https://www.domain.com.au/${String(listing.listingSlug ?? listing.id ?? "")}`,
        imageUrl: firstImage,
        headline: String(listing.headline ?? ""),
      };
    });

    console.log(`[domain-api] Found ${listings.length} listings in ${params.suburb}`);
    return listings;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[domain-api] Search failed for ${params.suburb}: ${message}`);
    return [];
  }
}
