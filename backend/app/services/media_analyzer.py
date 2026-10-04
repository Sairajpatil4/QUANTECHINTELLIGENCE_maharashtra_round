from ai.fusion.schemas import Evidence as AnalyzerEvidence
from ai.audio.analyzer1 import analyze_audio
from ai.image.analyzer2 import analyze_image
from ai.video.analyzer3 import analyze_video

from app.schemas.evidence import EvidenceSignal, EvidenceType, StructuredEvidence
from app.services.integrations import UnconfiguredAnalyzer


class MediaAnalyzerIntegration:
	def analyze(
		self,
		*,
		evidence_id: str,
		file_path: str,
		evidence_type: EvidenceType,
	) -> StructuredEvidence:
		if evidence_type == "image":
			analyzed_evidence = analyze_image(file_path, evidence_id)
		elif evidence_type == "audio":
			analyzed_evidence = analyze_audio(file_path, evidence_id)
		elif evidence_type == "video":
			analyzed_evidence = analyze_video(
				evidence_id=evidence_id,
				file_path=file_path,
			)
		else:
			return UnconfiguredAnalyzer().analyze(
				evidence_id=evidence_id,
				file_path=file_path,
				evidence_type=evidence_type,
			)

		media_evidence: AnalyzerEvidence = analyzed_evidence
		return StructuredEvidence(
			evidence_id=media_evidence.evidence_id,
			type=media_evidence.type,
			filename=media_evidence.metadata.get("filename"),
			metadata=media_evidence.metadata,
			signals=[
				EvidenceSignal(
					name=signal.name,
					severity=signal.severity,
					confidence=signal.confidence,
					description=signal.description,
					category=signal.category,
					value=signal.value,
					source=signal.source,
				)
				for signal in media_evidence.signals
			],
			semantic_context=media_evidence.semantic_context.model_dump(mode="json"),
			limitations=media_evidence.limitations,
		)
