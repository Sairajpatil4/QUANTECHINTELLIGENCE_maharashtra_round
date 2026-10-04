import React, { useState } from 'react';
import { CheckCircle2, Network, HelpCircle, Shield } from 'lucide-react';

export const SectionUncertainty: React.FC = () => {
  const [selectedState, setSelectedState] = useState<number>(2);

  const states = [
    {
      id: 'evidence-aware',
      title: 'EVIDENCE-AWARE',
      icon: CheckCircle2,
      tag: 'Grounded in available signals',
      color: 'text-cyan-300',
      summary: 'Every assessment is grounded in available evidence signals rather than a single detector output.',
      description: 'TrustLayer treats model outputs as one source of information. Their meaning depends on the evidence, context, and limitations in the investigation.',
      decisionThreshold: 'Signals are not standalone proof'
    },
    {
      id: 'cross-modal',
      title: 'CROSS-MODAL',
      icon: Network,
      tag: 'Relationships across evidence',
      color: 'text-cyan-300',
      summary: 'Signals from different evidence types can be connected to reveal relationships and inconsistencies.',
      description: 'Cross-modal reasoning helps organize related sources and questions for review without converting a correlation into an unsupported conclusion.',
      decisionThreshold: 'Connections require interpretation'
    },
    {
      id: 'uncertainty-aware',
      title: 'UNCERTAINTY-AWARE',
      icon: HelpCircle,
      tag: 'Limitations remain visible',
      color: 'text-neutral-300',
      summary: 'TrustLayer communicates limitations instead of presenting complex investigations as absolute truth.',
      description: 'When sources are absent, degraded, or incomplete, that uncertainty belongs in the assessment. Absence of evidence is not proof of authenticity or manipulation.',
      decisionThreshold: 'State what remains unknown'
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
            EVIDENCE, CONTEXT & LIMITATIONS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-6 font-sans">
            TRUST PRINCIPLES.<br />
            EVIDENCE BEFORE CONCLUSIONS.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans">
            Detector and model outputs are signals, not absolute truth. TrustLayer keeps confidence, context, and limitations visible when evidence is incomplete or uncertain.
          </p>
        </div>

        {/* 4 States Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((st, idx) => {
            const isSelected = selectedState === idx;
            const Icon = st.icon;

            return (
              <div
                key={st.id}
                onClick={() => setSelectedState(idx)}
                className={`p-6 sm:p-8 rounded-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'glass-panel-3 border-white/40 shadow-[0_15px_40px_rgba(0,0,0,0.5)]' 
                    : 'glass-panel-1 glass-hover border-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono text-[#666]">STATE 0{idx + 1}</span>
                    <Icon className={`w-4 h-4 ${st.color}`} />
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight font-sans mb-1">
                    {st.title}
                  </h3>

                  <div className="text-[11px] font-mono text-[#8A8A8A] mb-4">
                    {st.tag}
                  </div>

                  <p className="text-xs text-[#A0A0A0] leading-relaxed mb-6 font-sans">
                    {st.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.08] space-y-2">
                  <div className="text-[9px] font-mono uppercase text-[#666]">
                    INVESTIGATION NOTE
                  </div>
                  <div className="text-[11px] font-mono text-neutral-300">
                    {st.decisionThreshold}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected State Detailed Exploration with Glassmorphic Frame */}
        <div className="mt-8 p-6 sm:p-8 glass-panel-2 rounded-md border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-white">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>FORENSIC PRINCIPLE: {states[selectedState].title}</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {states[selectedState].description}
            </p>
          </div>

          <div className="shrink-0 px-4 py-2 glass-panel-1 border-white/[0.12] rounded text-[11px] font-mono text-white">
            EVIDENTIARY AUDIT LOG: SIGNED
          </div>
        </div>

      </div>
    </section>
  );
};
