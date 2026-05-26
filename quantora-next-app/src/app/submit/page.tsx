'use client'
import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  Upload, FileText, Loader2, CheckCircle, X,
  Zap, AlertCircle, ChevronDown
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  'Macroeconomics', 'Public Policy', 'Quant Strategy',
  'Climate Finance', 'Political Economy', 'Development Economics',
  'Geopolitics', 'Financial Markets', 'Technology Policy', 'Social Science',
]

interface UploadedFile {
  url: string
  name: string
  size: string
  path: string
}

export default function SubmitPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '', abstract: '', category: '', institution: '',
    country: 'India', tags: '', references_text: '',
  })
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted')
      return
    }
    if (file.size > 52428800) {
      setError('File must be under 50MB')
      return
    }

    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/research/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      const data = await res.json()
      setUploadedFile(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [])

  const generateAiPreview = async () => {
    if (!form.title || !form.abstract) return
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, abstract: form.abstract, category: form.category }),
      })
      if (res.ok) {
        const { summary } = await res.json()
        setAiSummary(summary)
      }
    } catch { /* silent */ }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    if (!uploadedFile) { setError('Please upload your research paper file'); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          institution: form.institution || profile?.institution || 'Independent',
          file_url: uploadedFile.url,
          file_name: uploadedFile.name,
          file_size: uploadedFile.size,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Submission failed')
      }

      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-[#00F0FF]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-3">Submission Received</h1>
        <p className="text-[#A0AEC0] mb-8">
          Your research paper is under review. Our editorial team will evaluate it within 2–3 business days.
          You'll earn <strong className="text-[#0062FF]">+100 reputation</strong> upon approval.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => setSubmitted(false)} className="border border-white/10 hover:bg-white/5 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all">
            Submit Another
          </button>
          <button onClick={() => router.push('/library')} className="bg-[#0062FF] hover:bg-[#0056e0] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all">
            View Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-2">Submit Research Paper</h1>
        <p className="text-[#A0AEC0] text-sm">Publish your research to the Quantora open-access library. All submissions are peer-reviewed.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* File Upload Zone */}
        <div>
          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-3">Research Paper (PDF, max 50MB) *</label>
          {!uploadedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? 'border-[#0062FF] bg-[#0062FF]/5' : 'border-white/10 hover:border-[#0062FF]/40 hover:bg-[#0062FF]/5'}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-[#0062FF] animate-spin" />
                  <p className="text-[#A0AEC0] text-sm">Uploading to Supabase Storage...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={32} className="text-[#A0AEC0]" />
                  <p className="text-white font-medium text-sm">Drop PDF here or click to browse</p>
                  <p className="text-[#A0AEC0] text-xs">Supports PDF, DOC, DOCX · Max 50MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-[#0062FF]/10 border border-[#0062FF]/20 rounded-xl p-4">
              <FileText size={24} className="text-[#0062FF] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{uploadedFile.name}</p>
                <p className="text-[#A0AEC0] text-xs">{uploadedFile.size} · Uploaded to Supabase Storage</p>
              </div>
              <button type="button" onClick={() => setUploadedFile(null)}
                className="text-[#A0AEC0] hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Title *</label>
          <input name="title" type="text" value={form.title} onChange={handleChange}
            placeholder="Full research paper title" required
            className="w-full bg-[#0a0f1e]/60 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Category *</label>
          <div className="relative">
            <select name="category" value={form.category} onChange={handleChange} required
              className="w-full appearance-none bg-[#0a0f1e]/60 border border-white/10 focus:border-[#0062FF]/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all pr-10">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] pointer-events-none" />
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Abstract *</label>
          <textarea name="abstract" value={form.abstract} onChange={handleChange}
            placeholder="Provide a comprehensive abstract (200-500 words)..." required rows={6}
            className="w-full bg-[#0a0f1e]/60 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all resize-none"
          />
          {form.title && form.abstract.length > 50 && (
            <button type="button" onClick={generateAiPreview}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#0062FF] hover:text-[#00F0FF] transition-colors">
              <Zap size={12} />Generate AI Preview Summary
            </button>
          )}
          {aiSummary && (
            <div className="mt-3 p-3 bg-[#0062FF]/5 border border-[#0062FF]/15 rounded-lg">
              <p className="text-[9px] font-mono text-[#0062FF] uppercase tracking-widest mb-1">Gemini AI Summary Preview</p>
              <p className="text-xs text-[#A0AEC0]">{aiSummary}</p>
            </div>
          )}
        </div>

        {/* Institution + Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Institution</label>
            <input name="institution" type="text" value={form.institution} onChange={handleChange}
              placeholder="University / Institute"
              className="w-full bg-[#0a0f1e]/60 border border-white/10 focus:border-[#0062FF]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Country</label>
            <input name="country" type="text" value={form.country} onChange={handleChange}
              placeholder="India"
              className="w-full bg-[#0a0f1e]/60 border border-white/10 focus:border-[#0062FF]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Tags (comma-separated)</label>
          <input name="tags" type="text" value={form.tags} onChange={handleChange}
            placeholder="fiscal policy, rural credit, agri-finance"
            className="w-full bg-[#0a0f1e]/60 border border-white/10 focus:border-[#0062FF]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
          />
          <p className="text-[10px] text-[#A0AEC0] mt-1">Gemini AI will auto-enhance your tags after submission</p>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting || !uploadedFile}
          className="w-full flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,98,255,0.4)] hover:shadow-[0_4px_28px_rgba(0,98,255,0.6)] hover:-translate-y-0.5">
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" />Submitting...</>
          ) : (
            <><Upload size={16} />Submit for Review</>
          )}
        </button>
      </form>
    </div>
  )
}
