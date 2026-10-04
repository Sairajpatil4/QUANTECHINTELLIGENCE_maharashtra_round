"""Local face-manipulation detector for sampled video frames."""

from functools import lru_cache
from typing import Any, Dict, List, Sequence

import cv2
import numpy as np
from PIL import Image


DETECTOR_MODEL_ID = "HoopitAI/video-deepfake-detection-GenD_CLIP_L_14_FF"
DETECTOR_REVISION = "8d227ed2ef40f8014dbac19aed9dbf7892ee1a7a"
FAKE_INDICATOR_THRESHOLD = 0.5
MAX_FACE_CROPS = 12


@lru_cache(maxsize=1)
def _load_detector() -> Any:
	from transformers import AutoModel

	model = AutoModel.from_pretrained(
		DETECTOR_MODEL_ID,
		revision=DETECTOR_REVISION,
		trust_remote_code=True,
		use_safetensors=True,
	)
	model.eval()
	return model


def _face_crops(
	frames: Sequence[Any],
	frame_indices: Sequence[int],
) -> tuple[List[tuple[int, Image.Image]], bool]:
	classifier = cv2.CascadeClassifier(
		cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
	)
	if classifier.empty():
		raise RuntimeError("OpenCV's frontal-face cascade could not be loaded.")

	crops: List[tuple[int, Image.Image]] = []
	truncated = False
	for frame, frame_index in zip(frames, frame_indices):
		if frame is None or not isinstance(frame, np.ndarray) or frame.size == 0:
			continue
		gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		faces = classifier.detectMultiScale(
			gray,
			scaleFactor=1.1,
			minNeighbors=4,
			minSize=(40, 40),
		)
		for x, y, width, height in faces:
			if len(crops) >= MAX_FACE_CROPS:
				truncated = True
				return crops, truncated
			padding = round(max(width, height) * 0.15)
			left = max(0, x - padding)
			top = max(0, y - padding)
			right = min(frame.shape[1], x + width + padding)
			bottom = min(frame.shape[0], y + height + padding)
			crop = cv2.cvtColor(frame[top:bottom, left:right], cv2.COLOR_BGR2RGB)
			crops.append((frame_index, Image.fromarray(crop)))
	return crops, truncated


def analyze_face_deepfakes(
	frames: Sequence[Any],
	frame_indices: Sequence[int],
) -> Dict[str, Any]:
	"""Return per-face deepfake probabilities without claiming authenticity."""
	try:
		crops, truncated = _face_crops(frames, frame_indices)
	except (IndexError, OSError, RuntimeError, TypeError, ValueError, cv2.error) as exception:
		return {
			"status": "unavailable",
			"predictions": [],
			"limitations": [
				f"Face deepfake preprocessing failed: {type(exception).__name__}: {exception}"
			],
		}

	if not crops:
		return {
			"status": "no_faces",
			"predictions": [],
			"limitations": [
				"No faces were detected in the sampled frames; face manipulation could not be assessed."
			],
		}

	try:
		import torch

		model = _load_detector()
		predictions = []
		for face_index, (frame_index, crop) in enumerate(crops):
			input_tensor = model.feature_extractor.preprocess(crop).unsqueeze(0)
			with torch.inference_mode():
				probabilities = torch.softmax(model(input_tensor), dim=-1)[0]
			fake_probability = float(probabilities[1].item())
			if not 0.0 <= fake_probability <= 1.0:
				raise ValueError("The detector returned a score outside [0, 1].")
			predictions.append(
				{
					"frame_index": frame_index,
					"face_index": face_index,
					"face_manipulation_probability": fake_probability,
					"indicator_threshold": FAKE_INDICATOR_THRESHOLD,
				}
			)
	except (
		AttributeError,
		ImportError,
		IndexError,
		KeyError,
		OSError,
		RuntimeError,
		SyntaxError,
		TypeError,
		ValueError,
	) as exception:
		return {
			"status": "unavailable",
			"predictions": [],
			"limitations": [
				f"Face deepfake detector unavailable: {type(exception).__name__}: {exception}"
			],
		}

	limitations = [
		"Faces were cropped with OpenCV Haar detection, not landmark-aligned as expected by the model; this may reduce reliability."
	]
	if truncated:
		limitations.append(
			f"Face analysis was capped at {MAX_FACE_CROPS} crops."
		)
	return {
		"status": "completed",
		"predictions": predictions,
		"limitations": limitations,
	}
