import { NextRequest, NextResponse } from 'next/server'
import { generatePaperSummary } from '@/lib/gemini'

// POST /api/ai/summarize — generate AI summary for a paper
export async function POST(request: NextRequest) {
  try {
    const { title, abstract, category } = await request.json()

    if (!title || !abstract) {
      return NextResponse.json({ error: 'Title and abstract are required' }, { status: 400 })
    }

    const result = await generatePaperSummary(title, abstract, category || 'General')
    return NextResponse.json(result)
  } catch (err) {
    console.error('Summarize error:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
