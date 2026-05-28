'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, BookOpen, User, FolderGit2, Info, Building2 } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'PAPER' | 'AUTHOR' | 'STREAM' | 'DATASET' | 'INSTITUTION';
  x: number;
  y: number;
  details: string;
}

interface Link {
  source: string;
  target: string;
}

export const AiGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes: Node[] = [
    { id: '1', label: 'Broken Promises exposé', type: 'PAPER', x: 200, y: 150, details: 'A 26-year forensic audit of Indian agricultural welfare budgets, exploring credit diversions and farming sector suicide distributions.' },
    { id: '2', label: 'Aditya Kaushik', type: 'AUTHOR', x: 380, y: 100, details: 'Lead Public Policy Fellow researching micro-expenditure leakage algorithms and rural agricultural credit systems. ORCID ID: 0000-0002-1825-0097.' },
    { id: '3', label: 'Public Policy', type: 'STREAM', x: 550, y: 180, details: 'The centralized Knowledge Stream analyzing rural-urban wealth chasms, governance transparency, and direct income policy performance.' },
    { id: '4', label: 'NABARD credit database', type: 'DATASET', x: 380, y: 260, details: 'Historical Relational Database records mapping Southern India vs Northern/Eastern micro-loan distributions and defaults (FY00-FY26).' },
    { id: '5', label: 'Sovereign Debt Volatility', type: 'PAPER', x: 550, y: 80, details: 'Empirical research stress-testing emerging economy debt curves under macroeconomic shocks.' },
    { id: '6', label: 'Reserve Bank of India', type: 'INSTITUTION', x: 720, y: 120, details: 'Apex monetary authority overseeing national credit subvention and public debt management paradigms.' },
    { id: '7', label: 'Macroeconomics stream', type: 'STREAM', x: 700, y: 240, details: 'Dynamic Knowledge Stream coordinating sovereign debt curves, pricing vectors, and currency channels.' },
    { id: '8', label: 'Delhi Technological Univ', type: 'INSTITUTION', x: 800, y: 200, details: 'Public research institution backing Aditya Kaushik\'s regional agricultural credit forensics.' },
    { id: '9', label: 'ISI New Delhi', type: 'INSTITUTION', x: 220, y: 50, details: 'Apex statistical body in India backing Aditya Kaushik\'s regional agricultural credit forensics.' },
  ];

  const links: Link[] = [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '2', target: '3' },
    { source: '4', target: '3' },
    { source: '5', target: '2' },
    { source: '5', target: '7' },
    { source: '6', target: '7' },
    { source: '2', target: '7' }, // Inter-disciplinary research room connection
    { source: '2', target: '9' }, // Aditya to ISI
    { source: '2', target: '8' }, // Aditya to DTU
  ];

  const nodeColor = (type: Node['type']) => {
    switch (type) {
      case 'PAPER': return 'fill-[#FF7050] stroke-[#FF7050]/40';
      case 'AUTHOR': return 'fill-[#0062FF] stroke-[#0062FF]/40';
      case 'STREAM': return 'fill-[#00F0FF] stroke-[#00F0FF]/40';
      case 'DATASET': return 'fill-[#a855f7] stroke-[#a855f7]/40';
      case 'INSTITUTION': return 'fill-[#10B981] stroke-[#10B981]/40';
    }
  };

  const nodeIcon = (type: Node['type']) => {
    switch (type) {
      case 'PAPER': return <BookOpen className="w-3.5 h-3.5 text-[#FF7050]" />;
      case 'AUTHOR': return <User className="w-3.5 h-3.5 text-[#0062FF]" />;
      case 'STREAM': return <Network className="w-3.5 h-3.5 text-[#00F0FF]" />;
      case 'DATASET': return <FolderGit2 className="w-3.5 h-3.5 text-[#a855f7]" />;
      case 'INSTITUTION': return <Building2 className="w-3.5 h-3.5 text-[#10B981]" />;
    }
  };

  return (
    <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 h-full flex flex-col justify-between">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0062FF]" />
            <span>AI Knowledge Graph Network</span>
          </h3>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
            Dynamic relational index between papers, authors, and datasets.
          </p>
        </div>
        <div className="flex gap-4 text-[9px] font-mono font-bold uppercase text-gray-500">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#FF7050]" /> Paper</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#0062FF]" /> Author</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" /> Stream</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" /> Dataset</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Institution</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative flex-1 bg-black/40 border border-white/5 rounded-xl min-h-[300px] overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 900 350">
          
          {/* Dynamic Links */}
          {links.map((link, idx) => {
            const sNode = nodes.find(n => n.id === link.source);
            const tNode = nodes.find(n => n.id === link.target);
            if (!sNode || !tNode) return null;

            const isRelated = hoveredNode === link.source || hoveredNode === link.target;

            return (
              <motion.line
                key={idx}
                x1={sNode.x}
                y1={sNode.y}
                x2={tNode.x}
                y2={tNode.y}
                stroke={isRelated ? '#00F0FF' : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth={isRelated ? 1.5 : 1}
                animate={{ strokeOpacity: isRelated ? 0.8 : 0.4 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Interactive Nodes */}
          {nodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;

            return (
              <g 
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node)}
              >
                {/* Node Ring */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered || isSelected ? 16 : 10}
                  className={`${nodeColor(node.type)}`}
                  strokeWidth={isHovered || isSelected ? 3 : 1}
                  animate={{ scale: isHovered || isSelected ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
                
                {/* Glow Ring */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={22}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth={1}
                    className="animate-ping"
                    style={{ opacity: 0.3 }}
                  />
                )}

                {/* Node Text */}
                <text
                  x={node.x}
                  y={node.y + (isHovered || isSelected ? 30 : 22)}
                  textAnchor="middle"
                  fill={isHovered || isSelected ? '#FFFFFF' : '#A0AEC0'}
                  className="text-[9px] font-bold uppercase tracking-wider select-none font-mono"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Box Overlay */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              className="absolute bottom-4 left-4 right-4 bg-[#0a0f1e]/95 border border-[#0062FF]/30 p-4 rounded-xl shadow-2xl flex gap-4 backdrop-blur-md select-none z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {nodeIcon(selectedNode.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{selectedNode.label}</span>
                  <span className="text-[8px] font-mono text-gray-500 uppercase">{selectedNode.type}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed mt-1">{selectedNode.details}</p>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-[10px] font-bold text-[#FF7050] self-start uppercase hover:underline shrink-0"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Graph Instruction Banner */}
        {!selectedNode && (
          <div className="absolute top-3 left-3 bg-[#0a0f1e]/40 border border-white/5 rounded-lg px-2.5 py-1 text-[9px] text-gray-500 uppercase tracking-widest font-mono flex items-center gap-1.5 select-none pointer-events-none">
            <Info size={10} />
            <span>Hover nodes to trace relationships · Click to inspect</span>
          </div>
        )}
      </div>

    </div>
  );
};
