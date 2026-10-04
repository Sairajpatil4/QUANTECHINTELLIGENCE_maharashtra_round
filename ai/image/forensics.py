"""Image AI-generation analysis helper."""

from functools import lru_cache
from typing import Any, Dict, List, Tuple

from PIL import Image


DETECTOR_MODEL_ID = "dima806/ai_vs_human_generated_image_detection"
DETECTOR_REVISION = "341594f2b003d185db789becf48a2286c177b926"
AI_GENERATION_THRESHOLD = 0.9


@lru_cache(maxsize=1)
def _load_detector() -> Any:
	from transformers import pipeline

	return pipeline(
		"image-classification",
		model=DETECTOR_MODEL_ID,
		revision=DETECTOR_REVISION,
	)


def _ai_generated_score(predictions: List[Dict[str, Any]]) -> float:
	ai_scores = [
		float(prediction["score"])
		for prediction in predictions
		if str(prediction.get("label", "")).strip().lower()
		in {"ai-generated", "ai generated", "fake", "synthetic"}
	]
	if len(ai_scores) != 1:
		raise ValueError("The image detector did not return one unambiguous AI-generated class.")
	return ai_scores[0]


def analyze_forensics(image_path: str) -> Tuple[List[Dict[str, Any]], List[str]]:
	"""Return an AI-generation classifier signal, not a localized-tampering verdict."""
	try:
		classifier = _load_detector()
		with Image.open(image_path) as image:
			predictions = classifier(image.convert("RGB"), top_k=None)
		score = _ai_generated_score(predictions)
		if not 0.0 <= score <= 1.0:
			raise ValueError("The image detector returned a score outside [0, 1].")
	except (
		AttributeError,
		ImportError,
		IndexError,
		KeyError,
		OSError,
		RuntimeError,
		TypeError,
		ValueError,
	) as exception:
		return [], [
			"The pinned AI-generation image classifier could not run. Check network access, model dependencies, and the underlying runtime error: "
			f"{type(exception).__name__}: {exception}"
		]

	severity = "high" if score >= AI_GENERATION_THRESHOLD else "low"
	return [
		{
			"name": "AI-generated image classifier score",
			"category": "ai_generation",
			"severity": severity,
			"confidence": score,
			"value": {
				"ai_generated_class_score": score,
				"indicator_threshold": AI_GENERATION_THRESHOLD,
			},
			"description": (
				"The image classifier score is an uncalibrated AI-generation indicator, "
				"not proof that the image is fabricated."
			),
			"source": DETECTOR_MODEL_ID,
		}
	], [
		"The AI-vs-human classifier was fine-tuned on a finite dataset; its model card notes possible overfitting and distribution shift.",
		"This classifier screens for AI-generated imagery and does not detect localized edits, splicing, or copy-move manipulation.",
		"The classifier score is uncalibrated and is not the probability that the image is fake.",
	]
