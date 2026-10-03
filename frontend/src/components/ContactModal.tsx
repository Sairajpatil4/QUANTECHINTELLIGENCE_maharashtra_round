import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  defaultTier,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [inquiryType, setInquiryType] = useState(defaultTier || 'Enterprise Investigation Suite');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !organization.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please provide a valid work email address.');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setOrganization('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-[24px] overflow-y-auto">
      <div 
        className="relative w-full max-w-lg glass-panel-3 glass-sheen rounded-lg shadow-[0_30px_90px_rgba(0,0,0,0.7)] p-6 sm:p-8 border-white/[0.12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#888] hover:text-white rounded glass-btn transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full glass-panel-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">
              Investigation Request Received
            </h3>
            <p className="text-xs text-[#8A8A8A] max-w-sm mx-auto leading-relaxed">
              Our forensic technical intelligence desk will review your inquiry and initiate encrypted dispatch within 4 hours.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="glass-btn-primary px-6 py-2.5 font-semibold text-xs rounded"
              >
                Return to Overview
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>CONTACT FORENSIC DESK</span>
              </div>
              <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                Initiate Platform Inquiry
              </h3>
              <p className="text-xs text-[#8A8A8A] mt-1">
                Deploy cross-modal authenticity defense for your organization.
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded text-red-300 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Julian Vance"
                  className="w-full px-3 py-2 glass-panel-1 rounded border-white/[0.08] text-xs text-white placeholder-[#666] focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                  WORK EMAIL *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full px-3 py-2 glass-panel-1 rounded border-white/[0.08] text-xs text-white placeholder-[#666] focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                  ORGANIZATION / ENTITY *
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Enterprise, Agency, or Defense Unit"
                  className="w-full px-3 py-2 glass-panel-1 rounded border-white/[0.08] text-xs text-white placeholder-[#666] focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                  INQUIRY SCOPE
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-3 py-2 glass-panel-1 rounded border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono bg-[#080808]"
                >
                  <option value="Enterprise Investigation Suite">Enterprise Investigation Suite</option>
                  <option value="Developer API (High Throughput)">Developer API (High Throughput)</option>
                  <option value="Air-Gapped Sovereign Deployment">Air-Gapped Sovereign Deployment</option>
                  <option value="Forensic Expert Testimony">Forensic Case Consultation</option>
                  <option value="Research & Model Collaboration">Academic / Research Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                  CASE CONTEXT OR REQUIREMENTS (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail evidence formats, throughput volume, or incident timelines..."
                  className="w-full px-3 py-2 glass-panel-1 rounded border-white/[0.08] text-xs text-white placeholder-[#666] focus:outline-none focus:border-cyan-400 transition-colors resize-none font-sans"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="glass-btn-primary w-full py-2.5 font-semibold text-xs rounded flex items-center justify-center gap-2"
              >
                <span>Dispatch Inquiry</span>
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
