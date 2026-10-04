import React from 'react';

interface FooterProps {
  onOpenInvestigation: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInvestigation }) => {
  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-transparent backdrop-blur-[6px] text-[#8A8A8A] py-16 border-t border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 pb-12 border-b border-white/[0.08]">
          
          {/* Brand & Tagline */}
          <div className="space-y-3 max-w-sm">
            <a
              href="#"
              className="flex items-center gap-2 text-base font-bold tracking-[0.18em] text-white hover:text-white/90 uppercase font-sans select-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span>TRUSTLAYER</span>
            </a>
            <p className="text-xs text-[#8A8A8A] font-sans">
              Digital authenticity, reconstructed.
            </p>
            <div className="text-[11px] text-[#666] font-mono leading-relaxed pt-2">
              Evidence-led digital authenticity investigations across images, video, audio, documents, text, and metadata.
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono">
            {[
              ['Platform', '#product'],
              ['How It Works', '#capabilities'],
              ['Evidence', '#how-it-works'],
              ['Investigation', '#investigations'],
              ['About', '#research'],
              ['Privacy', '#privacy'],
              ['Terms', '#terms'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={(event) => {
                  event.preventDefault();
                  handleScroll(href);
                }}
                className="hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
            <button
              onClick={onOpenInvestigation}
              className="hover:text-white transition-colors text-left"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Bottom Bar: Operational Indicator & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#666]">
          
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="tracking-wider">SYSTEM OPERATIONAL</span>
          </div>

          <div>
            © 2026 TrustLayer
          </div>

        </div>

      </div>
    </footer>
  );
};
