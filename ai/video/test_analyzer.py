import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import cv2
import numpy as np

from ai.fusion.schemas import Evidence
from ai.video.analyzer3 import analyze_video


class FakeResponse:
	def __init__(self, body):
		self.body = body

	def __enter__(self):
		return self

	def __exit__(self, exc_type, exc_value, traceback):
		return False

	def read(self):
		return json.dumps(self.body).encode("utf-8")


class AnalyzeVideoTests(unittest.TestCase):
	def setUp(self):
		self.temp_dir = tempfile.TemporaryDirectory()
		self.video_path = Path(self.temp_dir.name) / "sample.avi"
		writer = cv2.VideoWriter(
			str(self.video_path),
			cv2.VideoWriter_fourcc(*"MJPG"),
			5.0,
			(32, 24),
		)
		if not writer.isOpened():
			self.skipTest("OpenCV MJPG video writer is unavailable.")
		for value in (40, 100, 180):
			frame = np.full((24, 32, 3), value, dtype=np.uint8)
			writer.write(frame)
		writer.release()

	def tearDown(self):
		self.temp_dir.cleanup()

	@patch("ai.video.analyzer3.urlopen")
	def test_returns_shared_evidence_for_sampled_video(self, mocked_urlopen):
		mocked_urlopen.return_value = FakeResponse(
			{
				"message": {
					"content": json.dumps(
						{
							"objects": ["shape"],
							"entities": [],
							"scene": "A shape changes brightness.",
							"location_hint": "null",
							"timestamp_hint": None,
							"claims": [],
						}
					)
				}
			}
		)

		evidence = analyze_video(evidence_id="ev_vid_001", file_path=str(self.video_path))

		self.assertIsInstance(evidence, Evidence)
		self.assertEqual(evidence.type, "video")
		self.assertEqual(evidence.metadata["filename"], "sample.avi")
		self.assertEqual(evidence.metadata["frame_count"], 3)
		self.assertEqual(evidence.metadata["sampled_frame_indices"], [0, 1, 2])
		self.assertEqual(evidence.semantic_context.objects, ["shape"])
		self.assertIsNone(evidence.semantic_context.location_hint)
		self.assertEqual(evidence.signals, [])
		self.assertIn("face_deepfake_detector", evidence.metadata)
		self.assertTrue(
			any("fully AI-generated text-to-video" in item for item in evidence.limitations)
		)

	@patch("ai.video.analyzer3.urlopen")
	@patch("ai.video.analyzer3.analyze_face_deepfakes")
	def test_emits_scoped_signal_for_face_manipulation_score(
		self,
		mocked_detector,
		mocked_urlopen,
	):
		mocked_detector.return_value = {
			"status": "completed",
			"predictions": [
				{
					"frame_index": 1,
					"face_index": 0,
					"face_manipulation_probability": 0.82,
					"indicator_threshold": 0.5,
				}
			],
			"limitations": ["Detector crop limitation."],
		}
		mocked_urlopen.return_value = FakeResponse(
			{
				"message": {
					"content": json.dumps(
						{
							"objects": [],
							"entities": [],
							"scene": None,
							"location_hint": None,
							"timestamp_hint": None,
							"claims": [],
						}
					)
				}
			}
		)

		evidence = analyze_video(evidence_id="ev_vid_004", file_path=str(self.video_path))

		self.assertEqual(len(evidence.signals), 1)
		self.assertEqual(evidence.signals[0].category, "face_manipulation")
		self.assertEqual(evidence.signals[0].severity, "high")
		self.assertEqual(evidence.signals[0].confidence, 0.82)
		self.assertEqual(evidence.metadata["face_deepfake_detector"]["status"], "completed")

	@patch("ai.video.analyzer3.urlopen", side_effect=OSError("Ollama offline"))
	@patch("ai.video.analyzer3.analyze_face_deepfakes")
	def test_unavailable_face_detector_returns_empty_signals_and_limitation(
		self,
		mocked_detector,
		mocked_urlopen,
	):
		mocked_detector.return_value = {
			"status": "unavailable",
			"predictions": [],
			"limitations": ["Face deepfake detector unavailable: ImportError: missing package."],
		}

		evidence = analyze_video(evidence_id="ev_vid_005", file_path=str(self.video_path))

		self.assertEqual(evidence.signals, [])
		self.assertEqual(evidence.metadata["face_deepfake_detector"]["status"], "unavailable")
		self.assertTrue(any("detector unavailable" in item for item in evidence.limitations))

	@patch("ai.video.analyzer3.urlopen", side_effect=OSError("Ollama offline"))
	def test_preserves_video_metadata_when_ollama_is_unavailable(self, mocked_urlopen):
		evidence = analyze_video(evidence_id="ev_vid_002", file_path=str(self.video_path))

		self.assertIsInstance(evidence, Evidence)
		self.assertEqual(evidence.metadata["frame_count"], 3)
		self.assertEqual(evidence.semantic_context.objects, [])
		self.assertTrue(evidence.limitations)

	def test_missing_file_returns_valid_evidence(self):
		missing_path = Path(self.temp_dir.name) / "missing.mp4"
		evidence = analyze_video(evidence_id="ev_vid_003", file_path=str(missing_path))

		self.assertIsInstance(evidence, Evidence)
		self.assertEqual(evidence.metadata["filename"], "missing.mp4")
		self.assertTrue(evidence.limitations)


if __name__ == "__main__":
	unittest.main()