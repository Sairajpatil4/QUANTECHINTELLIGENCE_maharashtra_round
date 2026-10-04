import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import numpy as np
import soundfile as sf
import torch

from ai.audio.analyzer1 import _detect_ai_speech, analyze_audio
from ai.audio.speech import analyze_acoustic_chunks, extract_acoustic_features
from ai.fusion.schemas import Evidence


class FakeFeatureExtractor:
	@staticmethod
	def __call__(audio, sampling_rate, return_tensors):
		return {
			"input_values": torch.tensor(audio, dtype=torch.float32).unsqueeze(0)
		}


class FakeAudioModel:
	config = SimpleNamespace(
		id2label={0: "AIVoice", 1: "HumanVoice"},
	)

	@staticmethod
	def __call__(**inputs):
		return SimpleNamespace(logits=torch.tensor([[3.0, 1.0]]))


class AnalyzeAudioTests(unittest.TestCase):
	def setUp(self):
		self.temp_dir = tempfile.TemporaryDirectory()
		self.audio_path = Path(self.temp_dir.name) / "speech.wav"
		samples = np.sin(
			2 * np.pi * 220 * np.arange(16_000, dtype=np.float32) / 16_000
		)
		sf.write(self.audio_path, samples, 16_000)

	def tearDown(self):
		self.temp_dir.cleanup()

	@patch(
		"ai.audio.analyzer1._detect_ai_speech",
		return_value={
			"status": "completed",
			"score": 0.88,
			"indicator": "ai_speech_indicator",
			"threshold": 0.5,
			"predictions": [{"ai_speech_score": 0.88}],
			"limitations": [],
		},
	)
	def test_emits_scoped_signal_and_audio_metadata(self, mocked_detector):
		evidence = analyze_audio(str(self.audio_path), "ev_audio_001")

		self.assertIsInstance(evidence, Evidence)
		self.assertEqual(evidence.type, "audio")
		self.assertEqual(evidence.metadata["sample_rate"], 16_000)
		self.assertEqual(evidence.metadata["channels"], 1)
		acoustic_features = evidence.metadata["acoustic_features"]
		self.assertIn("descriptive only", acoustic_features["method"])
		self.assertAlmostEqual(
			acoustic_features["chunks"][0]["estimated_pitch_median_hz"],
			220,
			delta=5,
		)
		self.assertEqual(evidence.signals[0].category, "ai_generated_speech")
		self.assertEqual(evidence.signals[0].confidence, 0.88)
		self.assertTrue(
			any("not calibrated probabilities" in item for item in evidence.limitations)
		)

	@patch(
		"ai.audio.analyzer1._detect_ai_speech",
		return_value={
			"status": "unavailable",
			"score": None,
			"indicator": None,
			"threshold": 0.5,
			"predictions": [],
			"limitations": ["AI-speech detector unavailable: ImportError."],
		},
	)
	def test_unavailable_detector_returns_empty_signals_and_limitation(
		self,
		mocked_detector,
	):
		evidence = analyze_audio(str(self.audio_path), "ev_audio_002")

		self.assertEqual(evidence.signals, [])
		self.assertTrue(
			any("detector unavailable" in item for item in evidence.limitations)
		)

	def test_missing_file_returns_limitation(self):
		evidence = analyze_audio(
			str(Path(self.temp_dir.name) / "missing.wav"),
			"ev_audio_003",
		)

		self.assertEqual(evidence.signals, [])
		self.assertTrue(any("does not exist" in item for item in evidence.limitations))

	@patch(
		"ai.audio.analyzer1._load_detector",
		return_value=(FakeFeatureExtractor(), FakeAudioModel()),
	)
	def test_detector_scores_audio_chunks_with_label_mapping(self, mocked_model):
		result = _detect_ai_speech(np.ones(16_000, dtype=np.float32))

		self.assertEqual(result["status"], "completed")
		self.assertEqual(result["indicator"], "ai_speech_indicator")
		self.assertGreater(result["score"], 0.5)

	def test_silence_features_do_not_invent_a_pitch(self):
		features = extract_acoustic_features(np.zeros(16_000, dtype=np.float32))

		self.assertIsNone(features["estimated_pitch_median_hz"])
		self.assertEqual(features["rms_mean"], 0)
		self.assertEqual(features["voiced_frame_fraction"], 0)

	def test_acoustic_features_follow_bounded_chunk_length(self):
		audio = np.zeros(25 * 16_000, dtype=np.float32)

		chunks = analyze_acoustic_chunks(audio, chunk_seconds=10)

		self.assertEqual(len(chunks), 3)
		self.assertEqual(chunks[-1]["start_seconds"], 20)
		self.assertEqual(chunks[-1]["duration_seconds"], 5)


if __name__ == "__main__":
	unittest.main()
