import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface InvestigationStagesProps {
  onStartInvestigation: () => void;
}

export const SectionInvestigationStages: React.FC<InvestigationStagesProps> = ({ onStartInvestigation }) => {
  const stages = [
    {
      name: '01 · DETECT',
      badge: 'Evidence signals',
      description: 'Identify meaningful signals across the digital evidence that is available.',
      features: ['Signal detection', 'Evidence extraction', 'Artifact analysis'],
      cta: 'Explore Detection',
      highlighted: false,
    },
    {
      name: '02 · CORRELATE',
      badge: 'Cross-modal reasoning',
      description: 'Connect signals across modalities to identify relationships, conflicts, and supporting evidence.',
      features: ['Cross-modal reasoning', 'Signal relationships', 'Evidence correlation'],
      cta: 'Explore Correlation',
      highlighted: true,
    },
    {
      name: '03 · INVESTIGATE',
      badge: 'Explainable assessment',
      description: 'Turn connected evidence into an explainable trust assessment with clear limitations.',
      features: ['Trust assessment', 'Evidence graph', 'Investigation explanation'],
      cta: 'Start Investigation',
      highlighted: false,
    },
  ];

  return (
    <section id="investigation-stages" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
            FROM DETECTION. TO INVESTIGATION.
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-6 font-sans">
            Evidence first.<br />
            Conclusions second.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans">
            Move from individual signals to connected evidence, then review an explainable assessment with its context and limitations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <div
              key={stage.name}
              className={`p-8 rounded-md flex flex-col justify-between transition-all duration-200 ${
                stage.highlighted
                  ? 'glass-panel-3 glass-sheen border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
                  : 'glass-panel-1 glass-hover border-white/[0.08]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-wider text-white">
                    {stage.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded glass-panel-1 border-white/[0.12]">
                    {stage.badge}
                  </span>
                </div>

                <p className="text-xs text-[#999] leading-relaxed mb-8 font-sans">
                  {stage.description}
                </p>

                <div className="space-y-3 pt-6 border-t border-white/[0.08] mb-8">
                  {stage.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={stage.name.startsWith('03') ? onStartInvestigation : () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full py-3 px-4 rounded-[3px] text-xs font-semibold tracking-wide flex items-center justify-center gap-2 ${
                  stage.highlighted ? 'glass-btn-primary' : 'glass-btn text-white'
                }`}
              >
                <span>{stage.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
