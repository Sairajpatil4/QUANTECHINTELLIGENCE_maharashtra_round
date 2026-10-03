import React from 'react';
import { TrustEngineVisualization } from './TrustEngineVisualization';
import type { SelectedEvidenceFiles } from '../utils/fileValidation';

interface HeroSectionProps {
  onStartInvestigation?: (files: SelectedEvidenceFiles) => void;
  onExploreHowItWorks?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartInvestigation }) => {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-transparent pt-16 pb-8">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex items-center justify-center">
        <div className="w-full relative flex items-center justify-center">
          <TrustEngineVisualization onStartInvestigation={onStartInvestigation} />
        </div>
      </div>
    </section>
  );
};

