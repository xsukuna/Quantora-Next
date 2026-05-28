import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle, ShieldAlert, ArrowRight, 
  Loader2, Sparkles, GitFork, Trash2 
} from 'lucide-react';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Contributor' | 'Guest';
  reputation: number;
  badge: string;
  avatarUrl?: string;
}

interface UploadFormProps {
  currentUser: DBUser | null;
  openAuth: () => void;
  onUploadSuccess: () => void;
  forkedFromPaperId?: string | null;
  onClearFork?: () => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ 
  currentUser, openAuth, onUploadSuccess, forkedFromPaperId, onClearFork 
}) => {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState<any>('Macroeconomics');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [references, setReferences] = useState('');
  const [trustLabel, setTrustLabel] = useState<any>('Independent Submission');
  
  // File upload simulation states
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if we are running in forked mode
  useEffect(() => {
    if (forkedFromPaperId) {
      fetch('/api/research')
        .then(res => res.json())
        .then((papers: any[]) => {
          const parent = papers.find(p => p.id === forkedFromPaperId);
          if (parent) {
            setTitle(`Fork of: ${parent.title}`);
            setAbstract(`Forked research branch investigating enhancements.\n\nParent Abstract Context:\n${parent.abstract}`);
            setCategory(parent.category);
            setTagsInput([...parent.tags, 'Fork'].join(', '));
            setReferences(parent.references || '');
            setTrustLabel('Open Draft');
            // pre-simulate file attachment for convenient demo flow
            const dummyFile = new File(["Cloned source fork dataset.pdf"], "cloned_fork_manuscript.pdf", { type: "application/pdf" });
            setFile(dummyFile);
          }
        })
        .catch(err => console.error('Failed to load parent paper for forking:', err));
    }
  }, [forkedFromPaperId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      validateAndSetFile(dropped);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    const validExtensions = ['pdf', 'doc', 'docx', 'html', 'csv', 'zip', 'pptx', 'txt'];
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      alert(`Invalid format. Quantora accepts: ${validExtensions.join(', ').toUpperCase()}`);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuth();
      return;
    }
    if (!file) {
      alert('Please attach your research manuscript file.');
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    setUploadPhase('Uploading manuscript payload...');

    try {
      // 1. Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/research/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error || 'File upload failed');
      }

      setUploadProgress(55);
      setUploadPhase('Extracting metadata & generating AI summary...');

      const uploadData = await uploadRes.json();
      const { url: fileUrl, name: fileName, size: fileSize } = uploadData;

      // 2. Submit paper metadata
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const labelMapping: Record<string, string> = {
        'Independent Submission': 'INDEPENDENT_SUBMISSION',
        'Experimental Research': 'EXPERIMENTAL_RESEARCH',
        'Open Draft': 'OPEN_DRAFT',
        'Verified Research': 'VERIFIED_RESEARCH',
        'Community Reviewed': 'COMMUNITY_REVIEWED',
      };

      const email = currentUser.email || 'scarfaceatwork@outlook.com';

      setUploadProgress(85);
      setUploadPhase('Registering manuscript in global research index...');

      const submitRes = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          abstract,
          category,
          institution: institution || 'Independent Fellow',
          country: country || 'Global',
          tags: tags.length > 0 ? tags : ['General-Research'],
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          references_text: references,
          authorEmail: email,
          trustLabel: labelMapping[trustLabel] || 'INDEPENDENT_SUBMISSION'
        })
      });

      if (!submitRes.ok) {
        const errData = await submitRes.json();
        throw new Error(errData.error || 'Paper registration failed');
      }

      setUploadProgress(100);
      setUploadPhase('Manuscript indexed successfully!');
      setTimeout(() => {
        setUploading(false);
        setIsSuccess(true);
      }, 500);

    } catch (err: any) {
      console.error('Submission pipeline error:', err);
      alert(err.message || 'Failed to submit manuscript. Please try again.');
      setUploading(false);
    }
  };


  const handleReset = () => {
    setTitle('');
    setAbstract('');
    setInstitution('');
    setCountry('');
    setTagsInput('');
    setReferences('');
    setTrustLabel('Independent Submission');
    setFile(null);
    setIsSuccess(false);
    if (onClearFork) onClearFork();
    onUploadSuccess();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#020202] p-8 md:p-12 text-white scrollbar-hide">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Fork indicator header */}
        {forkedFromPaperId && (
          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex justify-between items-center relative overflow-hidden">
            <div className="flex gap-3 items-center">
              <GitFork className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block font-mono">Git Collaborative Fork Corridor</span>
                <span className="text-xs text-white font-bold block truncate max-w-lg">Branching out from original index: {forkedFromPaperId}</span>
              </div>
            </div>
            <button 
              onClick={onClearFork}
              className="p-2 hover:bg-red-600/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
              title="Cancel Fork Clones"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Open Science Gateway</span>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white">Publish Public Research</h2>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-sans">
            QUANTORA-NEXT operates a decentralized peer-to-peer science index. Submit your research data, industry reports, policy critiques, or market algorithms. Once cleared by the editorial board, it will publish instantly to our digital public library.
          </p>
        </div>

        {!currentUser && (
          <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3.5 items-start">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase text-white">Security clearance Required</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed font-sans">You must register your digital credentials and obtain security clearance before uploading documents.</p>
              </div>
            </div>
            <button
              onClick={openAuth}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black uppercase tracking-wider shrink-0 transition-all"
            >
              Request Clearance
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              className="glass border border-emerald-500/20 p-8 rounded-2xl text-center space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase text-white">Manuscript clearance Initiated</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed font-sans">
                  Your research paper <strong>"{title}"</strong> has been successfully submitted and labeled as <strong>"Pending Review"</strong> under the <strong>{trustLabel}</strong> index.
                  The Quantora Editorial Council will verify references and peer credentials within 24 hours.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                  Clearance Completed
                </button>
              </div>
            </motion.div>
          ) : uploading ? (
            <motion.div
              key="uploading"
              className="glass border border-blue-500/20 p-12 rounded-2xl text-center space-y-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <Sparkles className="w-4 h-4 text-cyan-400 absolute top-1 right-1 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Injecting Manuscript</h3>
                <span className="text-[10px] text-blue-400 font-mono block animate-pulse-glow uppercase">{uploadPhase}</span>
              </div>
              
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-md shadow-blue-500/50" 
                    style={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500 block">{uploadProgress}%</span>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Grid 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Research Field Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer font-bold"
                  >
                    <option className="bg-[#050505]" value="Macroeconomics">Macroeconomics</option>
                    <option className="bg-[#050505]" value="Quantitative Finance">Quantitative Finance</option>
                    <option className="bg-[#050505]" value="Public Policy">Public Policy</option>
                    <option className="bg-[#050505]" value="Geopolitics">Geopolitics</option>
                    <option className="bg-[#050505]" value="Technology Insights">Technology Insights</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trust Classification Target</label>
                  <select
                    value={trustLabel}
                    onChange={(e) => setTrustLabel(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer font-bold font-mono"
                  >
                    <option className="bg-[#050505]" value="Independent Submission">Independent Submission</option>
                    <option className="bg-[#050505]" value="Experimental Research">Experimental Research</option>
                    <option className="bg-[#050505]" value="Open Draft">Open Draft</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manuscript Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Decoupling clearing systems in sovereign bonds corridors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all font-bold"
                />
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Research Abstract (Executive Summary)</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Clearly outline the research methodology, findings, data models, and strategic takeaways. Must be written with professional rigor."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500 transition-all leading-relaxed font-sans"
                />
              </div>

              {/* Grid 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Affiliated Institution</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brookings, London School of Economics"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jurisdiction / Country</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United Kingdom, Singapore"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Tags & References */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keywords / Tags (Comma Separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign Debt, Algorithmic, Options Flow"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core References (APA/MLA Format)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kaushik, A. (2026). Broken Promises in the Fields..."
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manuscript Payload File (PDF, HTML, DOC, DOCX, CSV, ZIP, PPTX, TXT)</label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed border-white/10 hover:border-blue-500/50 bg-white/[0.01] hover:bg-blue-600/[0.01] rounded-2xl p-8 text-center transition-all cursor-pointer relative group ${
                    file ? 'border-emerald-500/30 bg-emerald-500/[0.01]' : ''
                  }`}
                >
                  <input
                    type="file"
                    id="manuscript-file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.html,.csv,.zip,.pptx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                      {file ? <FileText className="w-5 h-5 text-emerald-400" /> : <Upload className="w-5 h-5" />}
                    </div>
                    {file ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{file.name}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">{(file.size / 1024).toFixed(1)} KB | Attached Successfully</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-300">Drag & Drop Manuscript or click here</p>
                        <p className="text-[10px] text-gray-500">Supports PDF, HTML, DOC, DOCX, CSV, ZIP, PPTX and TXT (Max 50MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit trigger */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!currentUser || !file}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <span>Submit Manuscript to Editorial Council</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
