/**
 * YARDSCORE COUNCIL DA MONITOR
 * Monitors council development application portals for
 * property-affecting proposals BEFORE they become mainstream news.
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

export interface CouncilConfig {
  name: string
  daUrl: string
  state: string
}

export interface DAInsight {
  council: string
  state: string
  applications: string[]
  scannedAt: string
}

const COUNCILS: CouncilConfig[] = [
  {
    name: 'Brisbane City Council',
    daUrl: 'https://developmenti.brisbane.qld.gov.au/Home/FilterDAs',
    state: 'QLD',
  },
  {
    name: 'Moreton Bay Regional Council',
    daUrl: 'https://www.moretonbay.qld.gov.au/Services/Building-and-Development/Development-Applications',
    state: 'QLD',
  },
  {
    name: 'Gold Coast City Council',
    daUrl: 'https://www.goldcoast.qld.gov.au/building-and-planning/planning-applications',
    state: 'QLD',
  },
  {
    name: 'Ipswich City Council',
    daUrl: 'https://www.ipswich.qld.gov.au/build_and_develop/planning_and_development/development_applications',
    state: 'QLD',
  },
  {
    name: 'Sunshine Coast Council',
    daUrl: 'https://www.sunshinecoast.qld.gov.au/Building-and-Development/Development-Applications',
    state: 'QLD',
  },
  {
    name: 'Logan City Council',
    daUrl: 'https://www.logan.qld.gov.au/planning-and-development/development-applications',
    state: 'QLD',
  },
  {
    name: 'Toowoomba Regional Council',
    daUrl: 'https://www.tr.qld.gov.au/planning-and-building/development-applications',
    state: 'QLD',
  },
  {
    name: 'City of Parramatta',
    daUrl: 'https://www.cityofparramatta.nsw.gov.au/development/development-applications',
    state: 'NSW',
  },
  {
    name: 'City of Melbourne',
    daUrl: 'https://www.melbourne.vic.gov.au/building-and-development/property-information/planning-building-registers/pages/planning-register.aspx',
    state: 'VIC',
  },
]

export async function monitorCouncilDAs(): Promise<DAInsight[]> {
  const daInsights: DAInsight[] = []

  const results = await Promise.allSettled(
    COUNCILS.map(async (council) => {
      try {
        const response = await axios.get(council.daUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        })
        const $ = cheerio.load(response.data)

        const das: string[] = []
        $('table tr, .da-item, .application-item, .da-listing, li, .search-result').each((_, el) => {
          const text = $(el).text().trim().replace(/\s+/g, ' ')
          if (text.length > 20 && text.length < 500) {
            das.push(text)
          }
        })

        if (das.length > 0) {
          return {
            council: council.name,
            state: council.state,
            applications: das.slice(0, 20),
            scannedAt: new Date().toISOString(),
          }
        }
        return null
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        console.log(`[council-da] Failed to fetch ${council.name}: ${msg}`)
        return null
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      daInsights.push(result.value)
    }
  }

  return daInsights
}

/** Get council configs for a specific state */
export function getCouncilsByState(state: string): CouncilConfig[] {
  return COUNCILS.filter(c => c.state === state)
}

/** Get all monitored council count */
export function getCouncilCount(): number {
  return COUNCILS.length
}
