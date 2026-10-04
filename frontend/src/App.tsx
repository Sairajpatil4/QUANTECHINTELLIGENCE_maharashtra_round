import React, { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustEngineVisualization } from './components/TrustEngineVisualization';
import { InvestigationSandboxModal } from './components/ConnectedInvestigationSandboxModal';
import type { SelectedEvidenceFiles } from './utils/fileValidation';

const EMPTY_EVIDENCE_FILES: SelectedEvidenceFiles = {};

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'investigation'>(() =>
    window.location.hash === '#investigation' ? 'investigation' : 'landing',
  );
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);
  const [initialEvidenceFiles, setInitialEvidenceFiles] = useState<SelectedEvidenceFiles>(EMPTY_EVIDENCE_FILES);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const syncViewWithLocation = () => {
      setCurrentView(window.location.hash === '#investigation' ? 'investigation' : 'landing');
    };
    window.addEventListener('popstate', syncViewWithLocation);
    return () => window.removeEventListener('popstate', syncViewWithLocation);
  }, []);

  useEffect(() => {
    const syncBackgroundPlayback = () => {
      const video = backgroundVideoRef.current;
      if (!video) return;

      if (document.visibilityState === 'visible') {
        void video.play().catch(() => {
          // Native autoplay remains enabled; the browser may defer playback until visible.
        });
      }
    };

    syncBackgroundPlayback();
    document.addEventListener('visibilitychange', syncBackgroundPlayback);
    return () => document.removeEventListener('visibilitychange', syncBackgroundPlayback);
  }, [currentView]);

  const showInvestigation = () => {
    window.history.pushState({}, '', '#investigation');
    setCurrentView('investigation');
  };

  const showLanding = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setCurrentView('landing');
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
    <div className="min-h-screen bg-[#0c0c0c] text-white selection:bg-neutral-800 selection:text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <video
          ref={backgroundVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={(event) => {
            if (document.visibilityState === 'visible') {
              void event.currentTarget.play().catch(() => undefined);
            }
          }}
          className="w-full h-full object-cover pointer-events-none"
          src={currentView === 'landing'
            ? 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4'
            : 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_084718_72a17915-4964-4059-afcd-22d59399b72e.mp4'}
        />
      </div>

      {/* Main App Content */}
      <div className="relative z-10">
        <Navbar
          isInvestigationView={currentView === 'investigation'}
          onOpenInvestigation={showInvestigation}
          onGoHome={showLanding}
        />

        <main>
          {currentView === 'landing' ? (
            <HeroSection onStartInvestigation={showInvestigation} />
          ) : (
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent pt-16">
              <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 relative z-10">
                <TrustEngineVisualization onStartInvestigation={openInvestigation} />
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modals */}
      <InvestigationSandboxModal 
        isOpen={isInvestigationOpen}
        initialFiles={initialEvidenceFiles}
        onClose={closeInvestigation}
      />


    </div>
  );
}
