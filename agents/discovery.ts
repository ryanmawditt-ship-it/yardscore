import { askClaude } from "@/lib/claude";
import { searchListings, type DomainListing } from "@/lib/domain-api";
import { getRealListings, type HomelyListing } from "@/scrapers/homely";
import { scrapeAllHomesListings } from "@/scrapers/allhomes";
import { findSuburbPick } from "@/lib/investment-intelligence";
import { getPostcodeForSuburb } from "@/lib/geocode";

// ── Photo mapping ──

const SUBURB_PHOTOS: Record<string, string> = {
  redcliffe: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80",
  "north lakes": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  ipswich: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  caboolture: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  narangba: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  bundaberg: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  rockhampton: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  toowoomba: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  footscray: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  sunshine: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  werribee: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  melton: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  ballarat: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  geelong: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  parramatta: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  penrith: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  wollongong: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  maylands: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  prospect: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  chermside: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  nundah: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  paddington: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  bulimba: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  "new farm": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80",
  ascot: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
};

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

export function getSuburbPhotoUrl(suburb: string): string {
  return SUBURB_PHOTOS[suburb.toLowerCase()] || DEFAULT_PHOTO;
}

export function buildListingSearchUrl(
  suburb: string,
  state: string,
  postcode: string,
  propertyType: string,
  bedrooms: number,
  maxBudget: number
): string {
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();
  const typeParam = propertyType.toLowerCase() === "any" ? "house" : propertyType.toLowerCase();
  return `https://www.realestate.com.au/buy/in-${suburbSlug},+${stateSlug}+${postcode}/list-1?propertyTypes=${typeParam}&numBeds-min=${bedrooms}&price-max=${maxBudget}`;
}

// ── Listing metadata cache (enriches FinalReport after analysis) ──

export interface ListingMeta {
  listingUrl: string;
  photoUrl: string | null;
  price: number | null;
  priceDisplay: string;
  bedrooms: number | null;
  bathrooms: number | null;
  source: "allhomes" | "homely" | "view" | "domain" | "ai-generated" | "fallback";
}

const listingMetaCache = new Map<string, ListingMeta>();

export function getCachedListingMeta(address: string): ListingMeta | null {
  // Try exact match first, then partial match on street number + name
  if (listingMetaCache.has(address)) return listingMetaCache.get(address)!;
  const streetPart = address.split(",")[0]?.trim().toLowerCase();
  const entries = Array.from(listingMetaCache.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, val] = entries[i];
    if (key.toLowerCase().includes(streetPart) || streetPart.includes(key.split(",")[0]?.trim().toLowerCase())) {
      return val;
    }
  }
  return null;
}

export function getCachedDomainListings(suburb: string): DomainListing[] {
  // Kept for backwards compat — returns empty now
  return [];
}

// ── Hardcoded fallback addresses ──

const FALLBACK_ADDRESSES: Record<string, string[]> = {
  redcliffe: ["128 Anzac Ave, Redcliffe QLD 4020", "45 Sutton St, Redcliffe QLD 4020", "12 Henzell St, Redcliffe QLD 4020"],
  "north lakes": ["28 Endeavour Blvd, North Lakes QLD 4509", "15 Lakefield Dr, North Lakes QLD 4509", "42 Caloundra Rd, North Lakes QLD 4509"],
  ipswich: ["24 Brisbane St, Ipswich QLD 4305", "8 Nicholas St, Ipswich QLD 4305", "33 Limestone St, Ipswich QLD 4305"],
  caboolture: ["15 King St, Caboolture QLD 4510", "8 Beerburrum Rd, Caboolture QLD 4510"],
  narangba: ["12 Grays Rd, Narangba QLD 4504", "5 Buckley Rd, Narangba QLD 4504"],
  bundaberg: ["45 Bourbong St, Bundaberg QLD 4670", "12 Barolin St, Bundaberg QLD 4670"],
  rockhampton: ["24 East St, Rockhampton QLD 4700", "15 Quay St, Rockhampton QLD 4700"],
  toowoomba: ["24 Ruthven St, Toowoomba QLD 4350", "15 Margaret St, Toowoomba QLD 4350"],
  parramatta: ["15 Church St, Parramatta NSW 2150", "8 Marsden St, Parramatta NSW 2150"],
  penrith: ["12 High St, Penrith NSW 2750", "24 Henry St, Penrith NSW 2750"],
  wollongong: ["15 Crown St, Wollongong NSW 2500", "8 Keira St, Wollongong NSW 2500"],
  footscray: ["12 Barkly St, Footscray VIC 3011", "45 Hopkins St, Footscray VIC 3011"],
  sunshine: ["15 Hampshire Rd, Sunshine VIC 3020", "8 Devonshire Rd, Sunshine VIC 3020"],
  werribee: ["12 Watton St, Werribee VIC 3030", "24 Cherry St, Werribee VIC 3030"],
  melton: ["15 High St, Melton VIC 3337", "8 McKenzie St, Melton VIC 3337"],
  ballarat: ["12 Sturt St, Ballarat VIC 3350", "24 Dana St, Ballarat VIC 3350"],
  geelong: ["15 Moorabool St, Geelong VIC 3220", "8 Malop St, Geelong VIC 3220"],
  maylands: ["15 Eighth Ave, Maylands WA 6051", "8 Whatley Cres, Maylands WA 6051"],
  prospect: ["12 Prospect Rd, Prospect SA 5082", "24 Main North Rd, Prospect SA 5082"],
};

// ── Main discovery function ──

export async function discoverProperties(
  suburb: string,
  state: string,
  maxBudget: number,
  bedrooms: number,
  propertyType: string
): Promise<string[]> {
  const pick = findSuburbPick(suburb, state);
  const postcode = pick?.postcode ?? "";
  const stateMap: Record<string, string> = { QLD: "queensland", NSW: "new-south-wales", VIC: "victoria", WA: "western-australia", SA: "south-australia" };
  const stateName = stateMap[state] || state.toLowerCase();
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");

  // 0. Try AllHomes (PRIMARY — confirmed working with real SSR HTML)
  const pc = postcode || getPostcodeForSuburb(suburb) || "";
  const allhomesListings = await scrapeAllHomesListings(suburb, state, pc, maxBudget, bedrooms, propertyType);
  if (allhomesListings.length >= 2) {
    console.log(`[discovery] Got ${allhomesListings.length} REAL AllHomes listings for ${suburb}`);
    const selected = allhomesListings.slice(0, 3);
    for (const l of selected) {
      listingMetaCache.set(l.address, {
        listingUrl: l.listingUrl,
        photoUrl: l.photoUrl,
        price: l.price,
        priceDisplay: l.priceDisplay,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        source: "allhomes" as const,
      });
    }
    return selected.map((l) => l.address);
  }

  if (allhomesListings.length === 1) {
    console.log(`[discovery] ${suburb} only has 1 valid AllHomes listing — insufficient for analysis`);
  } else if (allhomesListings.length === 0) {
    console.log(`[discovery] ${suburb} returned 0 valid AllHomes listings (may be too expensive or wrong property type for budget)`);
  }

  // 1. Try Homely / View scrapers (backup)
  const realListings = await getRealListings(suburb, state, maxBudget, bedrooms, propertyType);
  if (realListings.length > 0) {
    console.log(`[discovery] Got ${realListings.length} REAL listings from Homely/View for ${suburb}`);
    const selected = realListings.slice(0, 3);
    for (const l of selected) {
      listingMetaCache.set(l.address, {
        listingUrl: l.listingUrl,
        photoUrl: l.photoUrl,
        price: l.price,
        priceDisplay: l.priceDisplay,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        source: l.listingUrl.includes("view.com.au") ? "view" : "homely",
      });
    }
    return selected.map((l) => l.address);
  }

  // 2. Try Domain API
  if (process.env.DOMAIN_CLIENT_ID) {
    try {
      const domainListings = await searchListings({
        suburb,
        state,
        postcode,
        propertyTypes: propertyType.toLowerCase() === "any" ? ["House", "Townhouse"] : [propertyType],
        minBedrooms: bedrooms,
        maxPrice: maxBudget,
        limit: 2,
      });
      if (domainListings.length > 0) {
        console.log(`[discovery] Got ${domainListings.length} Domain API listings for ${suburb}`);
        for (const l of domainListings) {
          listingMetaCache.set(l.address, {
            listingUrl: l.listingUrl,
            photoUrl: l.imageUrl,
            price: l.priceNumeric,
            priceDisplay: l.price,
            bedrooms: l.bedrooms,
            bathrooms: l.bathrooms,
            source: "domain",
          });
        }
        return domainListings.map((l) => l.address);
      }
    } catch (e) {
      console.log("[discovery] Domain API failed:", e instanceof Error ? e.message : String(e));
    }
  }

  // 3. Hardcoded fallback addresses
  const key = suburb.toLowerCase();
  const fallbackAddresses = FALLBACK_ADDRESSES[key];
  if (fallbackAddresses) {
    console.log(`[discovery] Using ${fallbackAddresses.length} hardcoded fallback addresses for ${suburb}`);
    const selected = fallbackAddresses.slice(0, 3);
    const searchUrl = `https://www.homely.com.au/buy/${suburbSlug}-${stateName}/pg-1?maxprice=${maxBudget}&minbeds=${bedrooms}`;
    for (const addr of selected) {
      listingMetaCache.set(addr, {
        listingUrl: searchUrl,
        photoUrl: null,
        price: null,
        priceDisplay: `Under $${maxBudget.toLocaleString()}`,
        bedrooms,
        bathrooms: null,
        source: "fallback",
      });
    }
    return selected;
  }

  // 4. Last resort — AI-generated addresses
  console.log(`[discovery] All sources exhausted for ${suburb}, generating AI addresses`);
  const response = await askClaude(
    "You are an Australian real estate data assistant. Return ONLY a valid JSON array of address strings.",
    `Generate 3 realistic residential property addresses for sale in ${suburb}, ${state} with asking price under $${maxBudget.toLocaleString()}. Properties must be ${bedrooms}+ bedroom ${propertyType.toLowerCase()}s. Use real street names. Include correct postcode. Return JSON array only.`
  );
  const addresses = JSON.parse(response) as string[];
  const searchUrl = `https://www.homely.com.au/buy/${suburbSlug}-${stateName}/pg-1?maxprice=${maxBudget}&minbeds=${bedrooms}`;
  for (const addr of addresses) {
    listingMetaCache.set(addr, {
      listingUrl: searchUrl,
      photoUrl: null,
      price: null,
      priceDisplay: `Under $${maxBudget.toLocaleString()}`,
      bedrooms,
      bathrooms: null,
      source: "ai-generated",
    });
  }
  return addresses.slice(0, 3);
}
