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

export default function App() {
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neutral-800 selection:text-white font-sans overflow-x-hidden">
      {/* Background subtle technical grid */}
      <div className="fixed inset-0 bg-tech-grid opacity-35 pointer-events-none z-0" />

      {/* Main App Content */}
      <div className="relative z-10">
        <Navbar 
          onOpenContact={() => setIsContactOpen(true)}
          onOpenInvestigation={() => setIsInvestigationOpen(true)}
        />

        <main>
          <HeroSection 
            onStartInvestigation={() => setIsInvestigationOpen(true)}
          />

          <SectionEvidenceGraph />
          <SectionInvestigationResult />
          <SectionPipeline />
          <SectionRelationalEvidence />
          <SectionUncertainty />
          <SectionGeneralization />
          <SectionPricing onSelectTier={handleSelectTier} />
          <SectionCTA 
            onStartInvestigation={() => setIsInvestigationOpen(true)}
            onExplorePlatform={handleExplorePlatform}
          />
        </main>

        <Footer 
          onOpenContact={() => setIsContactOpen(true)}
          onOpenInvestigation={() => setIsInvestigationOpen(true)}
        />
      </div>

      {/* Modals */}
      <InvestigationSandboxModal 
        isOpen={isInvestigationOpen}
        onClose={() => setIsInvestigationOpen(false)}
      />

      <ContactModal 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        defaultTier={selectedTier}
      />
    </div>
  );
}
