from collections.abc import Sequence
from typing import Any

from ai.fusion.fusion_engine import FusionEngine
from ai.fusion.schemas import Evidence, EvidenceSignal as FusionSignal
from ai.fusion.schemas import FusionResult

from app.schemas.evidence import (
	AnalysisResult,
	EvidenceGraphEdge,
	EvidenceGraphNode,
	StructuredEvidence,
)


class TrustLayerFusionAdapter:
	def fuse(
		self,
		*,
		investigation_id: str,
		evidence: Sequence[StructuredEvidence],
	) -> AnalysisResult:
		fusion_evidence = [self._to_fusion_evidence(item) for item in evidence]
		result = FusionEngine().fuse(fusion_evidence)
		return self._to_analysis_result(investigation_id, result)

	@staticmethod
	def _to_fusion_evidence(item: StructuredEvidence) -> Evidence:
		metadata = dict(item.metadata)
		if item.filename is not None:
			metadata["filename"] = item.filename

		return Evidence(
			evidence_id=item.evidence_id,
			type=item.evidence_type,
			metadata=metadata,
			signals=[
				FusionSignal(
					name=signal.name,
					category=signal.category or "analyzer_signal",
					severity=signal.severity,
					confidence=signal.confidence,
					value=signal.value,
					description=signal.description,
					source=signal.source,
				)
				for signal in item.signals
			],
			semantic_context=item.semantic_context,
			limitations=item.limitations,
		)

	@staticmethod
	def _to_analysis_result(
		investigation_id: str,
		result: FusionResult,
	) -> AnalysisResult:
		converted_evidence = [
			TrustLayerFusionAdapter._to_backend_evidence(item)
			for item in result.evidence
		]
		return AnalysisResult(
			investigation_id=investigation_id,
			status="completed",
			assessment=result.assessment.model_dump(mode="json"),
			findings=[
				finding.model_dump(mode="json")
				for finding in result.assessment.findings
			],
			limitations=result.assessment.limitations,
			evidence=converted_evidence,
			evidence_graph={
				"nodes": [
					EvidenceGraphNode(
						id=item.evidence_id,
						type=item.evidence_type,
						label=item.filename,
					)
					for item in converted_evidence
				],
				"edges": [
					EvidenceGraphEdge(
						source=relationship.source_evidence_id,
						target=relationship.target_evidence_id,
						relationship=relationship.relationship,
						confidence=relationship.confidence,
						explanation=relationship.explanation,
					)
					for relationship in result.relationships
				],
			},
		)

	@staticmethod
	def _to_backend_evidence(item: Evidence) -> StructuredEvidence:
		metadata: dict[str, Any] = dict(item.metadata)
		filename = metadata.pop("filename", None)
		return StructuredEvidence(
			evidence_id=item.evidence_id,
			type=item.type,
			filename=filename,
			metadata=metadata,
			signals=[
				{
					"name": signal.name,
					"severity": signal.severity,
					"confidence": signal.confidence,
					"description": signal.description,
					"category": signal.category,
					"value": signal.value,
					"source": signal.source,
				}
				for signal in item.signals
			],
			semantic_context=item.semantic_context.model_dump(
				mode="json",
				exclude_none=True,
			),
			limitations=item.limitations,
		)