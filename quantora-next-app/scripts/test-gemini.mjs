import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI('AIzaSyBtScpSY_2f-2QWHseynGUocNPQciw9zIc')

async function test() {
  try {
    // Test basic generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    const result = await model.generateContent('Say only the word: OK')
    console.log('✅ Gemini API working:', result.response.text().trim())

    // Test streaming
    const chat = model.startChat({ history: [] })
    const stream = await chat.sendMessageStream('What is Quantora Analytics in one sentence?')
    process.stdout.write('✅ Streaming: ')
    for await (const chunk of stream.stream) {
      process.stdout.write(chunk.text())
    }
    console.log('\n✅ All Gemini tests passed!')
  } catch (e) {
    console.error('❌ Gemini ERROR:', e.message)
  }
}

test()
