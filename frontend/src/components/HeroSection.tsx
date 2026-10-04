import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartInvestigation?: () => void;
  onExploreHowItWorks?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartInvestigation }) => {
  return (
    <section id="top" className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-transparent pt-20 pb-8">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex items-center justify-center">
        <div className="w-full relative flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mb-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-white font-sans">
              Digital Authenticity,<br />
              <span className="animate-shiny bg-[length:200%_auto] bg-clip-text text-transparent">Reconstructed.</span>
            </h1>
            <p className="max-w-3xl mx-auto mt-5 text-sm sm:text-base text-[#B3B3B3] leading-relaxed font-sans">
              TrustLayer investigates digital evidence across images, video, audio, documents, text, and metadata — connecting signals into explainable assessments of authenticity and trust.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <button onClick={onStartInvestigation} className="glass-btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold">
                Start an Investigation <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] text-white/55">Analyze digital evidence with AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

