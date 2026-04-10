/**
 * YARDSCORE SUBURB DETECTOR
 * Scans text for Australian suburb/city/region names.
 * Used as a fallback when Claude fails to tag insights with locations.
 */

import { investmentIntelligence } from './investment-intelligence'

interface SuburbEntry {
  suburb: string
  state: string
}

/** Build master list of all known Australian suburbs from handbook + major cities */
function buildSuburbList(): SuburbEntry[] {
  const suburbs: SuburbEntry[] = []
  const seen = new Set<string>()

  // From investment intelligence handbook
  for (const [state, tiers] of Object.entries(investmentIntelligence)) {
    for (const tier of Object.values(tiers as Record<string, { topPicks?: Array<{ suburb: string }> }>)) {
      for (const pick of tier.topPicks || []) {
        const key = `${pick.suburb}|${state}`
        if (!seen.has(key)) {
          seen.add(key)
          suburbs.push({ suburb: pick.suburb, state })
        }
      }
    }
  }

  // Major cities and regions not in the handbook
  const additional: SuburbEntry[] = [
    // QLD
    { suburb: 'Brisbane', state: 'QLD' },
    { suburb: 'Gold Coast', state: 'QLD' },
    { suburb: 'Sunshine Coast', state: 'QLD' },
    { suburb: 'Townsville', state: 'QLD' },
    { suburb: 'Cairns', state: 'QLD' },
    { suburb: 'Mackay', state: 'QLD' },
    { suburb: 'Rockhampton', state: 'QLD' },
    { suburb: 'Bundaberg', state: 'QLD' },
    { suburb: 'Toowoomba', state: 'QLD' },
    { suburb: 'Ipswich', state: 'QLD' },
    { suburb: 'Redcliffe', state: 'QLD' },
    { suburb: 'North Lakes', state: 'QLD' },
    { suburb: 'Caboolture', state: 'QLD' },
    { suburb: 'Narangba', state: 'QLD' },
    { suburb: 'Springfield', state: 'QLD' },
    { suburb: 'Ripley', state: 'QLD' },
    { suburb: 'Hervey Bay', state: 'QLD' },
    { suburb: 'Gladstone', state: 'QLD' },
    { suburb: 'Mount Isa', state: 'QLD' },
    { suburb: 'Logan', state: 'QLD' },
    { suburb: 'Moreton Bay', state: 'QLD' },
    { suburb: 'Redland Bay', state: 'QLD' },
    // NSW
    { suburb: 'Sydney', state: 'NSW' },
    { suburb: 'Newcastle', state: 'NSW' },
    { suburb: 'Wollongong', state: 'NSW' },
    { suburb: 'Parramatta', state: 'NSW' },
    { suburb: 'Penrith', state: 'NSW' },
    { suburb: 'Blacktown', state: 'NSW' },
    { suburb: 'Liverpool', state: 'NSW' },
    { suburb: 'Campbelltown', state: 'NSW' },
    { suburb: 'Central Coast', state: 'NSW' },
    { suburb: 'Hunter Valley', state: 'NSW' },
    { suburb: 'Cessnock', state: 'NSW' },
    { suburb: 'Maitland', state: 'NSW' },
    { suburb: 'Wagga Wagga', state: 'NSW' },
    { suburb: 'Albury', state: 'NSW' },
    { suburb: 'Orange', state: 'NSW' },
    { suburb: 'Dubbo', state: 'NSW' },
    { suburb: 'Bathurst', state: 'NSW' },
    { suburb: 'Raymond Terrace', state: 'NSW' },
    { suburb: 'Western Sydney', state: 'NSW' },
    // VIC
    { suburb: 'Melbourne', state: 'VIC' },
    { suburb: 'Geelong', state: 'VIC' },
    { suburb: 'Ballarat', state: 'VIC' },
    { suburb: 'Bendigo', state: 'VIC' },
    { suburb: 'Melton', state: 'VIC' },
    { suburb: 'Footscray', state: 'VIC' },
    { suburb: 'Werribee', state: 'VIC' },
    { suburb: 'Frankston', state: 'VIC' },
    { suburb: 'Dandenong', state: 'VIC' },
    { suburb: 'Pakenham', state: 'VIC' },
    { suburb: 'Cranbourne', state: 'VIC' },
    { suburb: 'Sunbury', state: 'VIC' },
    { suburb: 'Sunshine', state: 'VIC' },
    // WA
    { suburb: 'Perth', state: 'WA' },
    { suburb: 'Fremantle', state: 'WA' },
    { suburb: 'Mandurah', state: 'WA' },
    { suburb: 'Rockingham', state: 'WA' },
    { suburb: 'Armadale', state: 'WA' },
    { suburb: 'Joondalup', state: 'WA' },
    { suburb: 'Maylands', state: 'WA' },
    { suburb: 'Karratha', state: 'WA' },
    { suburb: 'Port Hedland', state: 'WA' },
    { suburb: 'Broome', state: 'WA' },
    // SA
    { suburb: 'Adelaide', state: 'SA' },
    { suburb: 'Prospect', state: 'SA' },
    { suburb: 'Norwood', state: 'SA' },
    { suburb: 'Glenelg', state: 'SA' },
    { suburb: 'Mount Barker', state: 'SA' },
    { suburb: 'Elizabeth', state: 'SA' },
    { suburb: 'Salisbury', state: 'SA' },
    // TAS
    { suburb: 'Hobart', state: 'TAS' },
    { suburb: 'Launceston', state: 'TAS' },
    { suburb: 'Devonport', state: 'TAS' },
    // ACT
    { suburb: 'Canberra', state: 'ACT' },
    { suburb: 'Belconnen', state: 'ACT' },
    { suburb: 'Tuggeranong', state: 'ACT' },
    // NT
    { suburb: 'Darwin', state: 'NT' },
    { suburb: 'Alice Springs', state: 'NT' },
  ]

  for (const entry of additional) {
    const key = `${entry.suburb}|${entry.state}`
    if (!seen.has(key)) {
      seen.add(key)
      suburbs.push(entry)
    }
  }

  return suburbs
}

export const australianSuburbs = buildSuburbList()

/** Detect which suburbs are mentioned in a text */
export function detectSuburbsInText(text: string): Array<{
  suburb: string
  state: string
  mentions: number
}> {
  const found: Array<{ suburb: string; state: string; mentions: number }> = []

  for (const { suburb, state } of australianSuburbs) {
    // Use word boundary matching to avoid false positives
    const escaped = suburb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
    const regex = new RegExp('\\b' + escaped + '\\b', 'gi')
    const matches = text.match(regex)
    if (matches && matches.length > 0) {
      found.push({ suburb, state, mentions: matches.length })
    }
  }

  return found.sort((a, b) => b.mentions - a.mentions)
}

/** Tag an insight that has null suburb/state using suburb detection */
export function tagInsightWithSuburb(
  insight: Record<string, unknown>,
  articleText: string,
): Record<string, unknown> {
  // Already has suburb — return as-is
  if (insight.suburb && insight.state) return insight

  // Try detecting suburbs in the article text
  const detected = detectSuburbsInText(articleText)
  if (detected.length > 0) {
    return {
      ...insight,
      suburb: detected[0].suburb,
      state: detected[0].state,
    }
  }

  // Last resort: detect state/country from text
  const statePatterns: Array<{ pattern: RegExp; state: string; suburb: string }> = [
    { pattern: /\bqueensland\b|\bbrisbane\b|\bqld\b/i, state: 'QLD', suburb: 'Queensland' },
    { pattern: /\bnew south wales\b|\bsydney\b|\bnsw\b/i, state: 'NSW', suburb: 'New South Wales' },
    { pattern: /\bvictoria\b|\bmelbourne\b/i, state: 'VIC', suburb: 'Victoria' },
    { pattern: /\bwestern australia\b|\bperth\b/i, state: 'WA', suburb: 'Western Australia' },
    { pattern: /\bsouth australia\b|\badelaide\b/i, state: 'SA', suburb: 'South Australia' },
    { pattern: /\btasmania\b|\bhobart\b/i, state: 'TAS', suburb: 'Tasmania' },
    { pattern: /\baustralia\b|\bnational\b|\bacross the country\b/i, state: 'AUS', suburb: 'Australia' },
  ]

  for (const { pattern, state, suburb } of statePatterns) {
    if (pattern.test(articleText)) {
      return { ...insight, suburb, state }
    }
  }

  return insight
}
