import React from 'react';
import { ArrowDown, Cpu, Sparkles, ShieldCheck } from 'lucide-react';

export const SectionGeneralization: React.FC = () => {
  const steps = [
    {
      title: 'AVAILABLE EVIDENCE',
      subtitle: 'Images · Video · Audio · Documents · Text · Metadata',
      detail: 'An investigation begins with the sources available. Each source may contain signals, context, or gaps that affect what can be assessed.'
    },
    {
      title: 'EVIDENCE SIGNALS',
      subtitle: 'Indicators with context',
      detail: 'Model and detector outputs are treated as signals to examine alongside source context, not as independent proof or a complete account.'
    },
    {
      title: 'TRUSTLAYER',
      subtitle: 'Cross-Modal Reasoning',
      detail: 'Connect related evidence to examine correlations, inconsistencies, and contextual support across modalities.'
    },
    {
      title: 'INVESTIGATION CONTEXT',
      subtitle: 'Relationships · provenance · limitations',
      detail: 'Relationships may suggest questions for further review. They do not establish a conclusive account of how content was created.'
    },
    {
      title: 'TRUST ASSESSMENT',
      subtitle: 'Explainable and uncertainty-aware',
      detail: 'Summarize what the evidence supports, what remains uncertain, and which limitations constrain the assessment.'
    },
  ];

  return (
    <section id="research" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
            FROM DETECTION. TO INVESTIGATION.
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-6 font-sans">
            EVERY SIGNAL TELLS<br />
            PART OF THE STORY.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans">
            TrustLayer connects available evidence signals into an explainable investigation, communicating uncertainty and limitations instead of claiming certainty.
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
              <span>INVESTIGATION PRINCIPLE // EVIDENCE BEFORE CONCLUSIONS</span>
            </div>
            <div className="text-[11px] font-mono text-[#666]">
              IMAGE · VIDEO · AUDIO · DOCUMENT · TEXT · METADATA
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
