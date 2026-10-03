from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


EvidenceType = Literal["image", "video", "text", "audio"]
EvidenceStatus = Literal["uploaded", "processing", "completed", "failed"]
Severity = Literal["low", "medium", "high"]


class EvidenceSignal(BaseModel):
	name: str
	severity: Severity
	confidence: float = Field(ge=0.0, le=1.0)
	description: str | None = None


class StructuredEvidence(BaseModel):
	model_config = ConfigDict(populate_by_name=True)

	evidence_id: str
	evidence_type: EvidenceType = Field(alias="type")
	filename: str | None
	metadata: dict[str, Any] = Field(default_factory=dict)
	signals: list[EvidenceSignal] = Field(default_factory=list)
	semantic_context: dict[str, Any] = Field(default_factory=dict)
	limitations: list[str] = Field(default_factory=list)


class EvidenceUploadResponse(BaseModel):
	evidence_id: str
	investigation_id: str
	type: EvidenceType
	filename: str
	status: EvidenceStatus


class EvidenceGraphNode(BaseModel):
	id: str
	type: str
	label: str | None = None


class EvidenceGraphEdge(BaseModel):
	source: str
	target: str
	relationship: str
	confidence: float | None = Field(default=None, ge=0.0, le=1.0)
	explanation: str | None = None


class EvidenceGraph(BaseModel):
	nodes: list[EvidenceGraphNode] = Field(default_factory=list)
	edges: list[EvidenceGraphEdge] = Field(default_factory=list)


class AnalysisResult(BaseModel):
	investigation_id: str
	status: Literal["created", "processing", "completed", "failed"]
	assessment: dict[str, Any] = Field(default_factory=dict)
	evidence: list[StructuredEvidence] = Field(default_factory=list)
	findings: list[dict[str, Any]] = Field(default_factory=list)
	limitations: list[str] = Field(default_factory=list)
	evidence_graph: EvidenceGraph = Field(default_factory=EvidenceGraph)
