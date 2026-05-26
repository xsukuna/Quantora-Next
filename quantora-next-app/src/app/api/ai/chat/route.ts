import { NextRequest, NextResponse } from 'next/server'
import { streamChatResponse } from '@/lib/gemini'

// POST /api/ai/chat — streaming Gemini chat
export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const stream = await streamChatResponse(message, history || [])

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
