import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Volume2, 
  FileText, 
  Database, 
  MessageSquare,
  Sparkles,
  Play,
  AlertTriangle,
  CheckCircle2,
  Upload,
  X
} from 'lucide-react';
import { validateModalityFile, ModalityType, MODALITY_CONFIGS, type SelectedEvidenceFiles } from '../utils/fileValidation';

interface NodeItem {
  id: string;
  label: string;
  icon: React.ElementType;
  x: number;
  y: number;
  portX: number;
  portY: number;
  statusAnnotation: string;
  annotationPos: { x: number; y: number; align: 'start' | 'end' | 'middle' };
  status: 'conflict' | 'consistent' | 'uncertain';
}

interface TrustEngineVisualizationProps {
  onStartInvestigation?: (files: SelectedEvidenceFiles) => void;
}

export const TrustEngineVisualization: React.FC<TrustEngineVisualizationProps> = ({
  onStartInvestigation,
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);
  const [isCentralHovered, setIsCentralHovered] = useState(false);

  // Field validation and direct upload states
  const [selectedUploadModality, setSelectedUploadModality] = useState<ModalityType | null>(null);
  const [validationAlert, setValidationAlert] = useState<{
    type: 'error' | 'success';
    title: string;
    message: string;
    modality: ModalityType;
    detectedType?: string;
    file?: File;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<SelectedEvidenceFiles>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = (nodeId: string) => {
    setActiveNode(nodeId);
    setSelectedUploadModality(nodeId as ModalityType);
    setValidationAlert(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = MODALITY_CONFIGS[nodeId as ModalityType].accept;
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUploadModality) return;

    const result = validateModalityFile(selectedUploadModality, file);

    if (!result.isValid) {
      // Rejection with field validation details
      setValidationAlert({
        type: 'error',
        title: `FIELD VALIDATION REJECTED // ${selectedUploadModality.toUpperCase()} STREAM`,
        message: result.errorMessage || 'Invalid file format for this field.',
        modality: selectedUploadModality,
        detectedType: result.detectedType,
        file: file,
      });
    } else {
      // Acceptance with ledger status update
      setSelectedFiles(prev => ({
        ...prev,
        [selectedUploadModality]: file,
      }));
      setUploadedFiles(prev => ({
        ...prev,
        [selectedUploadModality]: file.name,
      }));
      setValidationAlert({
        type: 'success',
        title: `FIELD VALIDATION PASSED // ${selectedUploadModality.toUpperCase()}`,
        message: `"${file.name}" verified and accepted into the ${selectedUploadModality.toUpperCase()} cryptographic evidence pipeline.`,
        modality: selectedUploadModality,
        file: file,
      });
    }
  };

  const handleRouteToModality = (targetModality: ModalityType, file: File) => {
    const result = validateModalityFile(targetModality, file);
    if (result.isValid) {
      setSelectedFiles(prev => ({
        ...prev,
        [targetModality]: file,
      }));
      setUploadedFiles(prev => ({
        ...prev,
        [targetModality]: file.name,
      }));
      setActiveNode(targetModality);
      setValidationAlert({
        type: 'success',
        title: `ROUTED & VERIFIED // ${targetModality.toUpperCase()} ENCLAVE`,
        message: `Successfully routed "${file.name}" to the ${targetModality.toUpperCase()} stream. Cryptographic hash SHA-256 generated.`,
        modality: targetModality,
        file: file,
      });
    }
  };

  const center = { x: 500, y: 355 };

  // 5 isometric nodes placed around center (500, 355) with metalmorphism design
  const nodes: NodeItem[] = [
    {
      id: 'image',
      label: 'IMAGE',
      icon: ImageIcon,
      x: 230,
      y: 195,
      portX: 275,
      portY: 220,
      statusAnnotation: 'VISUAL CONSISTENCY',
      annotationPos: { x: 175, y: 170, align: 'end' },
      status: 'consistent',
    },
    {
      id: 'document',
      label: 'DOCUMENT',
      icon: FileText,
      x: 500,
      y: 110,
      portX: 500,
      portY: 155,
      statusAnnotation: 'SYNTHETIC SIGNAL',
      annotationPos: { x: 500, y: 75, align: 'middle' },
      status: 'conflict',
    },
    {
      id: 'video',
      label: 'VIDEO',
      icon: VideoIcon,
      x: 770,
      y: 195,
      portX: 725,
      portY: 220,
      statusAnnotation: 'AUDIO / VIDEO SYNC',
      annotationPos: { x: 825, y: 170, align: 'start' },
      status: 'conflict',
    },
    {
      id: 'text',
      label: 'TEXT',
      icon: MessageSquare,
      x: 755,
      y: 470,
      portX: 710,
      portY: 450,
      statusAnnotation: 'SEMANTIC COHERENCE',
      annotationPos: { x: 810, y: 475, align: 'start' },
      status: 'consistent',
    },
    {
      id: 'audio',
      label: 'AUDIO',
      icon: Volume2,
      x: 245,
      y: 470,
      portX: 290,
      portY: 450,
      statusAnnotation: 'VOCODER ARTIFACT',
      annotationPos: { x: 190, y: 475, align: 'end' },
      status: 'conflict',
    },
  ];

  // Helper to draw an isometric hexagon pedestal
  const renderHexNode = (node: NodeItem) => {
    const isSelected = activeNode === node.id;
    const Icon = node.icon;
    const w = 52;
    const h = 34;
    const depth = 16;

    // Hexagon vertices relative to (node.x, node.y)
    const topHexPoints = `
      ${node.x},${node.y - h}
      ${node.x + w},${node.y - h / 2}
      ${node.x + w},${node.y + h / 2}
      ${node.x},${node.y + h}
      ${node.x - w},${node.y + h / 2}
      ${node.x - w},${node.y - h / 2}
    `;

    // 3D extrusion sides
    const leftSide = `
      ${node.x - w},${node.y - h / 2}
      ${node.x - w},${node.y - h / 2 + depth}
      ${node.x - w},${node.y + h / 2 + depth}
      ${node.x},${node.y + h + depth}
      ${node.x},${node.y + h}
      ${node.x - w},${node.y + h / 2}
    `;

    const rightSide = `
      ${node.x},${node.y + h}
      ${node.x},${node.y + h + depth}
      ${node.x + w},${node.y + h / 2 + depth}
      ${node.x + w},${node.y - h / 2 + depth}
      ${node.x + w},${node.y - h / 2}
      ${node.x + w},${node.y + h / 2}
    `;

    return (
      <g
        key={node.id}
        className="cursor-pointer transition-all duration-200 group"
        onMouseEnter={() => setActiveNode(node.id)}
        onMouseLeave={() => setActiveNode(null)}
        onClick={() => handleNodeClick(node.id)}
      >
        {/* Soft shadow on the grid plane */}
        <ellipse
          cx={node.x}
          cy={node.y + depth + 12}
          rx={w + 10}
          ry={h + 6}
          fill="#000000"
          opacity="0.85"
        />

        {/* 3D Extrusion Side Panels with Anodized Gunmetal Finish */}
        <polygon
          points={leftSide}
          fill={isSelected ? '#1f242c' : '#181a1f'}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.8"
        />
        <polygon
          points={rightSide}
          fill={isSelected ? '#15191f' : '#101216'}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />

        {/* Top Precision Brushed Metallic Hexagon Pedestal */}
        <polygon
          points={topHexPoints}
          fill={isSelected ? 'url(#metalNodeActiveGrad)' : 'url(#metalNodeGrad)'}
          stroke={isSelected ? '#22d3ee' : 'url(#metalBevelTop)'}
          strokeWidth={isSelected ? '1.8' : '1.2'}
          filter={isSelected ? 'url(#glowStrong)' : undefined}
        />

        {/* Top Chamfer Machined Reflection Line */}
        <path
          d={`M ${node.x - w + 6} ${node.y - h / 2 + 1} L ${node.x} ${node.y - h + 2} L ${node.x + w - 6} ${node.y - h / 2 + 1}`}
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="0.9"
          fill="none"
        />

        {/* Bottom Chamfer Dark Shadow Rim */}
        <path
          d={`M ${node.x - w + 6} ${node.y + h / 2 - 1} L ${node.x} ${node.y + h - 2} L ${node.x + w - 6} ${node.y + h / 2 - 1}`}
          stroke="rgba(0,0,0,0.85)"
          strokeWidth="0.9"
          fill="none"
        />

        {/* Diagonal Brushed Anisotropic Glare across metal face */}
        <line
          x1={node.x - w + 16}
          y1={node.y + 4}
          x2={node.x + w - 16}
          y2={node.y - 4}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.5"
          strokeDasharray="14 8"
        />

        {/* Inner concentric machined engraved border */}
        <polygon
          points={`
            ${node.x},${node.y - h + 5}
            ${node.x + w - 8},${node.y - h / 2 + 3}
            ${node.x + w - 8},${node.y + h / 2 - 3}
            ${node.x},${node.y + h - 5}
            ${node.x - w + 8},${node.y + h / 2 - 3}
            ${node.x - w + 8},${node.y - h / 2 + 3}
          `}
          fill="none"
          stroke={isSelected ? 'rgba(34,211,238,0.5)' : 'rgba(0,0,0,0.65)'}
          strokeWidth="1"
        />

        {/* BIG Prominent Icon inside hexagon with metallic contrast */}
        <foreignObject
          x={node.x - 22}
          y={node.y - 22}
          width={44}
          height={44}
          className="pointer-events-none"
        >
          <div className="w-full h-full flex items-center justify-center text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
            <Icon className={`w-8 h-8 transition-all duration-200 ${
              isSelected ? 'text-cyan-400 scale-110 drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]' : 'text-white'
            }`} />
          </div>
        </foreignObject>

        {/* Connection Port Dot facing the center drum */}
        <circle
          cx={node.portX}
          cy={node.portY}
          r={isSelected ? 3.5 : 2.5}
          fill="#ffffff"
          stroke="#050505"
          strokeWidth="1"
          filter={isSelected ? 'url(#glowSoft)' : undefined}
        />

        {/* Node Label (Clean uppercase font) */}
        <text
          x={node.x}
          y={node.y + depth + 26}
          textAnchor="middle"
          fill={isSelected ? '#ffffff' : '#888888'}
          fontSize="10"
          fontWeight="700"
          letterSpacing="0.16em"
          className="font-sans select-none"
        >
          {node.label}
        </text>

        {/* Small Technical Status Annotation directly in the illustration */}
        <text
          x={node.annotationPos.x}
          y={node.annotationPos.y}
          textAnchor={node.annotationPos.align}
          fill={
            validationAlert?.modality === node.id && validationAlert.type === 'error'
              ? '#ef4444'
              : uploadedFiles[node.id]
              ? '#10b981'
              : node.status === 'conflict'
              ? '#fbbf24'
              : '#737373'
          }
          fontSize="7.5"
          fontWeight="500"
          letterSpacing="0.12em"
          className="font-mono select-none opacity-90"
        >
          {validationAlert?.modality === node.id && validationAlert.type === 'error'
            ? `✗ VALIDATION REJECTED`
            : uploadedFiles[node.id]
            ? `✓ INGESTED: ${uploadedFiles[node.id]}`
            : node.status === 'conflict'
            ? `⚠ ${node.statusAnnotation}`
            : `✓ ${node.statusAnnotation}`}
        </text>
      </g>
    );
  };

  // Generate multi-filament flowing bezier lines from port to center
  const renderFlowingConduits = (node: NodeItem, index: number) => {
    const isSelected = activeNode === node.id;
    const isAnySelected = activeNode !== null;
    const dimmed = isAnySelected && !isSelected;

    // Center target coordinates at the rim of the central drum
    const angle = Math.atan2(node.portY - center.y, node.portX - center.x);
    const targetX = center.x + Math.cos(angle) * 82;
    const targetY = center.y + Math.sin(angle) * 36;

    // Intermediate control points creating the flowing organic curve of the reference image
    const dx = node.portX - targetX;
    const dy = node.portY - targetY;
    const cp1x = targetX + dx * 0.4 - dy * 0.18;
    const cp1y = targetY + dy * 0.4 + dx * 0.12;

    const cp2x = targetX + dx * 0.75 + dy * 0.1;
    const cp2y = targetY + dy * 0.75 - dx * 0.08;

    const mainPath = `M ${node.portX} ${node.portY} C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${targetX} ${targetY}`;

    // Secondary offset filaments for that rich flowing multi-cable look in the reference
    const filament1 = `M ${node.portX} ${node.portY} C ${cp2x - 12} ${cp2y - 6}, ${cp1x - 8} ${cp1y - 4}, ${targetX - 4} ${targetY - 2}`;
    const filament2 = `M ${node.portX} ${node.portY} C ${cp2x + 12} ${cp2y + 6}, ${cp1x + 8} ${cp1y + 4}, ${targetX + 4} ${targetY + 2}`;

    return (
      <g
        key={`flow-${node.id}`}
        className="transition-opacity duration-300"
        opacity={dimmed ? 0.2 : 1}
      >
        {/* Filament 1 (Faint outer tendril) */}
        <path
          d={filament1}
          fill="none"
          stroke="#262626"
          strokeWidth="0.75"
          opacity={isSelected ? 0.7 : 0.45}
        />

        {/* Main sharp conduit line */}
        <path
          d={mainPath}
          fill="none"
          stroke={isSelected ? '#ffffff' : '#555555'}
          strokeWidth={isSelected ? 1.5 : 1}
          filter={isSelected ? 'url(#glowSoft)' : undefined}
          className="transition-colors duration-200"
        />

        {/* Filament 2 (Inner tendril) */}
        <path
          d={filament2}
          fill="none"
          stroke="#202020"
          strokeWidth="0.75"
          opacity={isSelected ? 0.6 : 0.4}
        />

        {/* Traveling light pulse / photon along conduit */}
        <circle r={isSelected ? 2.5 : 1.5} fill="#ffffff" filter="url(#glowSoft)">
          <animateMotion
            dur={`${2.6 + (index % 3) * 0.4}s`}
            repeatCount="indefinite"
            path={mainPath}
          />
        </circle>
      </g>
    );
  };

  // Cross-connecting secondary lines between nodes (Cross-Modal Evidence)
  const renderCrossModalLinks = () => {
    return (
      <g opacity="0.35">
        {/* Image (0) to Document (1) */}
        <path
          d={`M ${nodes[0].x + 30} ${nodes[0].y} Q 360 120 ${nodes[1].x - 30} ${nodes[1].y}`}
          fill="none"
          stroke="#444444"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        {/* Document (1) to Video (2) */}
        <path
          d={`M ${nodes[1].x + 30} ${nodes[1].y} Q 640 120 ${nodes[2].x - 30} ${nodes[2].y}`}
          fill="none"
          stroke="#444444"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        {/* Video (2) to Text (3) */}
        <path
          d={`M ${nodes[2].x} ${nodes[2].y + 25} Q 800 330 ${nodes[3].x} ${nodes[3].y - 25}`}
          fill="none"
          stroke="#444444"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        {/* Text (3) to Audio (4) */}
        <path
          d={`M ${nodes[3].x - 30} ${nodes[3].y} Q 500 520 ${nodes[4].x + 30} ${nodes[4].y}`}
          fill="none"
          stroke="#444444"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        {/* Audio (4) to Image (0) */}
        <path
          d={`M ${nodes[4].x} ${nodes[4].y - 25} Q 200 330 ${nodes[0].x} ${nodes[0].y + 25}`}
          fill="none"
          stroke="#444444"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[480px] flex items-center justify-center select-none overflow-hidden">
      {/* Hidden file input for modality enclave upload with validation */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Real-Time Field Validation Alert Banner */}
      {validationAlert && (
        <div className="absolute top-3 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 pointer-events-auto animate-fadeIn">
          <div className={`p-4 rounded-lg border backdrop-blur-2xl transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.85)] ${
            validationAlert.type === 'error'
              ? 'bg-red-950/85 border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.35)]'
              : 'bg-emerald-950/85 border-emerald-500/70 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {validationAlert.type === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`text-xs font-mono font-bold tracking-wider uppercase mb-1 ${
                    validationAlert.type === 'error' ? 'text-red-300' : 'text-emerald-300'
                  }`}>
                    {validationAlert.title}
                  </div>
                  <div className="text-xs text-neutral-100 font-sans leading-relaxed">
                    {validationAlert.message}
                  </div>

                  {validationAlert.type === 'error' && validationAlert.detectedType === 'Image' && validationAlert.modality === 'document' && validationAlert.file && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleRouteToModality('image', validationAlert.file!)}
                        className="px-3 py-1.5 rounded bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/50 text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-cyan-400" />
                        <span>Route to IMAGE stream instead?</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setValidationAlert(null)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/10"
                aria-label="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle perspective isometric grid floor fading into pure black (matching reference image) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          perspective: '900px',
        }}
      >
        <div 
          className="w-full h-full bg-tech-grid"
          style={{
            transform: 'rotateX(58deg) scale(1.35) translateY(40px)',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 75%)',
          }}
        />
      </div>

      {/* Main SVG Visualization */}
      <svg
        viewBox="0 50 1000 600"
        className="w-full h-full max-w-[850px] relative z-10"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle glow filters */}
          <filter id="glowSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Metalmorphism Brushed Titanium Node Gradient */}
          <linearGradient id="metalNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3c414a" />
            <stop offset="25%" stopColor="#1e2127" />
            <stop offset="48%" stopColor="#2c3038" />
            <stop offset="52%" stopColor="#181a1f" />
            <stop offset="85%" stopColor="#252930" />
            <stop offset="100%" stopColor="#111317" />
          </linearGradient>

          {/* Metalmorphism Active Cyan-Infused Titanium Gradient */}
          <linearGradient id="metalNodeActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4d5563" />
            <stop offset="25%" stopColor="#222b34" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#182027" />
            <stop offset="100%" stopColor="#26313b" />
          </linearGradient>

          {/* Metalmorphism Specular Bevel Stroke Gradient */}
          <linearGradient id="metalBevelTop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#cbd5e1" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#475569" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
          </linearGradient>

          {/* Frosted Glass Node Gradient */}
          <linearGradient id="glassNodeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="25%" stopColor="#1a1a1a" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#080808" stopOpacity="0.90" />
          </linearGradient>

          <linearGradient id="glassNodeActiveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="20%" stopColor="#22d3ee" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0e1719" stopOpacity="0.92" />
          </linearGradient>

          {/* Central Drum Gradient */}
          <radialGradient id="centerDiscGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#181818" />
            <stop offset="60%" stopColor="#101010" />
            <stop offset="85%" stopColor="#080808" />
            <stop offset="100%" stopColor="#030303" />
          </radialGradient>

          {/* Outer glow aura */}
          <radialGradient id="drumAura" cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </radialGradient>

          {/* Frosted Glass Environment Disc */}
          <radialGradient id="glassDiscGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.02" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floating Glass Atmosphere: Large subtle glass environment rings */}
        <ellipse cx={center.x} cy={center.y} rx="340" ry="185" fill="url(#glassDiscGrad)" />
        <ellipse cx={center.x} cy={center.y} rx="260" ry="145" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeDasharray="5 7" />
        <ellipse cx={center.x} cy={center.y} rx="160" ry="88" fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8" strokeDasharray="3 5" />
        <ellipse cx={center.x} cy={center.y} rx="180" ry="100" fill="url(#drumAura)" />

        {/* Cross-Modal Secondary Tendril Links */}
        {renderCrossModalLinks()}

        {/* Flowing Conduits connecting Nodes to Center */}
        {nodes.map((node, index) => renderFlowingConduits(node, index))}

        {/* ==================================================== */}
        {/* CENTERPIECE: START INVESTIGATION ANALYSIS CORE */}
        {/* ==================================================== */}
        <g 
          id="central-drum" 
          className="select-none cursor-pointer group"
          onClick={() => onStartInvestigation?.(selectedFiles)}
          onMouseEnter={() => setIsCentralHovered(true)}
          onMouseLeave={() => setIsCentralHovered(false)}
        >
          
          {/* 1. OUTER GLASS RING: Floating transparent technical perimeter */}
          <ellipse
            cx={center.x}
            cy={center.y + 12}
            rx={isCentralHovered ? "138" : "132"}
            ry={isCentralHovered ? "62" : "58"}
            fill={isCentralHovered ? "rgba(34,211,238,0.05)" : "rgba(255,255,255,0.012)"}
            stroke={isCentralHovered ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.14)"}
            strokeWidth="0.8"
            strokeDasharray="4 6"
            className="transition-all duration-300"
          />
          {/* Micro cyan alignment ticks on outer glass perimeter */}
          <circle cx={center.x - 132} cy={center.y + 12} r={isCentralHovered ? "2.5" : "1.5"} fill="#22d3ee" opacity={isCentralHovered ? "1" : "0.8"} />
          <circle cx={center.x + 132} cy={center.y + 12} r={isCentralHovered ? "2.5" : "1.5"} fill="#22d3ee" opacity={isCentralHovered ? "1" : "0.8"} />
          <circle cx={center.x} cy={center.y - 44} r={isCentralHovered ? "2.5" : "1.5"} fill="#22d3ee" opacity={isCentralHovered ? "1" : "0.8"} />
          <circle cx={center.x} cy={center.y + 68} r={isCentralHovered ? "2.5" : "1.5"} fill="#22d3ee" opacity={isCentralHovered ? "1" : "0.8"} />

          {/* Lower shadow on the ground plane */}
          <ellipse
            cx={center.x}
            cy={center.y + 38}
            rx="114"
            ry="52"
            fill="#000000"
            opacity="0.9"
          />

          {/* 2. METALLIC RING: Stepped lower base lip and ribbed cylinder */}
          <ellipse
            cx={center.x}
            cy={center.y + 24}
            rx="102"
            ry="45"
            fill="#090909"
            stroke={isCentralHovered ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.20)"}
            strokeWidth="1"
            className="transition-colors duration-300"
          />

          {/* 3D Vertical Faceted / Ribbed Cylinder Sides */}
          <path
            d={`M ${center.x - 96} ${center.y} 
               L ${center.x - 96} ${center.y + 20} 
               A 96 42 0 0 0 ${center.x + 96} ${center.y + 20} 
               L ${center.x + 96} ${center.y} 
               Z`}
            fill="#101010"
            stroke={isCentralHovered ? "#22d3ee55" : "#2b2b2b"}
            strokeWidth="0.8"
            className="transition-colors duration-300"
          />

          {/* Vertical Ribbed Metallic Tick Marks */}
          {Array.from({ length: 21 }).map((_, i) => {
            const angle = Math.PI * (0.05 + (i / 20) * 0.9);
            const x = center.x + Math.cos(angle) * 95;
            const y1 = center.y + Math.sin(angle) * 41;
            const y2 = y1 + 19;
            return (
              <line
                key={`rib-${i}`}
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={isCentralHovered ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.18)"}
                strokeWidth="1"
              />
            );
          })}

          {/* 3. FROSTED GLASS RING: Glowing White & Cyan Beveled Rim */}
          <ellipse
            cx={center.x}
            cy={center.y}
            rx="96"
            ry="42"
            fill="none"
            stroke={isCentralHovered ? "#22d3ee" : "#ffffff"}
            strokeWidth={isCentralHovered ? "2.6" : "2.2"}
            filter="url(#glowStrong)"
            className="transition-all duration-300"
          />

          {/* Secondary cyan glass reflection ring */}
          <ellipse
            cx={center.x}
            cy={center.y}
            rx="94"
            ry="40"
            fill="none"
            stroke="rgba(34,211,238,0.5)"
            strokeWidth="1"
          />

          {/* 4. ANALYSIS CORE: Smoked Glass Disc Face */}
          <ellipse
            cx={center.x}
            cy={center.y}
            rx="92"
            ry="39"
            fill="url(#centerDiscGrad)"
          />

          {/* Glass Specular Reflection Crescent */}
          <path
            d={`M ${center.x - 72} ${center.y - 20} Q ${center.x} ${center.y - 32} ${center.x + 72} ${center.y - 20}`}
            stroke="rgba(255,255,255,0.30)"
            strokeWidth="1"
            fill="none"
          />

          {/* Inner concentric technical circle */}
          <ellipse
            cx={center.x}
            cy={center.y}
            rx="78"
            ry="33"
            fill="none"
            stroke={isCentralHovered ? "rgba(34,211,238,0.4)" : "rgba(255,255,255,0.15)"}
            strokeWidth="0.8"
            strokeDasharray="4 3"
          />

          {/* BIG PROMINENT CENTERPIECE INVESTIGATION ICON */}
          <foreignObject
            x={center.x - 24}
            y={center.y - 33}
            width={48}
            height={44}
            className="pointer-events-none"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className={`w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center ${
                isCentralHovered 
                  ? 'bg-cyan-400/25 border-2 border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.85)] scale-110' 
                  : 'bg-white/10 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              }`}>
                <Play className={`w-5 h-5 transition-colors duration-200 ml-0.5 ${
                  isCentralHovered ? 'text-white fill-white' : 'text-cyan-400 fill-cyan-400'
                }`} />
              </div>
            </div>
          </foreignObject>

          {/* Central Typography: START INVESTIGATION */}
          <text
            x={center.x}
            y={center.y + 19}
            textAnchor="middle"
            fill={isCentralHovered ? "#22d3ee" : "#ffffff"}
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.18em"
            className="font-sans transition-colors duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            START INVESTIGATION
          </text>
        </g>

        {/* ==================================================== */}
        {/* 6 SURROUNDING ISOMETRIC EVIDENCE NODES */}
        {/* ==================================================== */}
        {nodes.map((node) => renderHexNode(node))}
      </svg>
    </div>
  );
};
