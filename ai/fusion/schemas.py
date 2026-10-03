from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


# ============================================================
# BASIC TYPES
# ============================================================

EvidenceType = Literal[
    "image",
    "video",
    "audio",
    "text",
]

SignalSeverity = Literal[
    "low",
    "medium",
    "high",
]

AssessmentType = Literal[
    "potential_concern",
    "inconclusive",
    "no_significant_manipulation_signals",
    "high_concern",
]

SufficiencyLevel = Literal[
    "limited",
    "moderate",
    "strong",
]


# ============================================================
# EVIDENCE SIGNAL
# ============================================================

class EvidenceSignal(BaseModel):
    """
    A single observable signal extracted from an evidence item.

    Examples:
    - AI-generation indicator
    - compression inconsistency
    - metadata anomaly
    - temporal inconsistency
    - location mismatch
    """

    name: str

    category: str

    severity: SignalSeverity = "low"

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    value: Any = None

    description: Optional[str] = None

    source: Optional[str] = None


# ============================================================
# SEMANTIC CONTEXT
# ============================================================

class SemanticContext(BaseModel):
    """
    Semantic information extracted from an evidence item.

    This is useful for cross-modal reasoning.
    """

    objects: List[str] = Field(
        default_factory=list
    )
    
    entities: List[str] = Field(default_factory=list)

    scene: Optional[str] = None

    location_hint: Optional[str] = None

    timestamp_hint: Optional[str] = None

    claims: List[str] = Field(
        default_factory=list
    )


# ============================================================
# EVIDENCE
# ============================================================

class Evidence(BaseModel):
    """
    Standard representation of one piece of evidence.

    Every modality analyzer must eventually produce
    an object conforming to this structure.
    """

    evidence_id: str

    type: EvidenceType

    metadata: Dict[str, Any] = Field(
        default_factory=dict
    )

    signals: List[EvidenceSignal] = Field(
        default_factory=list
    )

    semantic_context: SemanticContext = Field(
        default_factory=SemanticContext
    )

    limitations: List[str] = Field(
        default_factory=list
    )


# ============================================================
# EVIDENCE RELATIONSHIP
# ============================================================

class EvidenceRelationship(BaseModel):
    """
    Relationship discovered between two evidence items.

    These relationships form the basis of the Evidence Graph.
    """

    relationship_id: str

    source_evidence_id: str

    target_evidence_id: str

    relationship: Literal[
        "corroborates",
        "contradicts",
        "visual_similarity",
        "semantic_conflict",
        "location_conflict",
        "temporal_conflict",
        "timestamp_conflict",
    ]

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    explanation: str


# ============================================================
# EVIDENCE SUFFICIENCY
# ============================================================

class EvidenceSufficiency(BaseModel):
    """
    Describes whether the available evidence is sufficient
    for a meaningful assessment.
    """

    level: SufficiencyLevel

    evidence_count: int = Field(
        ge=0
    )

    available_modalities: List[EvidenceType] = Field(
        default_factory=list
    )

    cross_modal_verification: bool = False

    reason: str


# ============================================================
# FINDING
# ============================================================

class Finding(BaseModel):
    """
    An explainable conclusion produced by the fusion layer.

    Every important finding should be traceable back to
    one or more evidence items.
    """

    type: str

    evidence: List[str] = Field(
        default_factory=list
    )

    explanation: str

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    relationship_ids: List[str] = Field(
        default_factory=list
    )


# ============================================================
# TRUST ASSESSMENT
# ============================================================

class TrustAssessment(BaseModel):
    """
    Final uncertainty-aware assessment of the investigation.
    """

    assessment: AssessmentType

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    summary: str

    findings: List[Finding] = Field(
        default_factory=list
    )

    limitations: List[str] = Field(
        default_factory=list
    )

    evidence_sufficiency: EvidenceSufficiency


# ============================================================
# FUSION RESULT
# ============================================================

class FusionResult(BaseModel):
    """
    Complete output of the Evidence Fusion layer.

    This is what the backend/frontend ultimately consume.
    """

    evidence: List[Evidence]

    relationships: List[EvidenceRelationship] = Field(
        default_factory=list
    )

    assessment: TrustAssessment