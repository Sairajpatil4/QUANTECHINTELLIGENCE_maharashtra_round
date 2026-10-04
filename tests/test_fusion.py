import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from ai.fusion.fusion_engine import FusionEngine
from ai.fusion.schemas import Evidence, EvidenceSignal, SemanticContext
from app.schemas.evidence import EvidenceSignal as BackendEvidenceSignal
from app.schemas.evidence import StructuredEvidence
from app.services.fusion_adapter import TrustLayerFusionAdapter
from app.services.media_analyzer import MediaAnalyzerIntegration


class FusionEngineTests(unittest.TestCase):
	def setUp(self):
		self.engine = FusionEngine()

	def test_unavailable_detector_is_inconclusive(self):
		evidence = Evidence(
			evidence_id="ev_image_1",
			type="image",
			limitations=["No dedicated image manipulation detector is configured."],
		)

		result = self.engine.fuse([evidence])

		self.assertEqual(result.assessment.assessment, "inconclusive")
		self.assertEqual(result.assessment.findings, [])

	def test_one_strong_manipulation_signal_is_potential_concern(self):
		evidence = Evidence(
			evidence_id="ev_image_1",
			type="image",
			signals=[
				EvidenceSignal(
					name="AI-generated image detector",
					category="ai_generation",
					severity="high",
					confidence=0.91,
					value={"indicator": "synthetic_features"},
					description="Strong synthetic indicators.",
					source="test_detector",
				)
			],
		)

		result = self.engine.fuse([evidence])

		self.assertEqual(result.assessment.assessment, "potential_concern")
		self.assertEqual(result.assessment.findings[0].type, "manipulation_signal")

	def test_text_claim_extraction_alone_is_inconclusive(self):
		evidence = Evidence(
			evidence_id="ev_text_1",
			type="text",
			signals=[
				EvidenceSignal(
					name="location_claim",
					category="claim",
					severity="high",
					confidence=0.93,
					value="Mumbai",
					description="Text claims the event occurred in Mumbai.",
					source="gemma_text",
				)
			],
			limitations=[
				"Gemma extraction confidence is uncalibrated and does not indicate claim truth."
			],
		)

		result = self.engine.fuse([evidence])

		self.assertEqual(result.assessment.assessment, "inconclusive")
		self.assertEqual(result.assessment.findings, [])

	def test_location_conflict_is_cross_modal_finding(self):
		image = Evidence(
			evidence_id="ev_image_1",
			type="image",
			semantic_context=SemanticContext(location_hint="Mumbai"),
		)
		text = Evidence(
			evidence_id="ev_text_1",
			type="text",
			semantic_context=SemanticContext(location_hint="Pune"),
		)

		result = self.engine.fuse([image, text])

		self.assertEqual(result.assessment.assessment, "potential_concern")
		self.assertEqual(len(result.relationships), 1)
		self.assertEqual(result.relationships[0].relationship, "location_conflict")
		self.assertTrue(result.assessment.evidence_sufficiency.cross_modal_verification)
		self.assertEqual(result.assessment.evidence_sufficiency.level, "moderate")

	def test_same_modality_conflict_is_not_cross_modal_verification(self):
		image_one = Evidence(
			evidence_id="ev_image_1",
			type="image",
			semantic_context=SemanticContext(location_hint="Mumbai"),
		)
		image_two = Evidence(
			evidence_id="ev_image_2",
			type="image",
			semantic_context=SemanticContext(location_hint="Pune"),
		)
		text = Evidence(
			evidence_id="ev_text_1",
			type="text",
		)

		result = self.engine.fuse([image_one, image_two, text])

		self.assertEqual(len(result.relationships), 1)
		self.assertFalse(result.assessment.evidence_sufficiency.cross_modal_verification)

	def test_adapter_preserves_signal_category_and_value(self):
		evidence = StructuredEvidence(
			evidence_id="ev_image_1",
			type="image",
			filename="sample.png",
			signals=[
				BackendEvidenceSignal(
					name="AI-generated image detector",
					category="ai_generation",
					severity="high",
					confidence=0.91,
					value={"indicator": "synthetic_features"},
					description="Strong synthetic indicators.",
					source="test_detector",
				)
			],
		)

		result = TrustLayerFusionAdapter().fuse(
			investigation_id="inv_test_1",
			evidence=[evidence],
		)

		returned_signal = result.evidence[0].signals[0]
		self.assertEqual(returned_signal.category, "ai_generation")
		self.assertEqual(returned_signal.value, {"indicator": "synthetic_features"})
		self.assertEqual(returned_signal.source, "test_detector")


class MediaAnalyzerIntegrationTests(unittest.TestCase):
	def test_text_file_flows_through_structured_evidence_into_fusion(self):
		text = "The incident occurred in Mumbai."
		analyzed_evidence = Evidence(
			evidence_id="ev_text_1",
			type="text",
			metadata={"filename": "claim.txt"},
			signals=[
				EvidenceSignal(
					name="location_claim",
					category="claim",
					severity="high",
					confidence=0.93,
					value="Mumbai",
					description="Text claims the incident occurred in Mumbai.",
					source="gemma_text",
				)
			],
			semantic_context=SemanticContext(
				location_hint="Mumbai",
				claims=[text],
			),
			limitations=[
				"Gemma extraction confidence is uncalibrated and does not indicate claim truth."
			],
		)

		with tempfile.TemporaryDirectory() as temporary_directory:
			text_path = Path(temporary_directory) / "claim.txt"
			text_path.write_bytes(b"\xef\xbb\xbf" + text.encode("utf-8"))
			with patch(
				"ai.text.analyzer.analyze_text",
				return_value=analyzed_evidence,
			) as mocked_analyze_text:
				structured = MediaAnalyzerIntegration().analyze(
					evidence_id="ev_text_1",
					file_path=str(text_path),
					evidence_type="text",
				)

		mocked_analyze_text.assert_called_once_with(
			text,
			"ev_text_1",
			filename="claim.txt",
		)
		self.assertEqual(structured.evidence_type, "text")
		self.assertEqual(structured.semantic_context["location_hint"], "Mumbai")
		self.assertEqual(structured.signals[0].category, "claim")
		self.assertEqual(structured.signals[0].source, "gemma_text")

		result = TrustLayerFusionAdapter().fuse(
			investigation_id="inv_text_1",
			evidence=[structured],
		)

		self.assertEqual(result.assessment["assessment"], "inconclusive")
		self.assertEqual(result.findings, [])
		self.assertEqual(result.evidence[0].semantic_context["claims"], [text])

		image = StructuredEvidence(
			evidence_id="ev_image_1",
			type="image",
			filename="incident.png",
			semantic_context={"location_hint": "Pune"},
			limitations=[
				"No dedicated image manipulation detector is configured."
			],
		)
		cross_modal_result = TrustLayerFusionAdapter().fuse(
			investigation_id="inv_text_image_1",
			evidence=[structured, image],
		)

		self.assertEqual(
			cross_modal_result.assessment["assessment"],
			"potential_concern",
		)
		self.assertEqual(
			cross_modal_result.evidence_graph.edges[0].relationship,
			"location_conflict",
		)

	def test_pdf_upload_returns_limitation_without_calling_text_analyzer(self):
		with tempfile.TemporaryDirectory() as temporary_directory:
			pdf_path = Path(temporary_directory) / "claim.pdf"
			pdf_path.write_bytes(b"%PDF-1.7")
			with patch("ai.text.analyzer.analyze_text") as mocked_analyze_text:
				structured = MediaAnalyzerIntegration().analyze(
					evidence_id="ev_pdf_1",
					file_path=str(pdf_path),
					evidence_type="text",
				)

		mocked_analyze_text.assert_not_called()
		self.assertEqual(structured.evidence_type, "text")
		self.assertEqual(structured.signals, [])
		self.assertTrue(any("PDF files" in item for item in structured.limitations))


if __name__ == "__main__":
	unittest.main()