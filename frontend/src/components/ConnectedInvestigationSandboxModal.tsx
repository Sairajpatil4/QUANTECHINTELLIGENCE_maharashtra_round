import { useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  MessageSquare,
  Music2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import {
  analyzeInvestigation,
  createInvestigation,
  getAnalysisResults,
  uploadEvidence,
  type AnalysisResult,
  type EvidenceType,
} from '../api/trustLayer';
import {
  MODALITY_CONFIGS,
  validateModalityFile,
  type ModalityType,
} from '../utils/fileValidation';

interface SandboxProps {
  isOpen: boolean;
  onClose: () => void;
}

const presets = [
  { id: 'exec', title: 'Executive Wire Impersonation', description: 'Investigate an alleged executive audio/video communication.' },
  { id: 'diplomat', title: 'Embassy Press Briefing Leak', description: 'Review media and transcript evidence from a reported briefing.' },
  { id: 'contract', title: 'Merger Escrow Agreement', description: 'Review source files related to a disputed business document.' },
] as const;

const modalities: Array<{
  id: ModalityType;
  label: string;
  icon: typeof ImageIcon;
  helper: string;
}> = [
  { id: 'image', label: 'Image', icon: ImageIcon, helper: 'Image evidence' },
  { id: 'video', label: 'Video', icon: Video, helper: 'Video evidence' },
  { id: 'audio', label: 'Audio', icon: Music2, helper: 'Audio evidence' },
  { id: 'text', label: 'Text', icon: MessageSquare, helper: 'Text or transcript' },
  { id: 'document', label: 'Document', icon: FileText, helper: 'Sent as text evidence' },
];

type SelectedFiles = Partial<Record<ModalityType, File>>;

function displayValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}

function findingLabel(finding: Record<string, unknown>): string {
  const label = finding.title ?? finding.name ?? finding.description ?? finding.message;
  return label === undefined ? displayValue(finding) : displayValue(label);
}

export function InvestigationSandboxModal({ isOpen, onClose }: SandboxProps) {
  const [selectedPreset, setSelectedPreset] = useState<(typeof presets)[number]['id']>('exec');
  const [title, setTitle] = useState(presets[0].title);
  const [description, setDescription] = useState(presets[0].description);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({});
  const [uploadedFiles, setUploadedFiles] = useState<Set<ModalityType>>(new Set());
  const [activeModality, setActiveModality] = useState<ModalityType>('image');
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const selectPreset = (presetId: (typeof presets)[number]['id']) => {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    setTitle(preset.title);
    setDescription(preset.description);
  };

  const chooseFile = (modality: ModalityType) => {
    setActiveModality(modality);
    setValidationMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = MODALITY_CONFIGS[modality].accept;
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateModalityFile(activeModality, file);
    if (!validation.isValid) {
      setValidationMessage(validation.errorMessage || 'This file is not valid for the selected evidence type.');
      return;
    }
    setSelectedFiles((current) => ({ ...current, [activeModality]: file }));
    setUploadedFiles((current) => {
      const next = new Set(current);
      next.delete(activeModality);
      return next;
    });
    setResult(null);
    setError(null);
    setValidationMessage(`${file.name} is ready to upload when analysis starts.`);
  };

  const handleAnalyze = async () => {
    if (!title.trim()) {
      setError('Enter an investigation title before starting.');
      return;
    }
    if (!Object.keys(selectedFiles).length) {
      setError('Add at least one evidence file before starting the investigation.');
      return;
    }

    setBusy(true);
    setError(null);
    setResult(null);
    try {
      let activeId = investigationId;
      if (!activeId) {
        const investigation = await createInvestigation(title.trim(), description.trim());
        activeId = investigation.investigation_id;
        setInvestigationId(activeId);
      }

      for (const [modality, file] of Object.entries(selectedFiles) as Array<[ModalityType, File]>) {
        if (!uploadedFiles.has(modality)) {
          const evidenceType: EvidenceType = modality === 'document' ? 'text' : modality;
          await uploadEvidence(activeId, file, evidenceType);
          setUploadedFiles((current) => new Set(current).add(modality));
        }
      }

      try {
        setResult(await analyzeInvestigation(activeId));
      } catch (analysisError) {
        // The backend records analysis limitations before returning a service error.
        const storedResult = await getAnalysisResults(activeId).catch(() => null);
        if (storedResult) setResult(storedResult);
        throw analysisError;
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The investigation could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const assessmentEntries = Object.entries(result?.assessment ?? {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-xl sm:p-6">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="investigation-title"
        className="glass-panel-3 relative my-auto max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg p-5 shadow-2xl sm:p-8"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">TrustLayer investigation</p>
              <h2 id="investigation-title" className="mt-1 text-lg font-semibold text-white sm:text-xl">Analyze submitted evidence</h2>
            </div>
          </div>
          <button onClick={onClose} className="glass-btn rounded p-2 text-neutral-300 hover:text-white" aria-label="Close investigation">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">Optional investigation starting points</p>
          <div className="grid gap-2 md:grid-cols-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                className={`rounded border p-3 text-left transition-colors ${selectedPreset === preset.id ? 'border-cyan-400/40 bg-cyan-400/[0.08]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'}`}
              >
                <span className="block text-xs font-semibold text-white">{preset.title}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-neutral-400">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="text-[11px] text-neutral-400">
            Investigation title
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} className="mt-1.5 w-full rounded border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50" />
          </label>
          <label className="text-[11px] text-neutral-400">
            Context (optional)
            <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} className="mt-1.5 w-full rounded border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50" />
          </label>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Evidence files</h3>
              <p className="mt-1 text-[11px] text-neutral-500">Select one file per stream. Maximum size: 25 MB each.</p>
            </div>
            <span className="font-mono text-[10px] text-neutral-500">IMAGE · VIDEO · AUDIO · TEXT</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {modalities.map(({ id, label, icon: Icon, helper }) => {
              const file = selectedFiles[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseFile(id)}
                  disabled={busy}
                  className="glass-panel-1 glass-hover group min-h-28 rounded p-3 text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400 group-hover:text-cyan-300">
                    <span>{label}</span>
                    {uploadedFiles.has(id) ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Upload className="h-3.5 w-3.5" />}
                  </div>
                  <Icon className="mt-3 h-5 w-5 text-cyan-300" />
                  <span className="mt-2 block truncate text-xs text-white">{file?.name ?? helper}</span>
                  <span className="mt-1 block text-[10px] text-neutral-500">{file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'Choose file'}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-neutral-500">PDF/DOCX documents are submitted using the API’s supported text evidence type. Analyzer support depends on backend integrations.</p>
        </div>

        {validationMessage && <p className="mt-4 text-xs text-cyan-200">{validationMessage}</p>}
        {error && (
          <div role="alert" className="mt-4 flex gap-2 rounded border border-red-400/25 bg-red-950/30 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {busy && (
          <div className="mt-5 flex items-center gap-3 rounded border border-cyan-400/20 bg-cyan-400/[0.05] p-4 text-sm text-cyan-100">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>Uploading evidence and requesting backend analysis…</span>
          </div>
        )}

        {result && (
          <section className="mt-6 rounded border border-white/10 bg-white/[0.025] p-4 sm:p-5" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">Backend analysis result</p>
                <p className="mt-1 text-lg font-semibold uppercase text-white">{result.status}</p>
              </div>
              <div className="text-right font-mono text-[10px] text-neutral-500">Investigation {result.investigation_id}</div>
            </div>

            {assessmentEntries.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {assessmentEntries.map(([key, value]) => (
                  <div key={key} className="rounded border border-white/[0.07] bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500">{key.replaceAll('_', ' ')}</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-xs text-neutral-200">{displayValue(value)}</p>
                  </div>
                ))}
              </div>
            )}

            {result.findings.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Findings</h3>
                <ul className="mt-2 space-y-2">
                  {result.findings.map((finding, index) => <li key={index} className="rounded border border-white/[0.07] p-3 text-xs text-neutral-200">{findingLabel(finding)}</li>)}
                </ul>
              </div>
            )}

            {result.evidence.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Analyzed evidence and signals</h3>
                <div className="mt-2 space-y-2">
                  {result.evidence.map((item) => (
                    <article key={item.evidence_id} className="rounded border border-white/[0.07] p-3">
                      <p className="text-xs font-medium text-white">{item.filename || item.evidence_id} <span className="ml-1 font-mono text-[10px] uppercase text-cyan-300">{item.type}</span></p>
                      {item.signals.length > 0 ? <ul className="mt-2 space-y-1 text-[11px] text-neutral-300">{item.signals.map((signal, index) => <li key={`${signal.name}-${index}`}>{signal.name} · {signal.severity} · {Math.round(signal.confidence * 100)}%{signal.description ? ` — ${signal.description}` : ''}</li>)}</ul> : <p className="mt-1 text-[11px] text-neutral-500">No signals returned.</p>}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {result.evidence_graph.nodes.length > 0 && (
              <p className="mt-4 text-[11px] text-neutral-400">Evidence graph: {result.evidence_graph.nodes.length} nodes · {result.evidence_graph.edges.length} relationships</p>
            )}

            {(result.limitations.length > 0 || assessmentEntries.length === 0 && result.findings.length === 0) && (
              <div className="mt-5 rounded border border-amber-300/20 bg-amber-300/[0.04] p-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-200">Limitations</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[11px] text-amber-100/80">
                  {(result.limitations.length ? result.limitations : ['The backend returned no assessment data. Configure analyzer and fusion integrations to produce assessments.']).map((limitation, index) => <li key={index}>{limitation}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        <footer className="mt-6 flex flex-col-reverse items-center justify-between gap-3 border-t border-white/[0.08] pt-4 sm:flex-row">
          <p className="text-center text-[10px] text-neutral-500 sm:text-left">Results are returned by configured backend analyzers; the interface does not invent a verdict.</p>
          <div className="flex w-full gap-2 sm:w-auto">
            <button onClick={onClose} className="glass-btn flex-1 rounded px-4 py-2.5 text-xs text-white sm:flex-none">Close</button>
            <button onClick={handleAnalyze} disabled={busy} className="glass-btn-primary flex flex-1 items-center justify-center gap-2 rounded px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
              {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
              {result ? 'Run again' : 'Start investigation'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}