'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Sparkles, Send, Quote, Lightbulb, Compass, Loader2, Bot, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Message {
  role: 'user' | 'model'
  parts: [{ text: string }]
}

const QUICK_PROMPTS = [
  { text: 'Analyze India\'s fiscal deficit trend and implications for 2026', icon: Compass },
  { text: 'Explain multi-agent reinforcement learning in simple terms', icon: Lightbulb },
  { text: 'Summarize key risks in emerging market sovereign debt', icon: Quote },
  { text: 'What are rare-earth mineral supply chain vulnerabilities?', icon: Sparkles },
]

export default function AiAssistantPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ text: 'Hello! I\'m **Q-Brain** — your AI research assistant for Quantora-NEXT.\n\nI can help you:\n• Analyze and summarize research papers\n• Explain complex macroeconomic and quantitative concepts\n• Generate research hypotheses\n• Discuss India\'s policy landscape\n\nWhat would you like to explore today?' }]
    }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return

    const userMsg: Message = { role: 'user', parts: [{ text }] }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput('')
    setStreaming(true)

    // Add empty assistant message to fill
    const assistantMsgIndex = updatedHistory.length
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1), // skip initial greeting
        }),
      })

      if (!res.ok || !res.body) throw new Error('AI service unavailable')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        // Update the last message in real-time
        setMessages(prev => {
          const updated = [...prev]
          updated[assistantMsgIndex] = { role: 'model', parts: [{ text: accumulated }] }
          return updated
        })
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[assistantMsgIndex] = {
          role: 'model',
          parts: [{ text: 'I apologize — I\'m experiencing a connection issue. Please try again.' }]
        }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  // Simple markdown renderer for bold, bullet points
  const renderContent = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold text
      const parts = line.split(/\*\*(.*?)\*\*/g)
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part
      )
      return (
        <span key={i}>
          {line.startsWith('•') ? (
            <span className="block pl-2 text-[#A0AEC0]">{rendered}</span>
          ) : (
            <span className="block">{rendered}</span>
          )}
          {i < lines.length - 1 && line === '' && <br />}
        </span>
      )
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-[900px] mx-auto px-4">
      {/* Header */}
      <div className="py-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0062FF] to-[#00F0FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,98,255,0.4)]">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Q-Brain — Research Copilot</h1>
            <p className="text-xs text-[#A0AEC0]">Powered by Groq · Llama 3.3 · Quantora-NEXT</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse" />
            <span className="text-[10px] text-[#A0AEC0] font-mono">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 min-h-0">
        {messages.map((msg, i) => {
          const isAi = msg.role === 'model'
          return (
            <div key={i} className={`flex gap-3 items-start ${isAi ? '' : 'flex-row-reverse'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                isAi
                  ? 'bg-gradient-to-br from-[#0062FF] to-[#00F0FF] text-white shadow-[0_0_10px_rgba(0,98,255,0.3)]'
                  : 'bg-[#0a0f1e] border border-white/10 text-[#A0AEC0]'
              }`}>
                {isAi ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Bubble */}
              <div className={`rounded-xl px-4 py-3 max-w-[80%] text-xs md:text-sm leading-relaxed ${
                isAi
                  ? 'bg-[#0a0f1e]/80 border border-white/5 text-[#B0BEC5]'
                  : 'bg-[#0062FF]/15 border border-[#0062FF]/30 text-white'
              }`}>
                {msg.parts[0].text ? (
                  <div className="whitespace-pre-wrap">{renderContent(msg.parts[0].text)}</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(n => (
                        <div key={n} className="w-1.5 h-1.5 bg-[#0062FF] rounded-full animate-bounce"
                          style={{ animationDelay: `${n * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-[#0062FF] animate-pulse">Thinking...</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Quick prompts (only show when fresh chat) */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
          {QUICK_PROMPTS.map((prompt, i) => {
            const Icon = prompt.icon
            return (
              <button key={i} onClick={() => sendMessage(prompt.text)}
                className="flex items-center gap-2 bg-[#0a0f1e]/60 border border-white/5 hover:border-[#0062FF]/30 rounded-lg p-3 text-left transition-all group">
                <Icon size={12} className="text-[#0062FF] shrink-0" />
                <span className="text-xs text-[#A0AEC0] group-hover:text-white transition-colors leading-snug">{prompt.text}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Input bar */}
      <div className="py-4 border-t border-white/5 shrink-0">
        {!user && !authLoading && (
          <div className="flex items-center gap-2 bg-[#0062FF]/5 border border-[#0062FF]/20 rounded-lg px-4 py-2 mb-3 text-xs text-[#A0AEC0]">
            <Sparkles size={12} className="text-[#0062FF]" />
            <span>Sign in to use the full AI Research Copilot</span>
            <button onClick={() => router.push('/login')} className="ml-auto text-[#0062FF] font-bold hover:underline">
              Sign In →
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-[#0a0f1e]/60 border border-white/10 focus-within:border-[#0062FF]/50 rounded-xl px-4 py-3 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about research, economics, markets, or policy..."
            disabled={streaming}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none"
          />
          <button onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="w-8 h-8 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-40 text-white rounded-lg flex items-center justify-center shrink-0 transition-all">
            {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-[9px] text-[#A0AEC0]/50 text-center mt-2 font-mono">
          Q-Brain may produce inaccuracies. Always verify critical research claims.
        </p>
      </div>
    </div>
  )
}
