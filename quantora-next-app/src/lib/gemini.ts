import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// ─── Model Instances ───────────────────────────────────────────────────────────
const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

// ─── Research Paper AI Summary ──────────────────────────────────────────────────
export async function generatePaperSummary(
  title: string,
  abstract: string,
  category: string
): Promise<{ summary: string; keywords: string[]; qualityScore: number }> {
  const prompt = `You are an academic research assistant for QUANTORA-NEXT, an open-access research platform.

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
  "keywords": ["keyword1", "keyword2", ...],
  "qualityScore": 85
}`

  const result: GenerateContentResult = await textModel.generateContent(prompt)
  const text = result.response.text().trim()

  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    return {
      summary: abstract.slice(0, 200) + '...',
      keywords: [category],
      qualityScore: 70,
    }
  }
}

// ─── Insight Tag Generation ─────────────────────────────────────────────────────
export async function generateInsightTags(content: string): Promise<string[]> {
  const prompt = `You are a research categorization assistant for QUANTORA-NEXT.

Given this research insight, generate 3-5 concise topic tags. Be specific and academic.

Insight: ${content.slice(0, 500)}

Respond ONLY with a JSON array of strings, e.g.: ["Macroeconomics", "India Policy", "Agriculture"]`

  const result = await textModel.generateContent(prompt)
  const text = result.response.text().trim()
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    const tags = JSON.parse(cleaned)
    return Array.isArray(tags) ? tags.slice(0, 5) : []
  } catch {
    return ['Research', 'Analysis']
  }
}

// ─── AI Research Chat (streaming) ──────────────────────────────────────────────
export async function createResearchChat(systemContext?: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction: systemContext || `You are ARIA (Analytical Research Intelligence Assistant), the AI research assistant for QUANTORA-NEXT — an open-access research platform based in New Delhi, India.

You help researchers with:
- Understanding research papers and complex academic concepts
- Finding connections between macroeconomics, public policy, climate finance, and quantitative strategy
- Generating research hypotheses and methodological suggestions
- Explaining statistical and quantitative methods
- Discussing India's economic landscape, market structures, and policy frameworks

Be concise, precise, and academically rigorous. Cite data ranges when uncertain.`,
  })

  return model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  })
}

// ─── Stream Chat Response ───────────────────────────────────────────────────────
export async function streamChatResponse(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>
): Promise<ReadableStream<Uint8Array>> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction: `You are ARIA, the AI research assistant for QUANTORA-NEXT. Be concise, precise, and academically rigorous.`,
  })

  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(message)

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
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
  const prompt = `You are a peer review committee member for QUANTORA-NEXT research platform.

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

  const result = await textModel.generateContent(prompt)
  const text = result.response.text().trim()
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
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
