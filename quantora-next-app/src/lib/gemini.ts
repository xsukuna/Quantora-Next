/**
 * Quantora-NEXT — Multi-Provider AI Client
 *
 * Provider priority (auto-fallback):
 *   1. Groq  — free, 14,400 req/day, Llama 3.3 70B (fastest)
 *   2. Gemini — Google, requires billing after free quota
 *
 * Add GROQ_API_KEY to .env.local to enable Groq.
 * Add GEMINI_API_KEY to .env.local to enable Gemini.
 */

import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ─── Provider instances (lazy init) ────────────────────────────────────────────
let groqClient: Groq | null = null
let geminiClient: GoogleGenerativeAI | null = null

function getGroq(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groqClient
}

function getGemini(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null
  if (!geminiClient) geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return geminiClient
}

// ─── Q-Brain system prompt ──────────────────────────────────────────────────────
const QBRAIN_SYSTEM = `You are Q-Brain, the AI research assistant for Quantora-NEXT — an open-access research intelligence platform based in New Delhi, India.

You help researchers with:
- Understanding research papers and complex academic concepts
- Finding connections between macroeconomics, public policy, climate finance, and quantitative strategy
- Generating research hypotheses and methodological suggestions
- Explaining statistical and quantitative methods
- Discussing India's economic landscape, market structures, and policy frameworks
- Summarizing recent developments in emerging markets and geopolitics

Be concise, precise, and academically rigorous. Use bullet points for lists. Cite data ranges when uncertain. Always be helpful and professional.`

// ─── Active provider detection ──────────────────────────────────────────────────
export function getActiveProvider(): 'groq' | 'gemini' | 'none' {
  if (process.env.GROQ_API_KEY) return 'groq'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return 'none'
}

export function getProviderInfo() {
  const provider = getActiveProvider()
  return {
    provider,
    model: provider === 'groq' ? 'llama-3.3-70b-versatile' : provider === 'gemini' ? 'gemini-2.0-flash' : 'none',
    label: provider === 'groq' ? 'Groq · Llama 3.3 70B' : provider === 'gemini' ? 'Google Gemini 2.0' : 'Unavailable',
  }
}

// ─── Streaming Chat ─────────────────────────────────────────────────────────────
export async function streamChatResponse(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()

  // ── Try Groq first ──
  const groq = getGroq()
  if (groq) {
    try {
      // Convert history format: Gemini → OpenAI style
      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: QBRAIN_SYSTEM },
        ...history.map(m => ({
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

      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || ''
              if (text) controller.enqueue(encoder.encode(text))
            }
            controller.close()
          } catch (e) {
            controller.error(e)
          }
        },
      })
    } catch (err) {
      console.warn('[AI] Groq failed, falling back to Gemini:', err)
    }
  }

  // ── Fallback: Gemini ──
  const gemini = getGemini()
  if (gemini) {
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: QBRAIN_SYSTEM,
    })
    const chat = model.startChat({
      history: history.map(m => ({ role: m.role, parts: m.parts })),
    })
    const result = await chat.sendMessageStream(message)

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      },
    })
  }

  // ── No provider available ──
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(
        'No AI provider is configured. Please add GROQ_API_KEY or GEMINI_API_KEY to your .env.local file.\n\n' +
        'Get a free Groq key at: https://console.groq.com'
      ))
      controller.close()
    },
  })
}

// ─── Text generation (non-streaming, for summaries/tags) ────────────────────────
export async function generateText(prompt: string): Promise<string> {
  // ── Try Groq ──
  const groq = getGroq()
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      })
      return res.choices[0]?.message?.content || ''
    } catch (err) {
      console.warn('[AI] Groq text gen failed, trying Gemini:', err)
    }
  }

  // ── Fallback: Gemini ──
  const gemini = getGemini()
  if (gemini) {
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  throw new Error('No AI provider available')
}

// ─── Paper Summary ──────────────────────────────────────────────────────────────
export async function generatePaperSummary(
  title: string,
  abstract: string,
  category: string
): Promise<{ summary: string; keywords: string[]; qualityScore: number }> {
  const prompt = `You are an academic research assistant for Quantora-NEXT, an open-access research platform.

Analyze this research paper and provide:
1. A clear 2-3 sentence summary for a general academic audience
2. 5-8 relevant keywords/topics
3. A quality score (0-100) based on specificity, relevance, and academic merit

Title: ${title}
Category: ${category}
Abstract: ${abstract}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "...",
  "keywords": ["keyword1", "keyword2"],
  "qualityScore": 85
}`

  try {
    const text = await generateText(prompt)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { summary: abstract.slice(0, 200) + '...', keywords: [category], qualityScore: 70 }
  }
}

// ─── Insight Tag Generation ─────────────────────────────────────────────────────
export async function generateInsightTags(content: string): Promise<string[]> {
  const prompt = `You are a research categorization assistant for Quantora-NEXT.

Given this research insight, generate 3-5 concise topic tags. Be specific and academic.

Insight: ${content.slice(0, 500)}

Respond ONLY with a JSON array of strings, e.g.: ["Macroeconomics", "India Policy", "Agriculture"]`

  try {
    const text = await generateText(prompt)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const tags = JSON.parse(cleaned)
    return Array.isArray(tags) ? tags.slice(0, 5) : []
  } catch {
    return ['Research', 'Analysis']
  }
}

// ─── Peer Review Scoring ────────────────────────────────────────────────────────
export async function scorePeerReview(
  title: string,
  abstract: string,
  category: string
): Promise<{
  methodologyScore: number
  originalityScore: number
  clarityScore: number
  overallRecommendation: 'APPROVE' | 'REVISE' | 'REJECT'
  reviewNotes: string
}> {
  const prompt = `You are a peer review committee member for Quantora-NEXT research platform.

Evaluate this research submission objectively:
Title: ${title}
Category: ${category}
Abstract: ${abstract}

Provide scores (0-100) and recommendation. Respond ONLY with valid JSON:
{
  "methodologyScore": 80,
  "originalityScore": 75,
  "clarityScore": 90,
  "overallRecommendation": "APPROVE",
  "reviewNotes": "Brief 1-2 sentence notes for the author"
}`

  try {
    const text = await generateText(prompt)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      methodologyScore: 70,
      originalityScore: 70,
      clarityScore: 70,
      overallRecommendation: 'REVISE',
      reviewNotes: 'Manual review required.',
    }
  }
}
