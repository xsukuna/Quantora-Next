import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const QBRAIN_SYSTEM = `You are Q-Brain, the AI research assistant for Quantora-NEXT — an open-access research intelligence platform based in New Delhi, India.

You help researchers with:
- Understanding research papers and complex academic concepts  
- Finding connections between macroeconomics, public policy, climate finance, and quantitative strategy
- Generating research hypotheses and methodological suggestions
- Explaining statistical and quantitative methods
- Discussing India's economic landscape, market structures, and policy frameworks

Be concise, precise, and academically rigorous. Use bullet points for clarity. Always be helpful.`

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], provider = 'groq' } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const encoder = new TextEncoder()

    // ── GROQ (Llama 3.3 70B) ────────────────────────────────────────
    if (provider === 'groq' || provider === 'auto') {
      const groqKey = process.env.GROQ_API_KEY
      if (groqKey) {
        try {
          const groq = new Groq({ apiKey: groqKey })

          const messages: Groq.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: QBRAIN_SYSTEM },
            ...history.map((m: { role: string; parts: [{ text: string }] }) => ({
              role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
              content: m.parts[0].text,
            })),
            { role: 'user', content: message },
          ]

          const stream = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
          })

          return new Response(
            new ReadableStream({
              async start(controller) {
                for await (const chunk of stream) {
                  const text = chunk.choices[0]?.delta?.content || ''
                  if (text) controller.enqueue(encoder.encode(text))
                }
                controller.close()
              },
            }),
            { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } }
          )
        } catch (err) {
          console.error('[Groq] error:', err)
          if (provider === 'groq') {
            return NextResponse.json({ error: 'Groq unavailable' }, { status: 503 })
          }
          // fall through to Gemini if auto
        }
      }
    }

    // ── GEMINI (Google) ─────────────────────────────────────────────
    if (provider === 'gemini' || provider === 'auto') {
      const geminiKey = process.env.GEMINI_API_KEY
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey)
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            systemInstruction: QBRAIN_SYSTEM,
          })

          const geminiHistory = history.map((m: { role: string; parts: [{ text: string }] }) => ({
            role: m.role as 'user' | 'model',
            parts: m.parts,
          }))

          const chat = model.startChat({ history: geminiHistory })
          const result = await chat.sendMessageStream(message)

          return new Response(
            new ReadableStream({
              async start(controller) {
                for await (const chunk of result.stream) {
                  const text = chunk.text()
                  if (text) controller.enqueue(encoder.encode(text))
                }
                controller.close()
              },
            }),
            { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } }
          )
        } catch (err) {
          console.error('[Gemini] error:', err)
          return NextResponse.json({ error: 'Gemini unavailable — quota may be exhausted' }, { status: 503 })
        }
      }
    }

    return NextResponse.json({ error: 'No AI provider configured' }, { status: 503 })
  } catch (err) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
