import unittest

from ai.fusion.fusion_engine import FusionEngine
from ai.fusion.schemas import Evidence, EvidenceSignal, SemanticContext
from app.schemas.evidence import EvidenceSignal as BackendEvidenceSignal
from app.schemas.evidence import StructuredEvidence
from app.services.fusion_adapter import TrustLayerFusionAdapter


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


if __name__ == "__main__":
	unittest.main()