'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Loader2, Minimize2, Maximize2, ChevronDown } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  text: string
  provider?: 'groq' | 'gemini'
}

type Provider = 'groq' | 'gemini'

interface Position { x: number; y: number }

const PROVIDERS: { id: Provider; label: string; model: string; badge: string; color: string }[] = [
  { id: 'groq',   label: 'Llama 3.3',  model: 'llama-3.3-70b',    badge: 'FREE · Groq',   color: '#F97316' },
  { id: 'gemini', label: 'Gemini 2.0', model: 'gemini-2.0-flash', badge: 'Google AI',     color: '#0062FF' },
]

const QUICK_PROMPTS = [
  'Summarize India fiscal deficit 2026',
  'Explain rare earth supply chain risks',
  'What is Quantora-NEXT?',
  'Insights on emerging markets',
]

function BrainIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9.5 2C7.6 2 6 3.3 5.4 5.1C4.1 5.4 3 6.6 3 8.1C3 9 3.4 9.8 4 10.4C3.7 11 3.5 11.7 3.5 12.4C3.5 14.5 5.1 16.2 7.1 16.4C7.4 17.3 8 18 8.8 18.5C9.1 18.8 9.5 19 10 19H14C14.5 19 14.9 18.8 15.2 18.5C16 18 16.6 17.3 16.9 16.4C18.9 16.2 20.5 14.5 20.5 12.4C20.5 11.7 20.3 11 20 10.4C20.6 9.8 21 11 21 8.1C21 6.6 19.9 5.4 18.6 5.1C18 3.3 16.4 2 14.5 2C13.5 2 12.6 2.4 12 3C11.4 2.4 10.5 2 9.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.5 9.5C9.5 9.5 10.5 10.5 12 10.5C13.5 10.5 14.5 9.5 14.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9.5" cy="7.5" r="0.75" fill="currentColor"/>
      <circle cx="14.5" cy="7.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}

export function QBrainWidget() {
  const [open, setOpen]         = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [pulse, setPulse]       = useState(true)
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: -1, y: -1 })
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [provider, setProvider] = useState<Provider>('groq')
  const [providerMenu, setProviderMenu] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm **Q-Brain**, your AI research assistant powered by **Llama 3.3** and **Gemini 2.0**.\n\nSwitch models anytime using the selector above. Ask me anything about research, economics, or policy!", provider: 'groq' }
  ])
  const [input, setInput]       = useState('')
  const [streaming, setStreaming] = useState(false)

  const widgetRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isDefaultPos = position.x === -1 && position.y === -1
  const activeProvider = PROVIDERS.find(p => p.id === provider)!

  useEffect(() => { if (open) { setPulse(false); setTimeout(() => inputRef.current?.focus(), 150) } }, [open])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (providerMenu) { const close = () => setProviderMenu(false); window.addEventListener('click', close); return () => window.removeEventListener('click', close) } }, [providerMenu])

  // ── Drag ──────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rect = widgetRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const maxX = window.innerWidth  - (widgetRef.current?.offsetWidth  || 56)
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 56)
      setPosition({ x: Math.max(0, Math.min(e.clientX - dragOffset.x, maxX)), y: Math.max(0, Math.min(e.clientY - dragOffset.y, maxY)) })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset])

  // ── Send ──────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return
    setInput('')
    setStreaming(true)

    const userMsg: Message = { role: 'user', text }
    const next = [...messages, userMsg]
    setMessages(next)
    const aiIdx = next.length
    setMessages(p => [...p, { role: 'model', text: '', provider }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          provider,
          history: messages.slice(1).map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Connection failed' }))
        throw new Error(err.error || 'Failed')
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages(p => { const u = [...p]; u[aiIdx] = { role: 'model', text: acc, provider }; return u })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Connection issue'
      setMessages(p => { const u = [...p]; u[aiIdx] = { role: 'model', text: `⚠️ ${msg}. Try switching model above.`, provider }; return u })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const renderText = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
    )

  const panelH = expanded ? 580 : 480
  const panelW = expanded ? 400 : 350

  const widgetStyle: React.CSSProperties = isDefaultPos
    ? { position: 'fixed', right: 20, bottom: 90, zIndex: 9999 }
    : { position: 'fixed', left: position.x, top: position.y, zIndex: 9999 }

  const panelStyle: React.CSSProperties = isDefaultPos
    ? { position: 'fixed', right: 20, bottom: 158, width: panelW, height: panelH, zIndex: 9998 }
    : {
        position: 'fixed',
        left: position.x + 64 > window.innerWidth / 2 ? position.x - panelW - 8 : position.x + 64,
        top: Math.max(8, position.y - panelH + 56),
        width: panelW, height: panelH, zIndex: 9998,
      }

  return (
    <>
      {/* ── Floating Button ── */}
      <div ref={widgetRef} style={widgetStyle}>
        <div className="group flex flex-col items-center gap-1">
          <button
            onClick={() => !dragging && setOpen(!open)}
            onMouseDown={onMouseDown}
            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 select-none cursor-grab active:cursor-grabbing shadow-2xl ${
              open
                ? 'bg-gradient-to-br from-[#F97316] to-[#0062FF] shadow-[0_8px_32px_rgba(249,115,22,0.4)]'
                : 'bg-[#0a0f1e] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-[#F97316]/50 hover:shadow-[0_8px_32px_rgba(249,115,22,0.3)]'
            }`}
          >
            {pulse && !open && (
              <>
                <span className="absolute inset-0 rounded-2xl animate-ping bg-[#F97316]/20" />
                <span className="absolute inset-[-5px] rounded-2xl animate-ping bg-[#F97316]/10" style={{ animationDelay: '0.4s' }} />
              </>
            )}
            {!open && pulse && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F97316] rounded-full border-2 border-[#050a14] animate-pulse" />
            )}
            <div className={`transition-all duration-200 ${open ? 'rotate-12' : 'group-hover:scale-110'}`}>
              {open
                ? <X size={22} className="text-white rotate-[-12deg]" />
                : <BrainIcon size={24} className="text-[#F97316]" />
              }
            </div>
          </button>
          <span className={`text-[8px] font-black font-mono tracking-widest uppercase select-none ${open ? 'text-[#F97316]' : 'text-[#A0AEC0]'}`}>
            Q-Brain
          </span>
        </div>
      </div>

      {/* ── Chat Panel ── */}
      {open && (
        <div style={panelStyle}
          className="bg-[#060b18] border border-white/8 rounded-2xl shadow-[0_0_80px_rgba(249,115,22,0.15),0_0_40px_rgba(0,98,255,0.1)] flex flex-col overflow-hidden">

          {/* Header */}
          <div onMouseDown={onMouseDown}
            className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-gradient-to-r from-[#F97316]/8 to-[#0062FF]/5 shrink-0 cursor-grab active:cursor-grabbing select-none">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, #F97316, #0062FF)` }}>
              <BrainIcon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-sm">Q-Brain</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#00FF88] rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-[#A0AEC0] uppercase">Online</span>
                </div>
              </div>
              <p className="text-[9px] text-[#A0AEC0]/60 font-mono">Quantora-NEXT AI · Drag to move</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setExpanded(!expanded)}
                className="w-6 h-6 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#A0AEC0] hover:text-white transition-colors">
                {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
              </button>
              <button onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-[#A0AEC0] hover:text-red-400 transition-colors">
                <X size={11} />
              </button>
            </div>
          </div>

          {/* ── Model Switcher Bar ── */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/20 shrink-0">
            <span className="text-[9px] text-[#A0AEC0]/60 font-mono uppercase tracking-wider shrink-0">Model:</span>
            <div className="flex gap-1.5 flex-1">
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setProvider(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    provider === p.id
                      ? 'text-white border-transparent shadow-lg'
                      : 'text-[#A0AEC0] border-white/5 hover:border-white/15 hover:text-white bg-transparent'
                  }`}
                  style={provider === p.id ? { background: p.color, boxShadow: `0 2px 12px ${p.color}55` } : {}}>
                  <span className={`w-1.5 h-1.5 rounded-full ${provider === p.id ? 'bg-white' : 'bg-current'}`} />
                  {p.label}
                  {provider === p.id && (
                    <span className="text-[8px] font-mono opacity-70 hidden sm:inline">{p.badge}</span>
                  )}
                </button>
              ))}
            </div>
            {streaming && (
              <div className="flex items-center gap-1 text-[8px] font-mono shrink-0" style={{ color: activeProvider.color }}>
                <Loader2 size={9} className="animate-spin" />
                <span>thinking</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((msg, i) => {
              const msgProvider = PROVIDERS.find(p => p.id === msg.provider)
              return (
                <div key={i} className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold ${
                    msg.role === 'model'
                      ? 'text-white shadow-lg'
                      : 'bg-[#0a0f1e] border border-white/10 text-[#A0AEC0]'
                  }`} style={msg.role === 'model' ? { background: `linear-gradient(135deg, #F97316, #0062FF)` } : {}}>
                    {msg.role === 'model' ? <BrainIcon size={10} className="text-white" /> : 'U'}
                  </div>
                  <div className={`rounded-xl px-3 py-2.5 max-w-[87%] text-[11px] leading-relaxed ${
                    msg.role === 'model'
                      ? 'bg-[#0d1424] border border-white/5 text-[#C0CDD8]'
                      : 'bg-[#0062FF]/12 border border-[#0062FF]/20 text-white'
                  }`}>
                    {msg.text ? (
                      <>
                        <p className="whitespace-pre-wrap">{renderText(msg.text)}</p>
                        {msg.role === 'model' && msgProvider && (
                          <div className="mt-1.5 flex items-center gap-1 opacity-40">
                            <span className="w-1 h-1 rounded-full" style={{ background: msgProvider.color }} />
                            <span className="text-[8px] font-mono">{msgProvider.label}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 py-0.5">
                        {[0,1,2].map(n => (
                          <div key={n} className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ backgroundColor: activeProvider.color, animationDelay: `${n*0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 grid grid-cols-2 gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)}
                  className="text-left text-[10px] text-[#A0AEC0] hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg px-2.5 py-2 transition-all leading-snug">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-2 bg-[#0a0f1e] border border-white/8 focus-within:border-white/20 rounded-xl px-3 py-2.5 transition-all"
              style={{ '--tw-ring-color': activeProvider.color } as React.CSSProperties}>
              <input ref={inputRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder={`Ask ${activeProvider.label}...`}
                disabled={streaming}
                className="flex-1 bg-transparent text-white text-[11px] placeholder:text-[#A0AEC0]/40 outline-none"
              />
              <button onClick={() => sendMessage(input)}
                disabled={streaming || !input.trim()}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: input.trim() && !streaming ? activeProvider.color : '#1a2035', boxShadow: input.trim() && !streaming ? `0 2px 10px ${activeProvider.color}55` : 'none' }}>
                {streaming
                  ? <Loader2 size={11} className="animate-spin text-white" />
                  : <Send size={11} className="text-white" />
                }
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[8px] font-mono" style={{ color: activeProvider.color + '99' }}>
                ● {activeProvider.label} · {activeProvider.badge}
              </span>
              <span className="text-[8px] text-[#A0AEC0]/30 font-mono">Drag header to move</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
