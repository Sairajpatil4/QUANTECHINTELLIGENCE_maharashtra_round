import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenContact: () => void;
  onOpenInvestigation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact, onOpenInvestigation }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/65 backdrop-blur-[20px] border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
        
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-10">
          <a
            href="#"
            className="flex items-center gap-2 text-sm font-bold tracking-[0.16em] text-white uppercase font-sans select-none group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] transition-shadow group-hover:shadow-[0_0_12px_rgba(34,211,238,1)]" />
            <span className="tracking-[0.18em]">TRUSTLAYER</span>
          </a>
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenInvestigation}
            className="glass-btn-primary flex items-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-[2px]"
          >
            <span>Investigation Sandbox</span>
            <ArrowRight className="w-3 h-3 text-black" />
          </button>

          <button
            onClick={onOpenContact}
            className="glass-btn flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium text-white rounded-[2px]"
          >
            <span>Contact</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#8A8A8A] hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.08] px-6 py-5 space-y-3">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInvestigation();
            }}
            className="glass-btn-primary w-full text-center px-4 py-2 text-xs font-semibold rounded-[3px] flex items-center justify-center gap-2"
          >
            <span>Investigation Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenContact();
            }}
            className="glass-btn w-full text-center px-4 py-2 text-xs font-medium text-white rounded-[3px]"
          >
            Contact Desk
          </button>
        </div>
      )}
    </header>
  );
};
