export type EvidenceType = 'image' | 'video' | 'text' | 'audio';

export interface InvestigationResponse {
  investigation_id: string;
  title: string;
  description: string | null;
  status: 'created' | 'processing' | 'completed' | 'failed';
}

export interface EvidenceUploadResponse {
  evidence_id: string;
  investigation_id: string;
  type: EvidenceType;
  filename: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisResult {
  investigation_id: string;
  status: 'created' | 'processing' | 'completed' | 'failed';
  assessment: Record<string, unknown>;
  evidence: Array<{
    evidence_id: string;
    type: EvidenceType;
    filename: string | null;
    signals: Array<{
      name: string;
      severity: 'low' | 'medium' | 'high';
      confidence: number;
      description?: string | null;
      category?: string | null;
      value?: unknown;
      source?: string | null;
    }>;
    limitations: string[];
  }>;
  findings: Array<Record<string, unknown>>;
  limitations: string[];
  evidence_graph: {
    nodes: Array<{ id: string; type: string; label?: string | null }>;
    edges: Array<{
      source: string;
      target: string;
      relationship: string;
      confidence?: number | null;
      explanation?: string | null;
    }>;
  };
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new Error('Cannot reach the TrustLayer API. Check that the backend is running on port 8000.');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as
      | { message?: string; detail?: string }
      | null;
    throw new Error(payload?.message || payload?.detail || `API request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export function createInvestigation(title: string, description: string) {
  return request<InvestigationResponse>('/investigations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description: description || null }),
  });
}

export function uploadEvidence(
  investigationId: string,
  file: File,
  type: EvidenceType,
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  return request<EvidenceUploadResponse>(
    `/investigations/${encodeURIComponent(investigationId)}/evidence`,
    { method: 'POST', body: formData },
  );
}

export function analyzeInvestigation(investigationId: string) {
  return request<AnalysisResult>(
    `/investigations/${encodeURIComponent(investigationId)}/analyze`,
    { method: 'POST' },
  );
}

export function getAnalysisResults(investigationId: string) {
  return request<AnalysisResult>(
    `/investigations/${encodeURIComponent(investigationId)}/results`,
  );
}