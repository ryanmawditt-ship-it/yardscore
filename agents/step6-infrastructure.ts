import axios from "axios";
import * as cheerio from "cheerio";
import { GeocodedProperty, InfrastructureAnalysis } from "@/types";
import { getSupplyDemand } from "@/scrapers/htag";
import { askClaude } from "@/lib/claude";

const TMR_PROJECTS_URL = "https://www.tmr.qld.gov.au/projects";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const SYSTEM_PROMPT =
  "You are an infrastructure analyst for an Australian property research tool. " +
  "You will be given supply/demand data and any nearby infrastructure project information. " +
  "Return ONLY a valid JSON object matching the InfrastructureAnalysis type. " +
  "Score infrastructureScore 0-10 based on: confirmed projects nearby add 2 points each, " +
  "proposed add 1 point, undersupplied demand signal adds 2 points. " +
  "Write a 2 sentence opportunitySummary. No markdown, no explanation, just the JSON object.";

interface TmrProject {
  title: string;
  description: string;
  url: string;
}

/**
 * Fetches the TMR projects page and returns any project entries
 * whose title or description text mentions the target suburb (case-insensitive).
 * Projects are parsed from listing cards/rows on the page.
 */
async function fetchTmrProjects(suburb: string): Promise<TmrProject[]> {
  const response = await axios.get(TMR_PROJECTS_URL, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15_000,
  });

  const $ = cheerio.load(response.data as string);
  const suburbPattern = new RegExp(suburb.trim(), "i");
  const projects: TmrProject[] = [];

  // TMR renders projects as article cards or list items — try both structures
  const candidates = $("article, .project-item, .listing-item, li.views-row, .views-row");

  candidates.each((_, el) => {
    const title = $(el).find("h2, h3, h4, .title, [class*='title']").first().text().trim();
    const description = $(el).find("p, .summary, [class*='summary'], [class*='description']").first().text().trim();
    const href = $(el).find("a").first().attr("href") ?? "";

    if (suburbPattern.test(title) || suburbPattern.test(description)) {
      projects.push({
        title: title || "(untitled)",
        description: description || "",
        url: href.startsWith("http") ? href : `https://www.tmr.qld.gov.au${href}`,
      });
    }
  });

  // Fallback: if structured cards weren't found, scan all paragraph text
  if (projects.length === 0) {
    $("p, li").each((_, el) => {
      const text = $(el).text().trim();
      if (suburbPattern.test(text) && text.length > 20) {
        projects.push({ title: text.slice(0, 120), description: text, url: TMR_PROJECTS_URL });
      }
    });
  }

  return projects;
}

export async function analyseInfrastructure(
  property: GeocodedProperty
): Promise<InfrastructureAnalysis> {
  const [supplyDemand, tmrProjects] = await Promise.all([
    getSupplyDemand(property.suburb, property.state),
    fetchTmrProjects(property.suburb).catch(() => [] as TmrProject[]),
  ]);

  const userContent = JSON.stringify(
    { address: property.address, suburb: property.suburb, supplyDemand, tmrProjects },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);

  return JSON.parse(response) as InfrastructureAnalysis;
}
