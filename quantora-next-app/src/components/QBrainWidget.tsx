'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Loader2, Minimize2, Maximize2, GripHorizontal } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  text: string
}

interface Position {
  x: number
  y: number
}

const QUICK_PROMPTS = [
  'Summarize India fiscal deficit 2026',
  'Explain rare earth supply chain risks',
  'What is QUANTORA-NEXT?',
  'Insights on emerging markets',
]

function BrainIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 2C7.6 2 6 3.3 5.4 5.1C4.1 5.4 3 6.6 3 8.1C3 9 3.4 9.8 4 10.4C3.7 11 3.5 11.7 3.5 12.4C3.5 14.5 5.1 16.2 7.1 16.4C7.4 17.3 8 18 8.8 18.5C9.1 18.8 9.5 19 10 19H14C14.5 19 14.9 18.8 15.2 18.5C16 18 16.6 17.3 16.9 16.4C18.9 16.2 20.5 14.5 20.5 12.4C20.5 11.7 20.3 11 20 10.4C20.6 9.8 21 9 21 8.1C21 6.6 19.9 5.4 18.6 5.1C18 3.3 16.4 2 14.5 2C13.5 2 12.6 2.4 12 3C11.4 2.4 10.5 2 9.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.5 9.5C9.5 9.5 10.5 10.5 12 10.5C13.5 10.5 14.5 9.5 14.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9.5" cy="7.5" r="0.75" fill="currentColor"/>
      <circle cx="14.5" cy="7.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}

export function QBrainWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [pulse, setPulse] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: -1, y: -1 }) // -1 means use default CSS
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm **Q-Brain**, your AI research assistant.\n\nAsk me anything about research, economics, markets, or policy." }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)

  const widgetRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Default position (right side, slightly above bottom)
  const isDefaultPos = position.x === -1 && position.y === -1

  useEffect(() => {
    if (open) {
      setPulse(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── Drag logic ────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rect = widgetRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - dragOffset.x
      const y = e.clientY - dragOffset.y
      // Clamp to viewport
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 56)
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 56)
      setPosition({
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      })
    }

    const onMouseUp = () => setDragging(false)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, dragOffset])

  // ─── Send message ───────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return
    setInput('')
    setStreaming(true)

    const userMsg: Message = { role: 'user', text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    const aiIndex = newMessages.length
    setMessages(prev => [...prev, { role: 'model', text: '' }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[aiIndex] = { role: 'model', text: accumulated }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[aiIndex] = { role: 'model', text: "Sorry, I'm having a connection issue. Please try again shortly." }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const renderText = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
    )

  const panelHeight = expanded ? 580 : 480
  const panelWidth = expanded ? 400 : 340

  // Compute widget style
  const widgetStyle: React.CSSProperties = isDefaultPos
    ? { position: 'fixed', right: 20, bottom: 90, zIndex: 9999 }
    : { position: 'fixed', left: position.x, top: position.y, zIndex: 9999 }

  // Panel opens above the button
  const panelStyle: React.CSSProperties = isDefaultPos
    ? {
        position: 'fixed',
        right: 20,
        bottom: 150,
        width: panelWidth,
        zIndex: 9998,
      }
    : {
        position: 'fixed',
        left: position.x + 60 > window.innerWidth / 2
          ? position.x - panelWidth - 8
          : position.x + 60,
        top: Math.max(8, position.y - panelHeight + 56),
        width: panelWidth,
        zIndex: 9998,
      }

  return (
    <>
      {/* ── Floating Button ── */}
      <div ref={widgetRef} style={widgetStyle}>
        {/* Drag handle — appears on hover */}
        <div
          onMouseDown={onMouseDown}
          className={`absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 cursor-grab active:cursor-grabbing px-2 py-1 rounded-full bg-[#0a0f1e] border border-white/10 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100 select-none ${dragging ? 'opacity-100' : ''}`}
          title="Drag to reposition"
        >
          <GripHorizontal size={10} className="text-[#A0AEC0]" />
          <span className="text-[8px] text-[#A0AEC0] font-mono">drag</span>
        </div>

        <div className="group flex flex-col items-center gap-1">
          {/* Main button */}
          <button
            onClick={() => !dragging && setOpen(!open)}
            onMouseDown={onMouseDown}
            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 select-none cursor-grab active:cursor-grabbing shadow-2xl ${
              open
                ? 'bg-gradient-to-br from-[#0062FF] to-[#00F0FF] shadow-[0_8px_32px_rgba(0,98,255,0.5)]'
                : 'bg-[#0a0f1e] border border-[#0062FF]/40 shadow-[0_4px_20px_rgba(0,98,255,0.2)] hover:border-[#0062FF]/70 hover:shadow-[0_8px_32px_rgba(0,98,255,0.4)]'
            }`}
          >
            {/* Pulse rings */}
            {pulse && !open && (
              <>
                <span className="absolute inset-0 rounded-2xl animate-ping bg-[#0062FF]/20" />
                <span className="absolute inset-[-4px] rounded-2xl animate-ping bg-[#0062FF]/10 animation-delay-200" style={{ animationDelay: '0.3s' }} />
              </>
            )}
            <div className={`transition-all duration-200 ${open ? 'rotate-0 scale-100' : 'hover:scale-110'}`}>
              {open
                ? <X size={22} className="text-white" />
                : <BrainIcon size={24} className={`transition-colors ${pulse ? 'text-[#0062FF]' : 'text-[#0062FF]'}`} />
              }
            </div>

            {/* Notification dot */}
            {!open && pulse && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00F0FF] rounded-full border-2 border-[#050a14] animate-pulse" />
            )}
          </button>

          {/* Label */}
          <span className={`text-[8px] font-black font-mono tracking-widest uppercase select-none transition-colors ${
            open ? 'text-[#00F0FF]' : 'text-[#A0AEC0]'
          }`}>
            Q-Brain
          </span>
        </div>
      </div>

      {/* ── Chat Panel ── */}
      {open && (
        <div style={{ ...panelStyle, height: panelHeight }}
          className="bg-[#060b18] border border-[#0062FF]/20 rounded-2xl shadow-[0_0_80px_rgba(0,98,255,0.25)] flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in">

          {/* Header */}
          <div
            onMouseDown={onMouseDown}
            className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gradient-to-r from-[#0062FF]/10 to-[#00F0FF]/5 shrink-0 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0062FF] to-[#00F0FF] flex items-center justify-center shadow-[0_0_16px_rgba(0,98,255,0.5)] shrink-0">
              <BrainIcon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-sm">Q-Brain</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#00FF88] rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-[#A0AEC0] uppercase tracking-wider">Online</span>
                </div>
              </div>
              <p className="text-[9px] text-[#A0AEC0]/70 font-mono truncate">Quantora AI · Gemini 2.0 Powered</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setExpanded(!expanded)}
                className="w-6 h-6 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#A0AEC0] hover:text-white transition-colors" title={expanded ? 'Collapse' : 'Expand'}>
                {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
              </button>
              <button onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-[#A0AEC0] hover:text-red-400 transition-colors">
                <X size={11} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold ${
                  msg.role === 'model'
                    ? 'bg-gradient-to-br from-[#0062FF] to-[#00F0FF] text-white shadow-[0_0_8px_rgba(0,98,255,0.4)]'
                    : 'bg-[#0a0f1e] border border-white/10 text-[#A0AEC0]'
                }`}>
                  {msg.role === 'model' ? <BrainIcon size={10} className="text-white" /> : 'U'}
                </div>
                <div className={`rounded-xl px-3 py-2.5 max-w-[85%] text-[11px] leading-relaxed ${
                  msg.role === 'model'
                    ? 'bg-[#0d1424] border border-white/5 text-[#C0CDD8]'
                    : 'bg-[#0062FF]/15 border border-[#0062FF]/25 text-white'
                }`}>
                  {msg.text ? (
                    <p className="whitespace-pre-wrap">{renderText(msg.text)}</p>
                  ) : (
                    <div className="flex items-center gap-1.5 py-0.5">
                      {[0, 1, 2].map(n => (
                        <div key={n} className="w-1.5 h-1.5 bg-[#0062FF] rounded-full animate-bounce"
                          style={{ animationDelay: `${n * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 grid grid-cols-2 gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)}
                  className="text-left text-[10px] text-[#A0AEC0] hover:text-white bg-white/[0.03] hover:bg-[#0062FF]/10 border border-white/5 hover:border-[#0062FF]/30 rounded-lg px-2.5 py-2 transition-all leading-snug">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-2 bg-[#0a0f1e] border border-white/8 focus-within:border-[#0062FF]/50 focus-within:shadow-[0_0_0_3px_rgba(0,98,255,0.1)] rounded-xl px-3 py-2.5 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask Q-Brain anything..."
                disabled={streaming}
                className="flex-1 bg-transparent text-white text-[11px] placeholder:text-[#A0AEC0]/40 outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={streaming || !input.trim()}
                className="w-7 h-7 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center shrink-0 transition-all shadow-[0_2px_8px_rgba(0,98,255,0.4)]">
                {streaming
                  ? <Loader2 size={11} className="animate-spin text-white" />
                  : <Send size={11} className="text-white" />
                }
              </button>
            </div>
            <p className="text-[8px] text-[#A0AEC0]/30 text-center mt-1.5 font-mono select-none">
              Drag header to reposition · Powered by Google Gemini
            </p>
          </div>
        </div>
      )}
    </>
  )
}
