import { NextRequest, NextResponse } from 'next/server'
import { KnowledgeStore } from '@/lib/knowledge-store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminKey = process.env.ADMIN_KEY
  const xAdminKey = request.headers.get('x-admin-key')
  if (adminKey && xAdminKey !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const suburb = request.nextUrl.searchParams.get('suburb')
  const state = request.nextUrl.searchParams.get('state')

  if (!suburb) {
    return NextResponse.json({ error: 'suburb param required' }, { status: 400 })
  }

  try {
    // Fetch from the suburb-specific index in Redis
    const suburbInsights = await KnowledgeStore.getSuburbInsights(suburb)

    // Also fetch state-level insights that mention this suburb in title/summary
    const stateInsights = state ? await KnowledgeStore.getStateInsights(state) : []
    const nameLC = suburb.toLowerCase()
    const stateMatches = stateInsights.filter(i => {
      const title = ((i.title as string) || '').toLowerCase()
      const summary = ((i.summary as string) || '').toLowerCase()
      return title.includes(nameLC) || summary.includes(nameLC)
    })

    // Merge and deduplicate by title
    const seen = new Set<string>()
    const merged = []
    for (const i of [...suburbInsights, ...stateMatches]) {
      const title = (i.title as string) || ''
      if (!seen.has(title)) {
        seen.add(title)
        merged.push(i)
      }
    }

    return NextResponse.json({ insights: merged })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
