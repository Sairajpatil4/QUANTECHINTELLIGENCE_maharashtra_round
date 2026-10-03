import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTAProps {
  onStartInvestigation: () => void;
  onExplorePlatform: () => void;
}

export const SectionCTA: React.FC<CTAProps> = ({
  onStartInvestigation,
  onExplorePlatform,
}) => {
  return (
    <section className="relative py-16 lg:py-20 bg-transparent overflow-hidden border-b border-white/[0.08]">
      {/* Very faint Trust Engine evidence network in the background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <svg viewBox="0 0 1000 600" className="w-[1200px] max-w-none">
          {/* Concentric rings */}
          <circle cx="500" cy="300" r="180" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="500" cy="300" r="320" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="500" cy="300" r="440" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 5" />
          
          {/* Radiating spoke lines */}
          <line x1="500" y1="300" x2="160" y2="100" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="500" y1="300" x2="840" y2="100" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="500" y1="300" x2="900" y2="350" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="500" y1="300" x2="750" y2="520" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="500" y1="300" x2="250" y2="520" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="500" y1="300" x2="100" y2="350" stroke="#ffffff" strokeWidth="0.8" />

          {/* Node circles */}
          <circle cx="160" cy="100" r="12" fill="#111" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="840" cy="100" r="12" fill="#111" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="900" cy="350" r="12" fill="#111" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="750" cy="520" r="12" fill="#111" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="250" cy="520" r="12" fill="#111" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="100" cy="350" r="12" fill="#111" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="500" cy="300" r="45" fill="#000" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 text-center flex flex-col items-center">
        
        <div className="text-xs font-mono tracking-[0.24em] uppercase text-[#737373] mb-4">
          CONNECTED FORENSICS PLATFORM
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08] mb-6 font-sans max-w-3xl">
          WHAT DOES<br />
          THE EVIDENCE SAY?
        </h2>

        {/* Supporting text */}
        <p className="text-base sm:text-lg text-[#8A8A8A] max-w-xl mb-10 font-sans leading-relaxed">
          Investigate digital content as connected evidence, not isolated files.
        </p>

        {/* Buttons (Glassmorphic System) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStartInvestigation}
            className="glass-btn-primary inline-flex items-center gap-2 h-10 px-5 text-xs font-semibold rounded-[2px]"
          >
            <span>Start Investigation</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>

          <button
            onClick={onExplorePlatform}
            className="glass-btn inline-flex items-center justify-center h-10 px-5 text-xs font-medium text-white rounded-[2px]"
          >
            <span>Explore How It Works</span>
          </button>
        </div>

      </div>
    </section>
  );
};
