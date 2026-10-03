import React, { useState } from 'react';
import { CheckCircle2, Scissors, Network, HelpCircle, Shield } from 'lucide-react';

export const SectionUncertainty: React.FC = () => {
  const [selectedState, setSelectedState] = useState<number>(3); // default to insufficient evidence to highlight epistemic humility

  const states = [
    {
      id: 'authentic',
      title: 'AUTHENTIC',
      icon: CheckCircle2,
      tag: 'Full Physical Parity',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-800/40',
      bgColor: 'bg-emerald-950/20',
      summary: 'All captured modalities correspond directly to verifiable physical events.',
      description: 'Sensor noise matches camera serial, lighting azimuth matches UTC timestamp, and lip movements match acoustic formants with zero synthetic residuals.',
      decisionThreshold: 'Entropy > 94% across all 6 modality streams'
    },
    {
      id: 'manipulated',
      title: 'MANIPULATED',
      icon: Scissors,
      tag: 'Localized Tampering',
      color: 'text-orange-400',
      borderColor: 'border-orange-800/40',
      bgColor: 'bg-orange-950/20',
      summary: 'An authentic baseline capture has had localized segments inserted, spliced, or deleted.',
      description: 'Background environment and device metadata are legitimate, but specific bounding boxes (e.g. face swaps or document signatures) display localized editing boundaries.',
      decisionThreshold: 'Discrete spatial/temporal boundary anomaly detected'
    },
    {
      id: 'coordinated',
      title: 'COORDINATED SYNTHETIC',
      icon: Network,
      tag: 'Multi-Modal Generation',
      color: 'text-amber-400',
      borderColor: 'border-amber-800/40',
      bgColor: 'bg-amber-950/20',
      summary: 'Multiple synthetic modalities generated simultaneously to fabricate a non-existent event.',
      description: 'Generative AI produces synchronous synthetic voice, synthetic video, and forged metadata. Detected through micro-desynchronizations in underlying physics and formant timings.',
      decisionThreshold: 'Synthetic generator signatures verified across multiple assets'
    },
    {
      id: 'insufficient',
      title: 'INSUFFICIENT EVIDENCE',
      icon: HelpCircle,
      tag: 'Epistemic Humility',
      color: 'text-neutral-300',
      borderColor: 'border-neutral-700',
      bgColor: 'bg-neutral-900/50',
      summary: 'When compression, resolution, or signal entropy is too low, TrustLayer refuses to guess.',
      description: 'Adversarial systems often rely on extreme re-compression to destroy forensic artifacts. TrustLayer quantifies informational entropy and alerts the investigator rather than hallucinating a false verdict.',
      decisionThreshold: 'Information loss exceeds forensic certainty bounds'
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
            EPISTEMIC CALIBRATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-6 font-sans">
            KNOW WHEN<br />
            YOU DON'T KNOW.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans">
            A reliable forensic system must know the limits of its own perception. 
            TrustLayer mathematically bounds uncertainty and never forces a conclusion when evidence is degraded or absent.
          </p>
        </div>

        {/* 4 States Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    BOUNDING CRITERIA
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
