import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export const SectionInvestigationResult: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const cases = [
    {
      id: 'case-902',
      caseNumber: 'INV-2026-0902',
      title: 'Multimodal Deepfake Impersonation of Financial Director',
      targetSubject: 'CFO Video Call & Authorization Audio',
      verdict: 'COORDINATED SYNTHETIC',
      confidence: 87,
      signals: [
        { label: 'VISUAL INCONSISTENCY', detail: 'Lip kinematics exhibit 140ms phase delay vs acoustic formants', status: 'conflict' },
        { label: 'AUDIO/VIDEO MISMATCH', detail: 'Acoustic room reverberation does not match visual room geometry', status: 'conflict' },
        { label: 'CHRONOLOGY CONFLICT', detail: 'Timestamp header indicates 10:14 AM while background solar angle indicates 03:45 PM', status: 'conflict' },
        { label: 'VECTOR COHERENCE', detail: 'PDF authorization letter header shows re-quantized glyph outlines', status: 'conflict' },
      ],
      supportingSignals: [
        { modality: 'VISUAL', metric: 'Synthetic Likelihood', score: 82, note: 'Diffusion noise variance in facial mesh' },
        { modality: 'AUDIO', metric: 'Vocoder Footprint', score: 91, note: 'Synthesized neural phase cutoff at 16.2kHz' },
        { modality: 'TEXT', metric: 'Stylometric Coherence', score: 79, note: 'Synthesized lexical token pattern' },
      ],
      limitations: 'Independent original RAW sensor file unavailable for hardware PRNU verification.',
      why: 'Analysis across 4 independent modalities reveals coordinated generative synthesis. Local visual manipulation alone could not explain the synchronous vocoder phase cutoff and solar angle contradiction.',
    },
    {
      id: 'case-841',
      caseNumber: 'INV-2026-0841',
      title: 'Geopolitical Press Release & Audio Briefing Leak',
      targetSubject: 'Embassy Spokesperson Briefing',
      verdict: 'TARGETED MANIPULATION',
      confidence: 93,
      signals: [
        { label: 'PHOTO SENSOR PROFILE', detail: 'Camera PRNU fingerprint matches authenticated Nikon D850', status: 'consistent' },
        { label: 'AUDIO TRACK INSERTION', detail: 'Background room ambience drops 8dB during key sentence insertion', status: 'conflict' },
        { label: 'SEMANTIC INVARIANT', detail: 'Transcript phrasing contradicts concurrent diplomatic cable transmission', status: 'conflict' },
      ],
      supportingSignals: [
        { modality: 'AUDIO', metric: 'Acoustic Splicing', score: 94, note: 'Decibel floor drop & phase discontinuity' },
        { modality: 'VISUAL', metric: 'Authentic Baseline', score: 88, note: 'Original camera PRNU verified' },
        { modality: 'DOCUMENT', metric: 'Contextual Invariance', score: 91, note: 'Lexical anomaly index elevated' },
      ],
      limitations: 'Broadcast compression artifacts slightly elevate noise floor in ambient bands.',
      why: 'The visual recording is genuine, but a 4.2-second forged audio clause was spliced into the briefing timeline with discordant background reverberation.',
    },
    {
      id: 'case-714',
      caseNumber: 'INV-2026-0714',
      title: 'High-Value Merger Escrow Signature Verification',
      targetSubject: 'Multi-party Transaction Ledger',
      verdict: 'VERIFIED AUTHENTIC',
      confidence: 99,
      signals: [
        { label: 'DOCUMENT STRUCTURE', detail: 'PDF object tree exhibits clean Adobe Acrobat Pro sequential writes', status: 'consistent' },
        { label: 'HARDWARE KEY MATCH', detail: 'HSM cryptographic signatures validate against corporate key vault', status: 'consistent' },
        { label: 'TIMESTAMP ORDERING', detail: 'Atomic server clock synchronization verified via public blockchain ledger', status: 'consistent' },
      ],
      supportingSignals: [
        { modality: 'DOCUMENT', metric: 'Structural Integrity', score: 99, note: 'No post-signing stream revisions' },
        { modality: 'TEXT', metric: 'Semantic Parity', score: 99, note: 'Linguistic verification and intent match' },
        { modality: 'LEDGER', metric: 'Atomic Clock Audit', score: 98, note: 'Zero timestamp deviation' },
      ],
      limitations: 'None. Complete cryptographically signed audit chain provided.',
      why: 'All physical and mathematical constraints hold across all modalities. Zero adversarial noise or layout inconsistencies found.',
    },
  ];

  const [activeCase, setActiveCase] = useState(cases[0]);

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <section id="investigations" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
              FORENSIC DOSSIER INTERFACE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-3 font-sans">
              INVESTIGATION RESULT.
            </h2>
            <p className="text-base text-[#8A8A8A] leading-relaxed font-sans">
              Inspect how TrustLayer presents verified evidentiary breakdowns with full causal reasoning.
            </p>
          </div>

          {/* Case Selector Pills (Glass buttons) */}
          <div className="flex flex-wrap items-center gap-2">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`px-3.5 py-1.5 text-xs font-mono rounded-[3px] transition-all duration-200 ${
                  activeCase.id === c.id
                    ? 'glass-btn-primary font-semibold'
                    : 'glass-btn text-[#8A8A8A] hover:text-white'
                }`}
              >
                {c.caseNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Main Investigation Result Glass Shell */}
        <div className="glass-panel-2 rounded-lg p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.5)] border-white/[0.08]">
          
          {/* Top Dossier Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/[0.08] gap-4">
            <div>
              <div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider mb-1 flex items-center gap-2">
                <span>CASE IDENTIFIER // {activeCase.caseNumber}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-sans">
                {activeCase.title}
              </h3>
              <div className="text-xs text-[#8A8A8A] mt-1 font-mono">
                Subject Profile: <span className="text-neutral-200">{activeCase.targetSubject}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadReport}
                className="glass-btn flex items-center gap-2 px-3.5 py-2 text-xs font-mono text-[#A0A0A0] hover:text-white rounded-[3px]"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>{downloadSuccess ? 'EXPORTED CERTIFICATE' : 'EXPORT REPORT'}</span>
              </button>
            </div>
          </div>

          {/* Primary Trust Assessment Glass Panel (Showpiece Glassmorphism Element) */}
          <div className="glass-panel-3 glass-sheen rounded-md p-6 sm:p-8 mb-8 border-white/[0.16] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left: Verdict and Confidence */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>TRUST ASSESSMENT</span>
                </div>

                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-sans tracking-tight text-white">
                  {activeCase.verdict}
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs text-[#8A8A8A] font-mono uppercase">Confidence Score</span>
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">{activeCase.confidence}%</span>
                  </div>
                  {/* Sleek Cyan / Amber Progress Indicator */}
                  <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeCase.verdict.includes('AUTHENTIC') ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${activeCase.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs text-[#737373] font-mono leading-relaxed">
                  Calibrated across cross-modal invariant graph. Zero false positive override triggered.
                </div>
              </div>

              {/* Right: Explanation & Limitations */}
              <div className="lg:col-span-7 space-y-4 lg:pl-6 lg:border-l border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#888] uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EXPLANATORY FORENSIC RATIONALE</span>
                </div>

                <p className="text-sm text-neutral-200 leading-relaxed font-sans">
                  “{activeCase.why}”
                </p>

                {/* Limitations block */}
                <div className="p-3 rounded bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5 text-xs text-[#737373] font-mono">
                  <Info className="w-3.5 h-3.5 text-[#555] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#888] uppercase">LIMITATIONS: </span>
                    <span>{activeCase.limitations}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Evidence Signal Cards (Individual Glass Modules) */}
          <div className="mb-10">
            <div className="text-[10px] font-mono uppercase text-[#737373] tracking-[0.2em] mb-3">
              INDIVIDUAL EVIDENCE SIGNALS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeCase.supportingSignals.map((sig, idx) => (
                <div 
                  key={idx}
                  className="glass-panel-1 glass-hover rounded-md p-5 border-white/[0.08] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#666] uppercase mb-2">
                      <span>{sig.modality}</span>
                      <span className="text-cyan-400 font-bold">{sig.score}%</span>
                    </div>
                    <div className="text-sm font-bold text-white font-sans mb-1">
                      {sig.metric}
                    </div>
                    <div className="text-xs text-[#8A8A8A] leading-relaxed font-sans mb-4">
                      {sig.note}
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/40 rounded-full"
                      style={{ width: `${sig.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Ledger Breakdown */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase text-[#737373] tracking-[0.2em] mb-2">
              EVIDENTIARY AUDIT LOG
            </div>

            <div className="space-y-2.5">
              {activeCase.signals.map((sig, i) => (
                <div 
                  key={i} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glass-panel-1 glass-hover rounded-[3px] border-white/[0.06] gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    {sig.status === 'conflict' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white font-sans">
                        {sig.label}
                      </div>
                      <div className="text-xs text-[#808080] font-mono mt-0.5">
                        {sig.detail}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-[2px] border uppercase ${
                      sig.status === 'conflict' 
                        ? 'bg-amber-950/30 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                        : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                    }`}>
                      {sig.status === 'conflict' ? '⚠ ANOMALY' : '✓ VERIFIED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
