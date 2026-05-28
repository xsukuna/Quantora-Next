'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  Sparkles, Send, Quote, Lightbulb, Compass, Loader2, Bot, User, 
  Layers, Network, FileText, Scale, GitPullRequest, ArrowRightLeft,
  CheckCircle, ShieldAlert, Award, FileSearch, HelpCircle, TrendingUp
} from 'lucide-react'
import { AiGraph } from '@/components/AiGraph'
import { AnimatePresence, motion } from 'framer-motion'

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

  const [activeTab, setActiveTab] = useState<'CHAT' | 'AGENTS'>('CHAT')
  const [activeAgentTab, setActiveAgentTab] = useState<'REVIEW' | 'COMPARE' | 'COAUTHOR' | 'GRAPH' | 'TREND'>('REVIEW')

  // Chat state
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

  // Lit Review Agent State
  const [litTopic, setLitTopic] = useState('')
  const [litStreaming, setLitStreaming] = useState(false)
  const [litResult, setLitResult] = useState<string | null>(null)

  // Paper Comparison State
  const [comparePaperA, setComparePaperA] = useState('Broken Promises in the Fields (Forensics)')
  const [comparePaperB, setComparePaperB] = useState('Sovereign Credit Allocation & Rural Welfare (Audit)')
  const [compareRunning, setCompareRunning] = useState(false)
  const [compareResult, setCompareResult] = useState<any | null>(null)

  // AI Co-Author State
  const [coauthorMode, setCoauthorMode] = useState<'METHODOLOGY' | 'CITATION' | 'STRUCTURE' | 'CONTRADICTION'>('METHODOLOGY')
  const [coauthorInput, setCoauthorInput] = useState('')
  const [coauthorRunning, setCoauthorRunning] = useState(false)
  const [coauthorResult, setCoauthorResult] = useState<string | null>(null)

  // Research Trend Predictor State
  const [trendTopic, setTrendTopic] = useState('Agricultural Budgets Correlation FY26-FY35')
  const [trendRunning, setTrendRunning] = useState(false)
  const [trendResult, setTrendResult] = useState<any | null>(null)

  // Auto-scroll chat
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

    const assistantMsgIndex = updatedHistory.length
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1),
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

  // Lit Review Execution Simulation
  const executeLitReview = () => {
    if (!litTopic.trim()) return
    setLitStreaming(true)
    setLitResult('')
    
    let index = 0
    const sentences = [
      "**[Agent: Lit-Searcher v2.1 initialized]** Checking global academic databases (arXiv, PubMed, SSRN)... Found 1,424 matches.",
      "\n\n**Synthesized Themes:**\n• **Macro Credit Redirection:** High correlation between South-Asia credit expansions and out-of-pocket medical leaks.",
      "\n• **Methodological Fragilities:** Existing surveys rely on annual recollections, creating self-reporting volatility offsets.",
      "\n\n**Identified Research Gaps:**\n1. Absence of high-frequency transactional tracking of farm-accounts.",
      "\n2. Lack of integrated climate drawdowns index vs loan repayment periods.",
      "\n\n**Recommendation:** Formulate a spatial-temporal graph matrix joining credit nodes with regional healthcare access parameters."
    ]

    const interval = setInterval(() => {
      if (index < sentences.length) {
        setLitResult(prev => (prev || '') + sentences[index])
        index++
      } else {
        clearInterval(interval)
        setLitStreaming(false)
      }
    }, 800)
  };

  // Compare Matrix simulation
  const executeCompare = () => {
    setCompareRunning(true);
    setTimeout(() => {
      setCompareResult({
        overlaps: "Both publications establish that credit volume increases are decoupled from bottom-up household cash-flow certainty.",
        contradictions: "Paper A asserts agricultural defaults are structural policy designs; Paper B claims they are banking infrastructure friction points.",
        methodology: "Paper A: 26-year macro forensics & NSSO MPCE data auditing. Paper B: Multi-agent vector simulation & synthetic regional surveys.",
        gaps: "Neither model accounts for seasonal credit velocity migrations under high-heat climate stressors (e.g. above 42°C cycles)."
      });
      setCompareRunning(false);
    }, 1500);
  };

  // Coauthor execution simulation
  const executeCoauthor = () => {
    if (!coauthorInput.trim()) return;
    setCoauthorRunning(true);
    setTimeout(() => {
      if (coauthorMode === 'METHODOLOGY') {
        setCoauthorResult(`**[AI Proposed Methodology Framework]**\n\n1. **Empirical Design:** Construct a spatial two-stage least squares (2SLS) model mapping out-of-pocket health spend shocks against agricultural default cycles.\n2. **Instrumental Variable (IV):** Utilize regional public clinic vacancy rates as the IV to control for endogenous variables.\n3. **Robustness:** Cluster standard errors at the district level across FY00-FY26.`);
      } else if (coauthorMode === 'CITATION') {
        setCoauthorResult(`**[AI Auto-Generated Reference List (APA 7th)]**\n\n• Kaushik, A. (2026). *Macroeconomic Debt Volatility Forensics: 26-Year Sovereign Aggregates.* Quantora Research Repository. doi:10.5555/quantora.2026.01.\n• Reserve Bank of India. (2025). *Annual Financial Stability Review & Credit Outlay Reports.* Reserve Bank of India. https://rbi.org.in`);
      } else if (coauthorMode === 'STRUCTURE') {
        setCoauthorResult(`**[AI Structural Coherence Audit]**\n\n• **Strength:** The introduction cleanly maps budget aggregates, transitioning smoothly to household indebtedness metrics.\n• **Critique:** Section 3 (Agricultural Productivity) introduces pgvector search metrics which lack contextual relevance to productivity gaps. Re-route semantic vector indexes to Section 4 (AI search models).`);
      } else {
        setCoauthorResult(`**[AI Logic Contradiction Check]**\n\n• **Flagged contradiction:** In Section 2, the manuscript states that Direct Income support (PM-KISAN) had *no real income impact*. However, in Section 5, you list PM-KISAN as a *successful income floor*. Rephrase to highlight that while the floor rose nominally, cost of cultivation inflation offsets neutralized real purchasing power expansions.`);
      }
      setCoauthorRunning(false);
    }, 1500);
  };

  // Trend Predictor execution simulation
  const executeTrendPredictor = () => {
    if (!trendTopic.trim()) return;
    setTrendRunning(true);
    setTimeout(() => {
      setTrendResult({
        forecast: "Macro simulation projects a structural decoupling of actual farm input cost index against credit volumes. Direct support subsidies must scale by 14% to maintain current MPCE purchasing power indices.",
        confidence: "87.4% (Confidence score mapped using NSSO HCES spatial-temporal indices)",
        dataSources: "NABARD Credit reports, NSSO MPCE 26-year timeline, spatial weather stress matrices.",
        points: [
          { year: 2026, outlay: 120, productivity: 100 },
          { year: 2028, outlay: 142, productivity: 105 },
          { year: 2030, outlay: 168, productivity: 108 },
          { year: 2032, outlay: 195, productivity: 111 },
          { year: 2034, outlay: 230, productivity: 112 },
        ]
      });
      setTrendRunning(false);
    }, 1500);
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
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
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-[1200px] mx-auto px-6">
      
      {/* 1. TOP HEADER & NAVIGATION BAR SWITCHER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-white/5 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0062FF] to-[#00F0FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,98,255,0.4)]">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Q-Brain Workstation</h1>
            <p className="text-xs text-[#A0AEC0]">Advanced Research Agent & Co-Author Suite</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1.5 bg-[#050505] border border-white/5 p-1 rounded-xl shrink-0 select-none">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'CHAT' ? 'bg-white text-black font-extrabold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot size={13} />
            <span>Q-Brain Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('AGENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'AGENTS' ? 'bg-white text-black font-extrabold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>AI Research Agents</span>
          </button>
        </div>
      </div>

      {/* 2. TAB DETAILS */}
      <div className="flex-1 overflow-y-auto min-h-0 py-4">
        
        {/* Q-BRAIN CHAT TAB */}
        {activeTab === 'CHAT' && (
          <div className="flex flex-col h-full max-w-[900px] mx-auto">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 min-h-0 scrollbar-thin">
              {messages.map((msg, i) => {
                const isAi = msg.role === 'model'
                return (
                  <div key={i} className={`flex gap-3 items-start ${isAi ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      isAi
                        ? 'bg-gradient-to-br from-[#0062FF] to-[#00F0FF] text-white shadow-[0_0_10px_rgba(0,98,255,0.3)]'
                        : 'bg-[#0a0f1e] border border-white/10 text-[#A0AEC0]'
                    }`}>
                      {isAi ? <Bot size={14} /> : <User size={14} />}
                    </div>

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

            {/* Quick prompts */}
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

            {/* Chat Input bar */}
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
            </div>
          </div>
        )}

        {/* AI RESEARCH AGENTS WORKSTATION TAB */}
        {activeTab === 'AGENTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full select-none">
            
            {/* Split panel Sidebar Options */}
            <aside className="lg:col-span-1 border-r border-white/5 pr-4 flex flex-col gap-2 shrink-0">
              <span className="text-[9px] font-mono text-[#0062FF] uppercase tracking-widest block mb-2">Agent Roster</span>
              {[
                { id: 'REVIEW', label: 'Lit Review Agent', icon: FileSearch, color: 'text-[#0062FF]' },
                { id: 'COMPARE', label: 'Paper Comparison Matrix', icon: ArrowRightLeft, color: 'text-[#FF7050]' },
                { id: 'COAUTHOR', label: 'AI Co-Author panel', icon: FileText, color: 'text-emerald-400' },
                { id: 'GRAPH', label: 'AI Knowledge Graph', icon: Network, color: 'text-[#00F0FF]' },
                { id: 'TREND', label: 'Research Trend Predictor', icon: TrendingUp, color: 'text-purple-400' },
              ].map(sub => {
                const Icon = sub.icon;
                const isSelected = activeAgentTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveAgentTab(sub.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-white/5 border border-white/10 text-white shadow-inner' 
                        : 'text-gray-400 border border-transparent hover:bg-white/[0.02] hover:text-white'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <Icon className={`w-4 h-4 ${sub.color}`} />
                  </button>
                );
              })}
            </aside>

            {/* Split panel Content Main Workspace */}
            <main className="lg:col-span-3 min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* 1. AUTONOMOUS LITERATURE REVIEW AGENT */}
                {activeAgentTab === 'REVIEW' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileSearch className="w-4 h-4 text-[#0062FF]" />
                        <span>Autonomous Literature Review Agent</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        Traces connected citations, datasets, and methodologies autonomously.
                      </p>
                    </div>

                    <div className="flex gap-3 bg-[#0a0f1e]/40 border border-white/5 p-3 rounded-xl">
                      <input 
                        type="text"
                        value={litTopic}
                        onChange={e => setLitTopic(e.target.value)}
                        placeholder="Enter research topic (e.g. credit leakages, graph neural nets)..."
                        className="flex-1 bg-transparent text-white text-xs placeholder:text-gray-600 outline-none"
                      />
                      <button
                        onClick={executeLitReview}
                        disabled={litStreaming || !litTopic.trim()}
                        className="px-5 py-2.5 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider rounded-lg shrink-0 transition-colors"
                      >
                        {litStreaming ? 'Analyzing...' : 'Execute Agent'}
                      </button>
                    </div>

                    {litResult && (
                      <div className="bg-[#020202] border border-white/5 rounded-xl p-5 space-y-3 font-mono text-[11px] text-gray-300 max-h-[220px] overflow-y-auto leading-relaxed">
                        {renderContent(litResult)}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 2. JUXTAPOSITION & PAPER COMPARISON MATRIX */}
                {activeAgentTab === 'COMPARE' && (
                  <motion.div
                    key="compare"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-[#FF7050]" />
                        <span>Paper Comparison & Gap Detection Matrix</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        Highlights systemic contradictions, methodological structures, and unanswered questions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Primary Publication A</label>
                        <input 
                          type="text"
                          value={comparePaperA}
                          onChange={e => setComparePaperA(e.target.value)}
                          className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Comparison Publication B</label>
                        <input 
                          type="text"
                          value={comparePaperB}
                          onChange={e => setComparePaperB(e.target.value)}
                          className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={executeCompare}
                        disabled={compareRunning}
                        className="px-6 py-3 bg-[#0062FF] hover:bg-[#0056e0] disabled:bg-blue-600/30 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        {compareRunning ? 'Calculating Matrix correlations...' : 'Run Comparative Matrix'}
                      </button>
                    </div>

                    {compareResult && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="glass rounded-xl border border-white/5 p-4 space-y-2">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Structural Overlaps</span>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{compareResult.overlaps}</p>
                        </div>
                        <div className="glass rounded-xl border border-white/5 p-4 space-y-2">
                          <span className="text-[9px] font-black text-[#FF7050] uppercase tracking-widest block">Contradictions Flagged</span>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{compareResult.contradictions}</p>
                        </div>
                        <div className="glass rounded-xl border border-white/5 p-4 space-y-2">
                          <span className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest block">Methodological Juxtaposition</span>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{compareResult.methodology}</p>
                        </div>
                        <div className="glass rounded-xl border border-white/5 p-4 space-y-2">
                          <span className="text-[9px] font-black text-[#a855f7] uppercase tracking-widest block">Empirical Gap Detected</span>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{compareResult.gaps}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. AI CO-AUTHOR WORKSPACE */}
                {activeAgentTab === 'COAUTHOR' && (
                  <motion.div
                    key="coauthor"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>AI Co-Author Workspace Panel</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        Enhance empirical frameworks, structural integrity, and logic coherence.
                      </p>
                    </div>

                    {/* Mode pills */}
                    <div className="flex gap-2">
                      {[
                        { id: 'METHODOLOGY', label: 'Suggest Methodology', icon: Compass },
                        { id: 'CITATION', label: 'Generate Citations', icon: Quote },
                        { id: 'STRUCTURE', label: 'Structure Audit', icon: Scale },
                        { id: 'CONTRADICTION', label: 'Logic Checker', icon: ShieldAlert },
                      ].map(mode => {
                        const Icon = mode.icon;
                        const isSelected = coauthorMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => { setCoauthorMode(mode.id as any); setCoauthorResult(null); }}
                            className={`px-3 py-2 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-white text-black font-extrabold' 
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={coauthorInput}
                        onChange={e => setCoauthorInput(e.target.value)}
                        placeholder={
                          coauthorMode === 'METHODOLOGY' ? "Describe your study goals to suggest methodology (e.g. mapping credit defaults against local hospital data)..." :
                          coauthorMode === 'CITATION' ? "List reference titles, topics, or authors to construct references..." :
                          coauthorMode === 'STRUCTURE' ? "Paste draft sections to execute structural coherence audits..." :
                          "Paste manuscript claims to identify logical contradictions with known public datasets..."
                        }
                        rows={4}
                        className="w-full bg-[#0a0f1e]/40 border border-white/10 rounded-xl p-4 text-xs text-white outline-none resize-none leading-relaxed focus:border-emerald-500 transition-colors"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={executeCoauthor}
                          disabled={coauthorRunning || !coauthorInput.trim()}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/30 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          {coauthorRunning ? 'Authorizing Co-Author audit...' : 'Audit Manuscript'}
                        </button>
                      </div>
                    </div>

                    {coauthorResult && (
                      <div className="bg-[#020202] border border-white/5 rounded-xl p-5 space-y-2 font-mono text-[11px] text-gray-300 leading-relaxed">
                        {renderContent(coauthorResult)}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. AI KNOWLEDGE GRAPH */}
                {activeAgentTab === 'GRAPH' && (
                  <motion.div
                    key="graph"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="h-full"
                  >
                    <AiGraph />
                  </motion.div>
                )}

                {/* 5. RESEARCH TREND PREDICTOR AGENT */}
                {activeAgentTab === 'TREND' && (
                  <motion.div
                    key="trend"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6 select-none"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span>AI Research Trend & Paradigm Predictor</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        Predicts future research trajectories and structural yield trends using alternative data indices.
                      </p>
                    </div>

                    <div className="flex gap-3 bg-[#0a0f1e]/40 border border-white/5 p-3 rounded-xl">
                      <input 
                        type="text"
                        value={trendTopic}
                        onChange={e => setTrendTopic(e.target.value)}
                        placeholder="Enter trend parameters (e.g. credit default cycles, fertilizer price indices)..."
                        className="flex-1 bg-transparent text-white text-xs placeholder:text-gray-600 outline-none"
                      />
                      <button
                        onClick={executeTrendPredictor}
                        disabled={trendRunning || !trendTopic.trim()}
                        className="px-5 py-2.5 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider rounded-lg shrink-0 transition-colors"
                      >
                        {trendRunning ? 'Analyzing...' : 'Predict Paradigms'}
                      </button>
                    </div>

                    {trendResult && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="md:col-span-2 glass border border-white/5 p-5 rounded-xl space-y-4">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Projected 10-Year Decoupling Forecast (FY26-FY35)</span>
                          
                          {/* Beautiful SVG Forecasting Chart */}
                          <div className="h-44 w-full bg-black/30 border border-white/5 rounded-lg flex items-center justify-center p-2 relative">
                            <svg className="w-full h-full" viewBox="0 0 400 150">
                              {/* Grid lines */}
                              <line x1="30" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.05)" />
                              <line x1="30" y1="20" x2="30" y2="120" stroke="rgba(255,255,255,0.05)" />
                              
                              {/* Line A (Outlays) */}
                              <path
                                d={`M 30,110 L 110,95 L 190,75 L 270,55 L 350,30`}
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                className="line-flow"
                              />
                              
                              {/* Line B (Productivity) */}
                              <path
                                d={`M 30,115 L 110,110 L 190,105 L 270,100 L 350,98`}
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2"
                              />

                              {/* Graph Data Dots */}
                              {trendResult.points.map((p: any, idx: number) => {
                                const x = 30 + idx * 80;
                                const yOutlay = 110 - idx * 20;
                                const yProd = 115 - idx * 4.2;

                                return (
                                  <g key={idx} className="cursor-pointer group">
                                    <circle cx={x} cy={yOutlay} r="3.5" fill="#a855f7" />
                                    <circle cx={x} cy={yProd} r="3.5" fill="#10B981" />
                                    <text x={x} y="138" textAnchor="middle" fill="#64748b" className="text-[8px] font-mono">{p.year}</text>
                                  </g>
                                );
                              })}
                            </svg>
                            <div className="absolute top-2 right-2 flex flex-col gap-1 text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-purple-500" /> Projected Outlays</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-500" /> Real Yields Index</span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-1 space-y-4">
                          <div className="glass border border-white/5 p-4 rounded-xl space-y-2">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest block">AI Synthesis Forecast</span>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-sans">{trendResult.forecast}</p>
                          </div>
                          
                          <div className="glass border border-white/5 p-4 rounded-xl space-y-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">System Telemetry Logs</span>
                            <div className="text-[8px] font-mono text-gray-500 space-y-1">
                              <div>Confidence: <span className="text-emerald-400 font-bold">{trendResult.confidence}</span></div>
                              <div className="mt-1">Primary inputs: <span className="text-white truncate block">{trendResult.dataSources}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </div>
        )}

      </div>
    </div>
  )
}
