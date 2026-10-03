import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SectionEvidenceGraph } from './components/SectionEvidenceGraph';
import { SectionInvestigationResult } from './components/SectionInvestigationResult';
import { SectionPipeline } from './components/SectionPipeline';
import { SectionRelationalEvidence } from './components/SectionRelationalEvidence';
import { SectionUncertainty } from './components/SectionUncertainty';
import { SectionGeneralization } from './components/SectionGeneralization';
import { SectionPricing } from './components/SectionPricing';
import { SectionCTA } from './components/SectionCTA';
import { Footer } from './components/Footer';
import { InvestigationSandboxModal } from './components/ConnectedInvestigationSandboxModal';
import { ContactModal } from './components/ContactModal';
import type { SelectedEvidenceFiles } from './utils/fileValidation';

const EMPTY_EVIDENCE_FILES: SelectedEvidenceFiles = {};

export default function App() {
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);
  const [initialEvidenceFiles, setInitialEvidenceFiles] = useState<SelectedEvidenceFiles>(EMPTY_EVIDENCE_FILES);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');

  const handleSelectTier = (tierName: string) => {
    setSelectedTier(tierName);
    setIsContactOpen(true);
  };

  const handleExplorePlatform = () => {
    const el = document.getElementById('evidence-graph') || document.querySelector('section:nth-of-type(2)');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openInvestigation = (files: SelectedEvidenceFiles = EMPTY_EVIDENCE_FILES) => {
    setInitialEvidenceFiles(files);
    setIsInvestigationOpen(true);
  };

  const closeInvestigation = () => {
    setIsInvestigationOpen(false);
    setInitialEvidenceFiles(EMPTY_EVIDENCE_FILES);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neutral-800 selection:text-white font-sans overflow-x-hidden">
      {/* Background subtle technical grid */}
      <div className="fixed inset-0 bg-tech-grid opacity-35 pointer-events-none z-0" />

      {/* Main App Content */}
      <div className="relative z-10">
        <Navbar 
          onOpenContact={() => setIsContactOpen(true)}
          onOpenInvestigation={() => openInvestigation()}
        />

        <main>
          <HeroSection 
            onStartInvestigation={openInvestigation}
          />

          <SectionEvidenceGraph />
          <SectionInvestigationResult />
          <SectionPipeline />
          <SectionRelationalEvidence />
          <SectionUncertainty />
          <SectionGeneralization />
          <SectionPricing onSelectTier={handleSelectTier} />
          <SectionCTA 
            onStartInvestigation={() => openInvestigation()}
            onExplorePlatform={handleExplorePlatform}
          />
        </main>

        <Footer 
          onOpenContact={() => setIsContactOpen(true)}
          onOpenInvestigation={() => openInvestigation()}
        />
      </div>

      {/* Modals */}
      <InvestigationSandboxModal 
        isOpen={isInvestigationOpen}
        initialFiles={initialEvidenceFiles}
        onClose={closeInvestigation}
      />

      <ContactModal 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        defaultTier={selectedTier}
      />
    </div>
  );
}
