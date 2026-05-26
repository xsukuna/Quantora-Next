import React, { useState, useEffect } from 'react';
import { 
  Leaf, Download, Globe, Database, Award, HeartHandshake 
} from 'lucide-react';

export const ClimateHub: React.FC = () => {
  const [co2Saved, setCo2Saved] = useState(0.045);
  const [clickCount, setClickCount] = useState(0);
  const [downloads, setDownloads] = useState({
    refinery: 1420,
    methane: 840,
    pipelines: 2110
  });

  // Dynamic real-time increment representing dark theme session efficiency savings
  useEffect(() => {
    const interval = setInterval(() => {
      // 0.002g saved per second of dark mode active usage
      setCo2Saved(prev => Number((prev + 0.002).toFixed(5)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInteractionClick = () => {
    // 0.05g saved per interaction/click event
    setCo2Saved(prev => Number((prev + 0.05).toFixed(5)));
    setClickCount(prev => prev + 1);
  };

  const handleDownload = (key: 'refinery' | 'methane' | 'pipelines') => {
    setDownloads(prev => ({
      ...prev,
      [key]: prev[key] + 1
    }));
    // 0.15g saved per environmental dataset accessed
    setCo2Saved(prev => Number((prev + 0.15).toFixed(5)));
    
    // Simulate file download
    const element = document.createElement("a");
    const file = new Blob(["Mock Carbon Dataset values under Quantora climate registries."], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = `quantora_climate_${key}_2026.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div 
      onClick={handleInteractionClick} 
      className="flex-1 overflow-y-auto bg-[#020202] text-white p-8 md:p-12 scrollbar-hide select-none"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Cinematic Header */}
        <div className="space-y-3 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Leaf className="w-3.5 h-3.5 animate-pulse" />
            <span>Green Digital Infrastructure</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white">
            Environmental Responsibility Hub
          </h2>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-sans max-w-2xl">
            QUANTORA-NEXT operates under strict carbon-aware computational protocols. We minimize payload delivery headers, host on zero-emissions servers, and default to energy-efficient glassmorphic dark layouts to decrease global internet footprint.
          </p>
        </div>

        {/* Dynamic Real-time CO2 Counter Widget */}
        <div className="glass rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Active Session Footprint Audit</span>
            <h3 className="text-lg font-black uppercase text-white tracking-widest">Dynamic Carbon Avoidance</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md font-sans">
              Due to Quantora's dark-mode color matrices and dynamic client routing, your active session is actively preventing greenhouse gas emissions.
            </p>
          </div>

          <div className="text-center md:text-right shrink-0 relative z-10">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Avoided Greenhouse CO₂ Emissions</span>
            <div className="text-3xl md:text-4xl font-black text-emerald-400 font-mono mt-1 animate-pulse-glow flex items-center justify-center md:justify-end gap-1.5">
              <span>{co2Saved.toFixed(4)}</span>
              <span className="text-xs text-gray-500 font-normal uppercase">grams</span>
            </div>
            <span className="text-[8px] text-gray-500 font-mono font-bold uppercase mt-1.5 block">
              Clicks tracked: {clickCount} | dark routing: active
            </span>
          </div>
        </div>

        {/* Environmental Commitment Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-xl border border-white/5 p-6 space-y-4">
            <div className="flex gap-3 items-center">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-black uppercase text-white tracking-widest">Sovereign Climate Research</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              We coordinate dedicated open-access libraries indexing environmental policy papers, rare-earth refinery logs, and clean energy transition pipeline datasets to assist global NGOs and think tanks.
            </p>
          </div>

          <div className="glass rounded-xl border border-white/5 p-6 space-y-4">
            <div className="flex gap-3 items-center">
              <Award className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-black uppercase text-white tracking-widest">Carbon Neutral Credentials</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Our digital routing nodes are certified carbon neutral by Zurich Sovereign Audits. Every byte delivered on the Quantora network is offset by institutional allocations in clean reforestation credits.
            </p>
          </div>
        </div>

        {/* Open Climate Datasets Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>Open Climate & Sustainability Datasets</span>
          </h4>

          <div className="space-y-3">
            {[
              {
                key: 'refinery',
                title: 'Global rare-earth refinery carbon footprints index',
                desc: 'Raw annual carbon footprint values and processing volumes across major refinery nodes.',
                format: '.CSV (1.4MB)'
              },
              {
                key: 'methane',
                title: 'Emerging market agricultural methane vectors',
                desc: 'Detailed sector metrics mapping agricultural methane emissions across G20 farm households.',
                format: '.CSV (840KB)'
              },
              {
                key: 'pipelines',
                title: 'Lithium pipeline processing environmental logs',
                desc: 'Bilateral transit pipelines carbon vectorsstress logs across transit choke-points.',
                format: '.CSV (2.1MB)'
              }
            ].map(dataset => (
              <div
                key={dataset.key}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(dataset.key as any);
                }}
                className="glass border border-white/5 hover:border-emerald-500/20 p-5 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="space-y-1 pr-4 min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {dataset.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-normal truncate font-sans">
                    {dataset.desc}
                  </p>
                </div>

                <div className="flex gap-4 items-center shrink-0 text-[10px] font-mono text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>{(downloads as any)[dataset.key]}</span>
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider">
                    {dataset.format}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional footer disclaimer */}
        <div className="flex gap-3.5 items-start p-5 bg-emerald-950/10 border border-emerald-500/20 rounded-xl relative select-none">
          <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase text-white">Carbon Aware Statement</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed font-sans">
              All quantitative parameters represented are simulated based on institutional dark mode server standards. Click events trigger micro carbon savings auditing vectors dynamically inside the client-side session thread.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
