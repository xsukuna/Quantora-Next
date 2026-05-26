import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

console.log('Testing Groq API (Llama 3.3 70B)...')
const res = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'Reply with exactly: Q-Brain is online and ready.' }],
  max_tokens: 30,
})
console.log('✅ Groq response:', res.choices[0]?.message?.content)
console.log('✅ Model:', res.model)
console.log('✅ Tokens used:', res.usage?.total_tokens)
