import React, { useState } from 'react';
import { Layers, Search, GitCompare, FileCheck } from 'lucide-react';

export const SectionPipeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(2);

  const steps = [
    {
      num: '01',
      title: 'COLLECT',
      icon: Layers,
      summary: 'Upload available digital evidence.',
      details: 'Ingests RAW visual streams, audio tracks, document payloads, sidecar EXIF/XMP metadata, and external capture time records into a unified cryptographically hashed evidence vault.',
      keySignals: ['Tamper-evident ingest ledger', 'Sensor profile extraction', 'Multi-source stream alignment'],
    },
    {
      num: '02',
      title: 'ANALYZE',
      icon: Search,
      summary: 'Analyze each available modality.',
      details: 'Evaluates each modality in isolation for local synthetic footprints: diffusion noise variance in pixels, vocoder phase patterns in voice, vector layout artifacts in PDFs, and header anomalies.',
      keySignals: ['PRNU photo response', 'Spectral acoustic harmonics', 'Glyph outline quantization'],
    },
    {
      num: '03',
      title: 'CONNECT',
      icon: GitCompare,
      summary: 'Find relationships and conflicts.',
      details: 'The core innovation: maps physical, temporal, and semantic constraints across modalities. Tests whether lighting angle matches solar time, speech formants match facial muscular movement, and documents match metadata.',
      keySignals: ['Phoneme-viseme temporal parity', 'Photometric solar consistency', 'Causal timestamp ordering'],
    },
    {
      num: '04',
      title: 'EXPLAIN',
      icon: FileCheck,
      summary: 'Show evidence, uncertainty and limitations.',
      details: 'Delivers an auditable, courtroom-ready forensic rationale. Explains why a conclusion was drawn, which relationships broke down, and precisely where uncertainty remains.',
      keySignals: ['Contradiction proof path', 'Bayesian confidence bounds', 'Signed verification manifest'],
    },
  ];

  // 10 repetitions per group ensure continuous, gapless coverage across mobile, tablet, 4K, and ultrawide screens
  const row1Items = Array.from({ length: 10 });
  const row2Items = Array.from({ length: 10 });

  return (
    <section id="capabilities" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08] overflow-hidden">
      {/* Top Label Container */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
          METHODOLOGY ARCHITECTURE
        </div>
      </div>

      {/* Full-Width Dual Continuous Marquee Headline with Subtle Glass Atmosphere */}
      <div className="w-full overflow-hidden mb-8 select-none pointer-events-none relative py-2 bg-white/[0.01] border-y border-white/[0.05] backdrop-blur-[6px]">
        {/* Subtle glass reflection highlight behind marquee */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        
        {/* ROW 1: LEFT → RIGHT ("FROM DETECTION") at 20s linear */}
        <div className="w-full overflow-hidden py-0.5">
          <div className="flex w-max animate-marquee-right">
            {/* Group 1 */}
            <div className="flex shrink-0 items-center">
              {row1Items.map((_, i) => (
                <span
                  key={`r1-g1-${i}`}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] font-sans pr-10 sm:pr-14 lg:pr-16 whitespace-nowrap"
                >
                  FROM DETECTION
                </span>
              ))}
            </div>
            {/* Group 2 (Identical clone for mathematically seamless infinite loop) */}
            <div className="flex shrink-0 items-center">
              {row1Items.map((_, i) => (
                <span
                  key={`r1-g2-${i}`}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] font-sans pr-10 sm:pr-14 lg:pr-16 whitespace-nowrap"
                >
                  FROM DETECTION
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 2: RIGHT → LEFT ("TO INVESTIGATION.") at 23s linear */}
        <div className="w-full overflow-hidden py-0.5">
          <div className="flex w-max animate-marquee-left">
            {/* Group 1 */}
            <div className="flex shrink-0 items-center">
              {row2Items.map((_, i) => (
                <span
                  key={`r2-g1-${i}`}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] font-sans pr-10 sm:pr-14 lg:pr-16 whitespace-nowrap"
                >
                  TO INVESTIGATION.
                </span>
              ))}
            </div>
            {/* Group 2 (Identical clone for mathematically seamless infinite loop) */}
            <div className="flex shrink-0 items-center">
              {row2Items.map((_, i) => (
                <span
                  key={`r2-g2-${i}`}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] font-sans pr-10 sm:pr-14 lg:pr-16 whitespace-nowrap"
                >
                  TO INVESTIGATION.
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Main Section Content Container */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans mb-12">
          Simple binary flags fail under modern adversarial pressure. 
          TrustLayer replaces black-box classification with verifiable, multi-step investigative reasoning.
        </p>

        {/* Four Minimal Columns with Glass Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-b border-white/[0.08] rounded-md overflow-hidden glass-panel-1">
          {steps.map((step, index) => {
            const isSelected = activeStep === index;
            const Icon = step.icon;

            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(index)}
                className={`group relative p-8 lg:p-10 cursor-pointer transition-all duration-200 border-b md:border-b-0 ${
                  index < steps.length - 1 ? 'lg:border-r border-white/[0.08]' : ''
                } ${index % 2 === 0 ? 'md:border-r border-white/[0.08]' : ''} ${
                  isSelected ? 'glass-panel-3 shadow-[0_0_30px_rgba(34,211,238,0.06)]' : 'glass-hover'
                }`}
              >
                {/* Step Number */}
                <div className="text-xs font-mono text-[#666] mb-8 flex items-center justify-between">
                  <span className={`transition-colors ${isSelected ? 'text-white font-bold' : ''}`}>
                    {step.num}
                  </span>
                  <Icon className={`w-4 h-4 transition-colors ${isSelected ? 'text-cyan-400' : 'text-[#666] group-hover:text-[#aaa]'}`} />
                </div>

                {/* Step Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase mb-3 font-sans">
                  {step.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-[#8A8A8A] leading-relaxed mb-6 font-sans">
                  {step.summary}
                </p>

                {/* Detailed Narrative */}
                <div className="text-xs text-[#737373] leading-relaxed border-t border-white/[0.08] pt-4 mb-6">
                  {step.details}
                </div>

                {/* Key Signals */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] font-mono uppercase text-[#666] tracking-wider mb-2">
                    FORENSIC PRIMITIVES
                  </div>
                  {step.keySignals.map((sig) => (
                    <div key={sig} className="flex items-center gap-2 text-[11px] font-mono text-[#999]">
                      <span className="w-1 h-1 rounded-full bg-cyan-400/80" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>

                {/* Active Indicator Bar */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 ${
                    isSelected ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'bg-transparent'
                  }`} 
                />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
