from typing import Protocol, Sequence

from app.schemas.evidence import AnalysisResult, EvidenceType, StructuredEvidence


class IntegrationUnavailable(Exception):
	pass


class AnalyzerIntegration(Protocol):
	def analyze(
		self,
		*,
		evidence_id: str,
		file_path: str,
		evidence_type: EvidenceType,
	) -> StructuredEvidence:
		...


class FusionIntegration(Protocol):
	def fuse(
		self,
		*,
		investigation_id: str,
		evidence: Sequence[StructuredEvidence],
	) -> AnalysisResult:
		...


class UnavailableAnalyzer:
	def analyze(
		self,
		*,
		evidence_id: str,
		file_path: str,
		evidence_type: EvidenceType,
	) -> StructuredEvidence:
		raise IntegrationUnavailable(
			f"No analyzer is configured for {evidence_type} evidence."
		)


class UnavailableFusion:
	def fuse(
		self,
		*,
		investigation_id: str,
		evidence: Sequence[StructuredEvidence],
	) -> AnalysisResult:
		raise IntegrationUnavailable("The evidence fusion implementation is not configured.")


_analyzer: AnalyzerIntegration = UnavailableAnalyzer()
_fusion: FusionIntegration = UnavailableFusion()


def register_analyzer(integration: AnalyzerIntegration) -> None:
	global _analyzer
	_analyzer = integration


def register_fusion(integration: FusionIntegration) -> None:
	global _fusion
	_fusion = integration


def get_analyzer() -> AnalyzerIntegration:
	return _analyzer


def get_fusion() -> FusionIntegration:
	return _fusion