import sys
import unittest
from contextlib import nullcontext
from unittest.mock import patch

from PIL import Image

from ai.video.forensics import analyze_face_deepfakes


class FakeProbabilities:
	def __getitem__(self, index):
		self.index = index
		return self

	def item(self):
		return 0.82


class FakeTorch:
	@staticmethod
	def inference_mode():
		return nullcontext()

	@staticmethod
	def softmax(logits, dim):
		return FakeProbabilities()


class FakeFeatureExtractor:
	@staticmethod
	def preprocess(image):
		return FakeInput()


class FakeInput:
	@staticmethod
	def unsqueeze(dimension):
		return FakeInput()


class FakeDetector:
	feature_extractor = FakeFeatureExtractor()

	@staticmethod
	def __call__(input_tensor):
		return object()


class FaceDeepfakeDetectorTests(unittest.TestCase):
	@patch("ai.video.forensics._load_detector", return_value=FakeDetector())
	@patch("ai.video.forensics._face_crops")
	def test_returns_model_score_for_each_face(self, mocked_crops, mocked_model):
		mocked_crops.return_value = ([(4, Image.new("RGB", (32, 32)))], False)
		with patch.dict(sys.modules, {"torch": FakeTorch}):
			result = analyze_face_deepfakes([object()], [4])

		self.assertEqual(result["status"], "completed")
		self.assertEqual(
			result["predictions"][0]["face_manipulation_probability"],
			0.82,
		)
		self.assertEqual(result["predictions"][0]["frame_index"], 4)

	@patch("ai.video.forensics._face_crops", return_value=([], False))
	def test_no_faces_is_not_reported_as_authentic(self, mocked_crops):
		result = analyze_face_deepfakes([object()], [0])

		self.assertEqual(result["status"], "no_faces")
		self.assertEqual(result["predictions"], [])
		self.assertTrue(any("could not be assessed" in item for item in result["limitations"]))

	@patch(
		"ai.video.forensics._face_crops",
		return_value=([(0, Image.new("RGB", (32, 32)))], False),
	)
	def test_missing_model_dependency_reports_unavailable(self, mocked_crops):
		with patch.dict(sys.modules, {"torch": None}):
			result = analyze_face_deepfakes([object()], [0])

		self.assertEqual(result["status"], "unavailable")
		self.assertEqual(result["predictions"], [])
		self.assertTrue(any("detector unavailable" in item for item in result["limitations"]))


if __name__ == "__main__":
	unittest.main()
