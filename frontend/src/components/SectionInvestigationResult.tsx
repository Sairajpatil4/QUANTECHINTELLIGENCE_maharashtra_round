import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ShieldAlert, 
  Sparkles,
  Info
} from 'lucide-react';

export const SectionInvestigationResult: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const cases = [
    {
      id: 'case-902',
      caseNumber: 'INV-2026-0902',
      title: 'Executive Media Evidence Review',
      targetSubject: 'Video, Audio & Supporting Documents',
      verdict: 'POTENTIAL MANIPULATION DETECTED',
      signals: [
        { label: 'VISUAL SIGNAL', detail: 'A visual artifact signal is present and should be reviewed in context.', status: 'conflict' },
        { label: 'AUDIO / VIDEO RELATIONSHIP', detail: 'Timing and acoustic context indicate a relationship requiring review.', status: 'conflict' },
        { label: 'METADATA INCONSISTENCY', detail: 'Available timestamps do not fully align across supplied sources.', status: 'conflict' },
        { label: 'DOCUMENT CONTEXT', detail: 'Supporting document structure provides context but does not independently verify the media.', status: 'uncertain' },
      ],
      supportingSignals: [
        { modality: 'IMAGE ANALYSIS', metric: 'Artifact signals detected', note: 'Visual indicators need interpretation alongside other evidence.' },
        { modality: 'METADATA', metric: 'Inconsistency identified', note: 'Compare source details with related materials.' },
        { modality: 'TEXT', metric: 'Contextual evidence available', note: 'Text can support an investigation but is not proof on its own.' },
        { modality: 'CROSS-MODAL', metric: 'Relationship requires review', note: 'Correlations need interpretation in context.' },
      ],
      limitations: 'Audio evidence was not provided. Source provenance could not be independently verified. Assessment reflects available illustrative evidence only. Absence of evidence is not proof of authenticity or manipulation.',
      why: 'Several illustrative signals appear inconsistent across the supplied visual, metadata, and contextual evidence. These signals support further investigation; they do not establish a definitive account of how the material was created.',
    },
    {
      id: 'case-841',
      caseNumber: 'INV-2026-0841',
      title: 'Public Briefing Evidence Review',
      targetSubject: 'Video, Transcript & Timestamp',
      verdict: 'INCONSISTENCIES REQUIRE REVIEW',
      signals: [
        { label: 'SOURCE METADATA', detail: 'Some source metadata is present; independent provenance confirmation is unavailable.', status: 'uncertain' },
        { label: 'AUDIO CONTEXT', detail: 'The available audio context has a segment that warrants closer examination.', status: 'conflict' },
        { label: 'TEXT CONTEXT', detail: 'Transcript meaning should be interpreted against independently sourced material.', status: 'uncertain' },
      ],
      supportingSignals: [
        { modality: 'AUDIO', metric: 'Context needs review', note: 'No single signal is treated as a verdict.' },
        { modality: 'VIDEO', metric: 'Visual evidence available', note: 'The clip requires corroborating source material.' },
        { modality: 'TEXT', metric: 'Contextual evidence', note: 'Transcript interpretation has contextual limitations.' },
      ],
      limitations: 'Original source files and independent provenance records were not available. Assessment reflects the available evidence only.',
      why: 'The illustrative review surfaces a possible audio-context inconsistency alongside unresolved transcript context. Additional source material would be needed to assess the relationship with greater confidence.',
    },
    {
      id: 'case-714',
      caseNumber: 'INV-2026-0714',
      title: 'Transaction Document Evidence Review',
      targetSubject: 'Document Structure & Related Metadata',
      verdict: 'NO SIGNIFICANT INCONSISTENCY OBSERVED',
      signals: [
        { label: 'DOCUMENT STRUCTURE', detail: 'No notable structure inconsistency was observed in this illustrative review.', status: 'consistent' },
        { label: 'PROVENANCE', detail: 'A verified source chain was not provided for independent confirmation.', status: 'uncertain' },
        { label: 'TIMESTAMP CONTEXT', detail: 'Available dates appear consistent; this alone does not establish authenticity.', status: 'consistent' },
      ],
      supportingSignals: [
        { modality: 'DOCUMENT', metric: 'Structure reviewed', note: 'No significant structural inconsistency observed.' },
        { modality: 'TEXT', metric: 'Context available', note: 'Text is assessed in context, not as proof.' },
        { modality: 'METADATA', metric: 'Source context', note: 'Metadata can be incomplete or altered.' },
      ],
      limitations: 'No significant inconsistency in this illustrative review is not proof of authenticity. Source provenance could not be independently verified.',
      why: 'No significant inconsistency was observed in the illustrative document and metadata signals available here. Additional source records may change the assessment.',
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
              INVESTIGATION SUMMARY · ILLUSTRATIVE EXAMPLE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-3 font-sans">
              INVESTIGATION RESULT.
            </h2>
            <p className="text-base text-[#8A8A8A] leading-relaxed font-sans">
              An illustrative investigation summary: signals and correlations inform a trust assessment, while context and limitations remain visible.
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
                <span>ILLUSTRATIVE EXAMPLE // {activeCase.caseNumber}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
                <span>ANALYSIS COMPLETE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-sans">
                {activeCase.title}
              </h3>
              <div className="text-xs text-[#8A8A8A] mt-1 font-mono">
                Evidence Sources: <span className="text-neutral-200">{activeCase.targetSubject}</span>
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

                <div className="text-xs text-[#8A8A8A] font-mono uppercase">
                  Confidence: qualitative and context dependent
                </div>

                <div className="pt-2 text-xs text-[#737373] font-mono leading-relaxed">
                  Detector outputs are evidence signals, not absolute truth. Interpret confidence with the available sources and stated limitations.
                </div>
              </div>

              {/* Right: Explanation & Limitations */}
              <div className="lg:col-span-7 space-y-4 lg:pl-6 lg:border-l border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#888] uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ASSESSMENT EXPLANATION</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {activeCase.supportingSignals.map((sig, idx) => (
                <div 
                  key={idx}
                  className="glass-panel-1 glass-hover rounded-md p-5 border-white/[0.08] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#666] uppercase mb-2">
                      <span>{sig.modality}</span>
                      <span className="text-cyan-400 font-bold">EVIDENCE SIGNAL</span>
                    </div>
                    <div className="text-sm font-bold text-white font-sans mb-1">
                      {sig.metric}
                    </div>
                    <div className="text-xs text-[#8A8A8A] leading-relaxed font-sans mb-4">
                      {sig.note}
                    </div>
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
                      {sig.status === 'conflict' ? '⚠ REVIEW' : sig.status === 'uncertain' ? 'CONTEXT NEEDED' : 'CONSISTENT SIGNAL'}
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
