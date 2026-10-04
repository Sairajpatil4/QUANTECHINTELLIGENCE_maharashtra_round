import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import URLError

from PIL import Image

from ai.image.analyzer2 import analyze_image


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def read(self):
        return json.dumps(self.body).encode("utf-8")


class AnalyzeImageTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.image_path = Path(self.temp_dir.name) / "sample.png"
        Image.new("RGB", (32, 24), color="white").save(self.image_path)
        forensics_patcher = patch(
            "ai.image.analyzer2.analyze_forensics",
            return_value=([], []),
        )
        forensics_patcher.start()
        self.addCleanup(forensics_patcher.stop)

    def tearDown(self):
        self.temp_dir.cleanup()

    @patch("ai.image.analyzer2.urlopen")
    def test_returns_common_evidence_with_metadata_and_context(self, mocked_urlopen):
        mocked_urlopen.return_value = FakeResponse(
            {
                "message": {
                    "content": json.dumps(
                        {
                            "objects": ["building"],
                            "scene": "A building against a white background.",
                            "location_hint": "null",
                            "timestamp_hint": "null",
                            "entities": [],
                        }
                    )
                }
            }
        )

        evidence = analyze_image(str(self.image_path), "ev_img_001")

        self.assertEqual(evidence.type, "image")
        self.assertEqual(evidence.metadata["filename"], "sample.png")
        self.assertEqual(evidence.metadata["width"], 32)
        self.assertEqual(evidence.metadata["height"], 24)
        self.assertEqual(evidence.semantic_context.objects, ["building"])
        self.assertIsNone(evidence.semantic_context.location_hint)
        self.assertIsNone(evidence.semantic_context.timestamp_hint)
        self.assertEqual(evidence.semantic_context.claims, [])
        self.assertEqual(evidence.signals, [])
        self.assertTrue(evidence.limitations)

    @patch("ai.image.analyzer2.urlopen", side_effect=URLError("offline"))
    def test_ollama_failure_preserves_metadata(self, mocked_urlopen):
        evidence = analyze_image(str(self.image_path), "ev_img_002")

        self.assertEqual(evidence.metadata["format"], "PNG")
        self.assertIsNone(evidence.semantic_context.location_hint)
        self.assertTrue(evidence.limitations)

    @patch("ai.image.analyzer2.extract_image_metadata")
    @patch("ai.image.analyzer2.urlopen")
    def test_exif_location_and_timestamp_fill_missing_context(
        self,
        mocked_urlopen,
        mocked_metadata,
    ):
        mocked_metadata.return_value = {
            "format": "PNG",
            "width": 32,
            "height": 24,
            "file_size": 100,
            "created_at": "2026-09-14T10:30:00",
            "camera_make": None,
            "camera_model": None,
            "software": None,
            "gps_latitude": 19.076,
            "gps_longitude": 72.8777,
        }
        mocked_urlopen.return_value = FakeResponse(
            {
                "message": {
                    "content": json.dumps(
                        {
                            "objects": [],
                            "scene": "",
                            "location_hint": None,
                            "timestamp_hint": None,
                            "entities": [],
                        }
                    )
                }
            }
        )

        evidence = analyze_image(str(self.image_path), "ev_img_004")

        self.assertEqual(
            evidence.semantic_context.location_hint,
            "19.076000, 72.877700 (EXIF GPS)",
        )
        self.assertEqual(
            evidence.semantic_context.timestamp_hint,
            "2026-09-14T10:30:00",
        )

    def test_unsupported_file_returns_evidence_and_limitation(self):
        invalid_path = Path(self.temp_dir.name) / "invalid.txt"
        invalid_path.write_text("not an image", encoding="utf-8")

        with patch("ai.image.analyzer2.urlopen") as mocked_urlopen:
            evidence = analyze_image(str(invalid_path), "ev_img_003")

        mocked_urlopen.assert_not_called()
        self.assertEqual(evidence.type, "image")
        self.assertEqual(evidence.metadata["filename"], "invalid.txt")
        self.assertEqual(evidence.signals, [])
        self.assertTrue(evidence.limitations)

    @patch("ai.image.analyzer2.analyze_forensics")
    @patch("ai.image.analyzer2.urlopen")
    def test_forensic_detector_signal_is_preserved(
        self,
        mocked_urlopen,
        mocked_forensics,
    ):
        mocked_urlopen.return_value = FakeResponse(
            {
                "message": {
                    "content": json.dumps(
                        {
                            "objects": [],
                            "scene": "",
                            "location_hint": None,
                            "timestamp_hint": None,
                            "entities": [],
                        }
                    )
                }
            }
        )
        mocked_forensics.return_value = (
            [
                {
                    "name": "AI-generated image classifier score",
                    "category": "ai_generation",
                    "severity": "high",
                    "confidence": 0.91,
                    "value": {"ai_generated_class_score": 0.91},
                    "description": "An AI-generation classifier indicator.",
                    "source": "test_detector",
                }
            ],
            ["Detector scope limitation."],
        )

        evidence = analyze_image(str(self.image_path), "ev_img_signal_001")

        self.assertEqual(evidence.signals[0].category, "ai_generation")
        self.assertEqual(evidence.signals[0].confidence, 0.91)
        self.assertEqual(evidence.signals[0].source, "test_detector")
        self.assertIn("Detector scope limitation.", evidence.limitations)


if __name__ == "__main__":
    unittest.main()