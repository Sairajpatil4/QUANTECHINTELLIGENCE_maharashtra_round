import React from 'react';
import { ArrowDown, Cpu, Sparkles, ShieldCheck } from 'lucide-react';

export const SectionGeneralization: React.FC = () => {
  const steps = [
    {
      title: 'KNOWN PATTERNS',
      subtitle: 'Existing GAN, Diffusion & Vocoder Artifacts',
      detail: 'Traditional detectors memorize specific model weights and generator fingerprints. When generators update, detection degrades.'
    },
    {
      title: 'TRAINING',
      subtitle: 'Physical & Causal Invariant Modeling',
      detail: 'Rather than memorizing pixel artifacts, TrustLayer trains models to recognize physical conservation laws, optical mechanics, and temporal causality.'
    },
    {
      title: 'TRUSTLAYER',
      subtitle: 'Cross-Modal Relational Reasoning Engine',
      detail: 'Operates as an overarching arbiter comparing sensory streams against real-world physics and cross-modal consistency.'
    },
    {
      title: 'UNSEEN PATTERNS',
      subtitle: 'Zero-Day Generative Architectures',
      detail: 'When novel generation methods emerge that leave zero known artifact signatures, their cross-modal relationships still break real-world physics.'
    },
    {
      title: 'GENERALIZATION',
      subtitle: 'Robust Long-Horizon Detection',
      detail: 'Guarantees resilience against future AI generations without requiring continuous retraining or retraining lag.'
    },
  ];

  return (
    <section id="research" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
            RESEARCH & GENERALIZATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-6 font-sans">
            BUILT FOR<br />
            UNSEEN MANIPULATION.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans">
            Detection models that memorize training distributions fail against tomorrow's generative engines. 
            TrustLayer models invariant causal physics across modalities, enabling zero-shot generalization.
          </p>
        </div>

        {/* Minimal Technical Diagram with Glass Housing */}
        <div className="max-w-3xl mx-auto glass-panel-2 rounded-lg p-8 sm:p-12 relative border-white/[0.08]">
          
          <div className="space-y-6 relative">
            {steps.map((step, idx) => {
              const isCenter = step.title === 'TRUSTLAYER';

              return (
                <React.Fragment key={step.title}>
                  <div 
                    className={`p-6 rounded-md transition-all duration-200 ${
                      isCenter
                        ? 'glass-panel-3 glass-sheen border-white/30 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                        : 'glass-panel-1 border-white/[0.06]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        {isCenter && <Sparkles className="w-4 h-4 text-cyan-400" />}
                        <h3 className={`text-base font-bold font-mono tracking-wider uppercase ${isCenter ? 'text-white' : 'text-neutral-200'}`}>
                          {step.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-cyan-400/80">
                        {step.subtitle}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                      {step.detail}
                    </p>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="flex flex-col items-center">
                        <div className="w-[1px] h-4 bg-white/20" />
                        <ArrowDown className="w-3.5 h-3.5 text-[#888]" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A8A8A]">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>THEORETICAL FOUNDATION // PHYSICAL INVARIANT CONSTRAINTS</span>
            </div>
            <div className="text-[11px] font-mono text-[#666]">
              PUBLISHED RESEARCH WORKING PAPERS AVAILABLE UPON REQUEST
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
