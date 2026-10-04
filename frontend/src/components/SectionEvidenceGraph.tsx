import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Volume2, 
  FileText, 
  Database, 
  UserCheck, 
  Clock, 
  FileCode,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Link2
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  icon: React.ElementType;
  x: number; // percentage in graph canvas
  y: number;
  status: 'consistent' | 'conflict' | 'uncertain';
  role: string;
  observation: string;
  connectedTo: string[];
}

interface Edge {
  from: string;
  to: string;
  label: string;
  status: 'consistent' | 'conflict' | 'uncertain';
}

export const SectionEvidenceGraph: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>('video');

  const statusLabel = (status: GraphNode['status']) => {
    if (status === 'conflict') return 'POTENTIAL INCONSISTENCY';
    if (status === 'consistent') return 'SIGNALS ALIGN';
    return 'CONTEXT NEEDED';
  };

  const nodes: GraphNode[] = [
    {
      id: 'image',
      label: 'IMAGE',
      icon: ImageIcon,
      x: 220,
      y: 110,
      status: 'conflict',
      role: 'Visual signals & context',
      observation: 'Compare visible lighting and scene details with related sources and available context.',
      connectedTo: ['video', 'metadata', 'context'],
    },
    {
      id: 'video',
      label: 'VIDEO',
      icon: VideoIcon,
      x: 500,
      y: 90,
      status: 'conflict',
      role: 'Frame-level signals',
      observation: 'Review timing and visual relationships alongside any related audio evidence.',
      connectedTo: ['image', 'audio', 'timestamp', 'context'],
    },
    {
      id: 'audio',
      label: 'AUDIO',
      icon: Volume2,
      x: 780,
      y: 120,
      status: 'conflict',
      role: 'Acoustic context',
      observation: 'Acoustic indicators should be interpreted in the context of source quality and related material.',
      connectedTo: ['video', 'text', 'context'],
    },
    {
      id: 'context',
      label: 'CONTEXT',
      icon: UserCheck,
      x: 500,
      y: 260,
      status: 'consistent',
      role: 'Supporting information',
      observation: 'Context can support or complicate an interpretation; its source and reliability should be reviewed.',
      connectedTo: ['image', 'video', 'audio', 'text'],
    },
    {
      id: 'metadata',
      label: 'METADATA',
      icon: Database,
      x: 180,
      y: 380,
      status: 'conflict',
      role: 'EXIF & source details',
      observation: 'Metadata can be incomplete or changed. Review it alongside the original source and other records.',
      connectedTo: ['image', 'timestamp', 'document'],
    },
    {
      id: 'timestamp',
      label: 'TIMESTAMP',
      icon: Clock,
      x: 500,
      y: 420,
      status: 'conflict',
      role: 'Dates & chronology',
      observation: 'Compare timestamps across sources while accounting for missing or transformed metadata.',
      connectedTo: ['video', 'metadata', 'document'],
    },
    {
      id: 'text',
      label: 'TEXT',
      icon: FileCode,
      x: 820,
      y: 370,
      status: 'uncertain',
      role: 'Meaning & consistency',
      observation: 'Text may provide context, but language patterns alone do not establish how content was created.',
      connectedTo: ['audio', 'context', 'document'],
    },
    {
      id: 'document',
      label: 'DOCUMENT',
      icon: FileText,
      x: 500,
      y: 560,
      status: 'consistent',
      role: 'Accompanying PDF charter',
      observation: 'Review document structure and referenced sources; no provenance conclusion is implied by this example.',
      connectedTo: ['metadata', 'timestamp', 'text'],
    },
  ];

  const edges: Edge[] = [
    { from: 'image', to: 'video', label: 'Frame-to-stream coherence', status: 'conflict' },
    { from: 'video', to: 'audio', label: 'Phoneme-viseme sync', status: 'conflict' },
    { from: 'audio', to: 'text', label: 'Acoustic-semantic alignment', status: 'uncertain' },
    { from: 'context', to: 'image', label: 'Supporting context', status: 'uncertain' },
    { from: 'context', to: 'video', label: 'Related source context', status: 'uncertain' },
    { from: 'context', to: 'audio', label: 'Contextual comparison', status: 'uncertain' },
    { from: 'metadata', to: 'image', label: 'Sensor noise & EXIF', status: 'conflict' },
    { from: 'metadata', to: 'timestamp', label: 'UTC capture log', status: 'conflict' },
    { from: 'timestamp', to: 'video', label: 'Solar lighting time', status: 'conflict' },
    { from: 'document', to: 'timestamp', label: 'Execution date', status: 'consistent' },
    { from: 'document', to: 'metadata', label: 'Author system header', status: 'consistent' },
    { from: 'document', to: 'text', label: 'Quoted language parity', status: 'uncertain' },
  ];

  const isEdgeHighlighted = (edge: Edge) => {
    if (!hoveredNode) return false;
    return edge.from === hoveredNode || edge.to === hoveredNode;
  };

  const selectedNodeObj = nodes.find((n) => n.id === hoveredNode);

  return (
    <section id="how-it-works" className="py-16 lg:py-20 bg-transparent border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#737373] mb-3">
              ILLUSTRATIVE EVIDENCE GRAPH
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-4 font-sans">
              THE SIGNAL<br />
              IS IN THE CONNECTION.
            </h2>
            <p className="text-base text-[#8A8A8A] leading-relaxed font-sans">
              Explore how image, video, audio, text, document, and metadata signals may relate. Example relationships are illustrative and not findings about a submitted file.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] font-mono p-2 bg-[#0D0D0D] border border-[#242424] rounded-md">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SIGNALS ALIGN</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>POTENTIAL INCONSISTENCY</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>UNCERTAIN</span>
            </div>
          </div>
        </div>

        {/* Main Interactive Graph & Inspector Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive SVG Canvas with Glassmorphic Frame */}
          <div className="lg:col-span-8 glass-panel-1 rounded-lg p-4 sm:p-8 relative min-h-[560px] sm:min-h-[620px] flex items-center justify-center overflow-hidden border-white/[0.08]">
            
            {/* Subtle background coordinate grid */}
            <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

            <svg viewBox="0 0 1000 680" className="w-full h-full max-w-[850px] relative z-10">
              <defs>
                <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <linearGradient id="graphNodeGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
                  <stop offset="35%" stopColor="#1a1a1a" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#080808" stopOpacity="0.92" />
                </linearGradient>

                <linearGradient id="graphNodeActiveGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="25%" stopColor="#22d3ee" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0c1719" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Render Edges */}
              {edges.map((edge, idx) => {
                const source = nodes.find((n) => n.id === edge.from)!;
                const target = nodes.find((n) => n.id === edge.to)!;
                const highlighted = isEdgeHighlighted(edge);
                
                // Color based on status and highlight
                let strokeColor = '#242424';
                if (highlighted) {
                  if (edge.status === 'conflict') strokeColor = '#F59E0B'; // Amber conflict path
                  else if (edge.status === 'consistent') strokeColor = '#22D3EE'; // Subtle cyan active path
                  else strokeColor = '#94a3b8';
                }

                // Midpoint for curve or label
                const mx = (source.x + target.x) / 2;
                const my = (source.y + target.y) / 2;

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={strokeColor}
                      strokeWidth={highlighted ? 2 : 1}
                      strokeDasharray={edge.status === 'uncertain' ? '3 3' : undefined}
                      filter={highlighted ? 'url(#edgeGlow)' : undefined}
                      className="transition-all duration-300"
                    />

                    {highlighted && (
                      <g transform={`translate(${mx}, ${my})`}>
                        <rect
                          x="-60"
                          y="-9"
                          width="120"
                          height="18"
                          fill="rgba(10,10,10,0.85)"
                          stroke={strokeColor}
                          strokeWidth="0.8"
                          rx="3"
                        />
                        <text
                          textAnchor="middle"
                          y="3"
                          fill="#ffffff"
                          fontSize="8.5"
                          fontWeight="600"
                          className="font-mono select-none"
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Render Nodes with Glassmorphic Styling */}
              {nodes.map((node) => {
                const isSelected = hoveredNode === node.id;
                const isRelated = hoveredNode ? node.connectedTo.includes(hoveredNode) || node.id === hoveredNode : true;
                const Icon = node.icon;

                let statusBadgeColor = '#94a3b8';
                if (node.status === 'conflict') statusBadgeColor = '#F59E0B';
                if (node.status === 'consistent') statusBadgeColor = '#22D3EE';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onClick={() => setHoveredNode(node.id)}
                    opacity={isRelated ? 1 : 0.25}
                  >
                    {/* Node Glass Base Disc */}
                    <circle
                      r={isSelected ? 36 : 30}
                      fill={isSelected ? 'url(#graphNodeActiveGlass)' : 'url(#graphNodeGlass)'}
                      stroke={isSelected ? '#22D3EE' : 'rgba(255,255,255,0.18)'}
                      strokeWidth={isSelected ? 2 : 1}
                      className="transition-all duration-200"
                    />

                    {/* Specular highlight crescent */}
                    <path
                      d={isSelected ? "M -24 -12 A 32 32 0 0 1 24 -12" : "M -20 -10 A 26 26 0 0 1 20 -10"}
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="0.8"
                    />

                    {/* Concentric tick ring on active node */}
                    {isSelected && (
                      <circle
                        r="42"
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth="0.8"
                        strokeDasharray="4 4"
                        opacity="0.8"
                      />
                    )}

                    {/* Mini Status Dot */}
                    <circle
                      cx="22"
                      cy="-22"
                      r="4"
                      fill={statusBadgeColor}
                      stroke="#050505"
                      strokeWidth="1.5"
                    />

                    {/* Node Icon */}
                    <foreignObject x="-11" y="-18" width="22" height="22">
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#8A8A8A]'}`} />
                      </div>
                    </foreignObject>

                    {/* Node Label */}
                    <text
                      y="14"
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#d4d4d4'}
                      fontSize="9"
                      fontWeight="700"
                      letterSpacing="0.12em"
                      className="font-mono select-none"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Evidence Telemetry Inspector */}
          <div className="lg:col-span-4 glass-panel-2 rounded-lg p-6 sm:p-8 space-y-6 border-white/[0.08]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-white" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                  EVIDENCE GRAPH
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#666]">
                ACTIVE SELECTION
              </span>
            </div>

            {selectedNodeObj ? (
              <div className="space-y-6">
                
                {/* Node Title & Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-bold text-white tracking-tight uppercase font-sans">
                      {selectedNodeObj.label}
                    </h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      selectedNodeObj.status === 'conflict'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                        : selectedNodeObj.status === 'consistent'
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                    }`}>
                      {statusLabel(selectedNodeObj.status)}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#8A8A8A]">
                    {selectedNodeObj.role}
                  </div>
                </div>

                {/* Forensic Observation */}
                <div className="bg-[#050505] p-4 rounded-md border border-[#1A1A1A] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#737373]">
                    ILLUSTRATIVE SIGNAL
                  </div>
                  <p className="text-xs text-[#d1d1d1] leading-relaxed font-sans">
                    {selectedNodeObj.observation}
                  </p>
                </div>

                {/* Connected Relationships */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono uppercase text-[#737373]">
                    CONNECTED CORRELATIONS ({selectedNodeObj.connectedTo.length})
                  </div>
                  <div className="space-y-2">
                    {selectedNodeObj.connectedTo.map((targetId) => {
                      const targetNode = nodes.find((n) => n.id === targetId);
                      if (!targetNode) return null;
                      return (
                        <div
                          key={targetId}
                          onClick={() => setHoveredNode(targetId)}
                          className="flex items-center justify-between p-2.5 bg-[#0D0D0D] border border-[#1F1F1F] rounded text-xs hover:border-[#383838] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <targetNode.icon className="w-3.5 h-3.5 text-[#888]" />
                            <span className="font-mono text-white font-medium">{targetNode.label}</span>
                          </div>
                          <span className={`text-[10px] font-mono uppercase ${
                            targetNode.status === 'conflict' ? 'text-amber-400' : targetNode.status === 'consistent' ? 'text-emerald-400' : 'text-neutral-400'
                          }`}>
                            {statusLabel(targetNode.status)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deep explanation */}
                <div className="text-[11px] text-[#737373] leading-relaxed pt-3 border-t border-[#1C1C1C]">
                  Relationships in an evidence graph help organize an investigation. They do not independently prove authenticity or manipulation.
                </div>

              </div>
            ) : (
              <div className="text-xs font-mono text-[#666] py-12 text-center">
                Select or hover over a node to explore illustrative evidence relationships.
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
