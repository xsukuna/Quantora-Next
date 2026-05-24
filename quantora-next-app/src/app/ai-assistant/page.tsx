'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Send, Volume2, Quote, Lightbulb, Compass, AlertCircle } from 'lucide-react';
import { chatCopilot } from '../../lib/ai/gemini';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ text: 'Hello! I am the Quantora AI Research Assistant. I am deeply integrated with Google Gemini AI to help you analyze, summarize, simplify, or generate new academic ideas. How can I facilitate your research today?' }]
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle prompt submissions
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', parts: [{ text: textToSend }] };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputVal('');
    setLoading(true);

    try {
      // Map prompt history cleanly for the API
      const history = nextMessages.slice(0, -1);
      
      const responseText = await chatCopilot(
        "Global Research Ecosystem Context",
        "Quantora Analytics is an open access digital platform focusing on Macroeconomics, Stock Market factor alphas, AI deep reinforcement architectures, and Indian agricultural budget exposé audits.",
        history as any,
        textToSend
      );

      setMessages([...nextMessages, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...nextMessages, { role: 'model', parts: [{ text: 'Connection latency temporarily saturated. Please re-initialize secure prompt.' }] }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { text: "Summarize Broken Promises Agriculture paper", icon: Quote },
    { text: "Explain multi-agent reinforcement learning simply", icon: Lightbulb },
    { text: "Identify key rare-earth mineral logistics choke-points", icon: Compass },
    { text: "Generate Indian crop credit leakage citations", icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-sans selection:bg-[#0062FF] selection:text-white pb-20">
      
      {/* Dynamic Grid Matrix */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(0,98,255,0.06),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,240,255,0.06),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <div className="max-w-[900px] mx-auto px-6 pt-12 relative z-10">
        
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#A0AEC0] hover:text-white uppercase mb-8 transition-colors">
          <ArrowLeft size={14} />
          <span>Genesis Landing Page</span>
        </a>

        {/* Title */}
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0062FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,98,255,0.35)] animate-pulse">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent">AI RESEARCH COPILOT</h1>
            <p className="text-sm text-[#A0AEC0] mt-1">Deeply integrated Google Gemini AI engine assisting document analysis, summaries, and idea syntheses.</p>
          </div>
        </div>

        {/* Chat Terminal Box */}
        <div className="w-full bg-[#0a0f1e]/40 border border-[#0062FF]/30 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,98,255,0.1)] h-[55vh] flex flex-col mb-6">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 pr-4 scrollbar-thin">
            {messages.map((msg, i) => {
              const isAi = msg.role === 'model';
              return (
                <div 
                  key={i} 
                  className={`flex gap-4 items-start ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    isAi 
                      ? 'bg-gradient-to-br from-[#0062FF] to-[#00F0FF] text-white border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                      : 'bg-black border border-white/20 text-[#A0AEC0]'
                  }`}>
                    {isAi ? 'AI' : 'US'}
                  </div>

                  <div className={`rounded-xl p-4 max-w-[80%] text-xs md:text-sm leading-relaxed text-justify ${
                    isAi 
                      ? 'bg-black/60 border border-white/5 text-[#A0AEC0]' 
                      : 'bg-[#0062FF]/15 border border-[#0062FF]/40 text-white'
                  }`}>
                    <p className="whitespace-pre-line">{msg.parts[0].text}</p>
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0062FF] to-[#00F0FF] text-white flex items-center justify-center font-extrabold text-xs shadow-lg animate-spin">
                  AI
                </div>
                <div className="bg-black/60 border border-white/5 rounded-xl p-4 text-xs font-mono text-[#00F0FF] animate-pulse">
                  Synthesizing neural model vectors...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <div className="p-4 border-t border-[#0062FF]/20 bg-[#020202] flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(inputVal);
              }}
              className="bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-xs md:text-sm text-white placeholder:text-[#A0AEC0]/40 outline-none flex-1 focus:border-[#0062FF]/50"
              placeholder="Ask for research synthesis, summaries, or citations..."
              disabled={loading}
            />
            
            <button 
              onClick={() => handleSend(inputVal)}
              className="bg-[#0062FF] hover:bg-[#0056e0] text-white p-3 rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(0,98,255,0.3)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
              disabled={loading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Quick Prompts Cards */}
        <h4 className="text-xs font-mono tracking-widest text-[#0062FF] uppercase font-bold mb-4">RECOMMENDED ANALYSIS ROUTINES</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickPrompts.map((prompt, i) => {
            const Icon = prompt.icon;
            return (
              <div 
                key={i}
                onClick={() => handleSend(prompt.text)}
                className="bg-[#0a0f1e]/15 border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-[#0062FF]/40 hover:bg-[#0a0f1e]/30 transition-all hover:-translate-y-0.5"
              >
                <div className="text-[#00F0FF] p-2 bg-[#00F0FF]/5 rounded-lg border border-[#00F0FF]/10 shrink-0">
                  <Icon size={14} />
                </div>
                <span className="text-xs text-[#A0AEC0] leading-snug">{prompt.text}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
