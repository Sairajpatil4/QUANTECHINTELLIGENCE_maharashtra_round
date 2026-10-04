import os
from pathlib import Path

from ai.fusion.schemas import Evidence as AnalyzerEvidence

from app.schemas.evidence import EvidenceSignal, EvidenceType, StructuredEvidence
from app.services.integrations import UnconfiguredAnalyzer


_UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS = {".doc", ".docx", ".odt", ".pdf", ".rtf"}


class MediaAnalyzerIntegration:
	def analyze(
		self,
		*,
		evidence_id: str,
		file_path: str,
		evidence_type: EvidenceType,
	) -> StructuredEvidence:
		if evidence_type == "image":
			from ai.image.analyzer2 import analyze_image

			analyzed_evidence = analyze_image(file_path, evidence_id)
		elif evidence_type == "audio":
			from ai.audio.analyzer1 import analyze_audio

			analyzed_evidence = analyze_audio(file_path, evidence_id)
		elif evidence_type == "video":
			from ai.video.analyzer3 import analyze_video

			analyzed_evidence = analyze_video(
				evidence_id=evidence_id,
				file_path=file_path,
			)
		elif evidence_type == "text":
			path = Path(file_path)
			if path.suffix.lower() in _UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS:
				analyzed_evidence = AnalyzerEvidence(
					evidence_id=evidence_id,
					type="text",
					metadata={"filename": path.name},
					limitations=[
						f"Text extraction from {path.suffix.upper()} files is not configured; "
						"no text analysis was performed."
					],
				)
			else:
				try:
					text = path.read_text(encoding="utf-8-sig")
				except UnicodeDecodeError:
					analyzed_evidence = AnalyzerEvidence(
						evidence_id=evidence_id,
						type="text",
						metadata={"filename": path.name},
						limitations=[
							"Text evidence is not valid UTF-8; no text analysis was performed."
						],
					)
				else:
					from ai.text.analyzer import analyze_text

					text_model = os.getenv("TRUSTLAYER_TEXT_MODEL")
					if text_model:
						analyzed_evidence = analyze_text(
							text,
							evidence_id,
							filename=path.name,
							model=text_model,
						)
					else:
						analyzed_evidence = analyze_text(
							text,
							evidence_id,
							filename=path.name,
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
