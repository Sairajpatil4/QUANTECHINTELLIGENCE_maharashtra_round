import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface PricingProps {
  onSelectTier: (tierName: string) => void;
}

export const SectionPricing: React.FC<PricingProps> = ({ onSelectTier }) => {
  const tiers = [
    {
      name: 'DEVELOPER API',
      badge: 'High Throughput',
      price: '$1,200',
      period: 'per month',
      description: 'Programmatic cross-modal verification for trust & safety pipelines, marketplace moderation, and media teams.',
      features: [
        '50,000 monthly cross-modal verifications',
        'Sub-second async webhooks',
        'Image, video & audio discrepancy scoring',
        'Standard cryptographic proof manifests',
        'REST & gRPC SDK access',
      ],
      cta: 'Deploy API Key',
      highlighted: false,
    },
    {
      name: 'INVESTIGATION SUITE',
      badge: 'Most Popular',
      price: '$4,800',
      period: 'per month',
      description: 'Full forensic workbench for corporate intelligence, legal dispute teams, and crisis response units.',
      features: [
        'Unlimited interactive investigation cases',
        'All 6 modalities + document vector inspection',
        'Interactive causal reasoning graph',
        'Courtroom-ready forensic PDF export',
        'Dedicated senior forensic advisor',
        '4-hour incident response SLA',
      ],
      cta: 'Request Access',
      highlighted: true,
    },
    {
      name: 'ENTERPRISE & DEFENSE',
      badge: 'Air-Gapped / Custom',
      price: 'Custom',
      period: 'annual contract',
      description: 'Sovereign on-premises and air-gapped deployment for intelligence communities and national defense.',
      features: [
        'Self-hosted isolated Docker & Kubernetes clusters',
        'Zero external telemetry or network calls',
        'Custom physical invariant fine-tuning',
        '24/7 dedicated mission engineering support',
        'Full source model inspection & weights',
      ],
      cta: 'Contact Defense Desk',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
            DEPLOYMENT & ACCESS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-6 font-sans">
            TRANSPARENT PRICING<br />
            FOR MISSION-CRITICAL TEAMS.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-2xl font-sans">
            From automated content moderation pipelines to high-stakes executive fraud defense. 
            All plans include cryptographically signed verification ledgers.
          </p>
        </div>

        {/* Tiers Grid with Glassmorphic Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-8 rounded-md flex flex-col justify-between transition-all duration-200 ${
                tier.highlighted
                  ? 'glass-panel-3 glass-sheen border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
                  : 'glass-panel-1 glass-hover border-white/[0.08]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-wider text-white">
                    {tier.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded glass-panel-1 border-white/[0.12]">
                    {tier.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-white font-mono tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#8A8A8A] font-sans">
                    {tier.period}
                  </span>
                </div>

                <p className="text-xs text-[#999] leading-relaxed mb-8 font-sans">
                  {tier.description}
                </p>

                {/* Features */}
                <div className="space-y-3 pt-6 border-t border-white/[0.08] mb-8">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectTier(tier.name)}
                className={`w-full py-3 px-4 rounded-[3px] text-xs font-semibold tracking-wide flex items-center justify-center gap-2 ${
                  tier.highlighted
                    ? 'glass-btn-primary'
                    : 'glass-btn text-white'
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
