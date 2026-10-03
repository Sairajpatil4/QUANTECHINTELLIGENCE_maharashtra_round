import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Volume2, 
  FileText, 
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  SplitSquareVertical
} from 'lucide-react';

export const SectionRelationalEvidence: React.FC = () => {
  const [viewMode, setViewMode] = useState<'connected' | 'isolated'>('connected');

  const evidenceSteps = [
    {
      id: 'image',
      label: 'IMAGE',
      icon: ImageIcon,
      isolated: 'Looks authentic (Diffusion score within benign range)',
      connected: 'Facial illumination angle conflicts with background shadows',
      status: 'conflict'
    },
    {
      id: 'video',
      label: 'VIDEO',
      icon: VideoIcon,
      isolated: 'Consistent frame rates and zero spatial blur artifacts',
      connected: 'Lip micro-landmarks desynchronized with audio formants',
      status: 'conflict'
    },
    {
      id: 'audio',
      label: 'AUDIO',
      icon: Volume2,
      isolated: 'High fidelity human voice timbre, no vocoder spikes',
      connected: 'Reverb impulse response indicates indoor room, video is outdoors',
      status: 'conflict'
    },
    {
      id: 'document',
      label: 'DOCUMENT',
      icon: FileText,
      isolated: 'Authentic digital layout and font typography',
      connected: 'Sign-off timestamp precedes video recording by 48 hours',
      status: 'conflict'
    },
    {
      id: 'text',
      label: 'TEXT',
      icon: MessageSquare,
      isolated: 'Plausible grammatical phrasing and corporate vocabulary',
      connected: 'Stylometric token entropy confirms synthetic LLM generation',
      status: 'conflict'
    },
  ];

  return (
    <section id="product" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08] relative overflow-hidden">
      {/* Background soft radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
            RELATIONAL FORENSICS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-6 font-sans">
            ONE PIECE OF EVIDENCE<br />
            IS NEVER THE WHOLE STORY.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans">
            Generative AI can make individual images, voices, videos and documents convincing. 
            The strongest signals often appear in the relationships between them.
          </p>
        </div>

        {/* Interactive Mode Switcher */}
        <div className="flex items-center gap-2 mb-10 p-1 glass-panel-1 rounded-md max-w-fit border-white/[0.08]">
          <button
            onClick={() => setViewMode('connected')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded transition-all duration-200 ${
              viewMode === 'connected'
                ? 'glass-panel-3 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)] border-cyan-400/40'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRUSTLAYER CROSS-MODAL REASONING</span>
          </button>

          <button
            onClick={() => setViewMode('isolated')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded transition-all duration-200 ${
              viewMode === 'isolated'
                ? 'glass-panel-3 text-white shadow-sm border-white/20'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-[#8A8A8A]" />
            <span>ISOLATED FILE ANALYSIS</span>
          </button>
        </div>

        {/* Minimalist Horizontal Evidence Pipeline with Glass Frame */}
        <div className="relative glass-panel-2 rounded-lg p-6 sm:p-10 mb-12 border-white/[0.08]">
          
          <div className="text-[11px] font-mono uppercase text-[#737373] mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>EVIDENCE CONDUIT GRAPH</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </span>
            <span className="text-neutral-400 font-normal">
              {viewMode === 'connected' 
                ? '5 Modalities cross-referenced in real-time' 
                : 'Siloed single-file inspectors (vulnerable to synthetic coherence)'}
            </span>
          </div>

          {/* Horizontal Grid of Evidence Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 relative">
            {evidenceSteps.map((step, idx) => (
              <div 
                key={step.id} 
                className={`relative p-5 rounded-md glass-panel-1 glass-hover border-white/[0.08] ${
                  viewMode === 'connected' ? 'border-t-white/20' : ''
                }`}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <step.icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold tracking-wider text-white">
                      {step.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#666]">0{idx + 1}</span>
                </div>

                {/* Content based on view mode */}
                <div className="min-h-[75px] text-xs leading-relaxed font-sans">
                  {viewMode === 'connected' ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[9.5px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.12)]">
                        <span>⚠ CONTRADICTION DETECTED</span>
                      </div>
                      <p className="text-[#B3B3B3] text-xs">
                        {step.connected}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[9.5px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/40">
                        <span>✓ PASSED STANDALONE</span>
                      </div>
                      <p className="text-[#888] text-xs">
                        {step.isolated}
                      </p>
                    </div>
                  )}
                </div>

                {/* Connector Arrow for desktop */}
                {idx < evidenceSteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass-panel-2 border-white/[0.12] items-center justify-center text-[#888]">
                    <ArrowRight className="w-3 h-3 text-[#999]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Conduit Convergence into Trust Engine */}
          <div className="mt-10 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full glass-panel-2 border-white/[0.2] flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <span className="text-xs font-mono font-bold text-cyan-400">TL</span>
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest uppercase text-white font-sans">
                  TRUST ENGINE REASONING CORE
                </div>
                <div className="text-[11px] font-mono text-[#8A8A8A]">
                  Synthesizes cross-modal graph invariants to establish causal authenticity
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-[#121212] border border-[#242424] rounded text-[11px] font-mono text-[#AAA]">
                CORRELATION MATRIX: <span className="text-white font-bold">ACTIVE</span>
              </div>
              <div className="px-3 py-1 bg-[#121212] border border-[#242424] rounded text-[11px] font-mono text-[#AAA]">
                EPISTEMIC SENSITIVITY: <span className="text-cyan-400 font-bold">HIGH</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
