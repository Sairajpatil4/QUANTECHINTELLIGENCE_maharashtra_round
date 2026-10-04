"""Audio evidence analysis with a local AI-generated speech detector."""

from functools import lru_cache
from pathlib import Path
import sys
from typing import Any, Dict, Optional

import numpy as np
import soundfile as sf
import torch
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

from ai.fusion.schemas import Evidence, EvidenceSignal
from ai.audio.speech import analyze_acoustic_chunks


DETECTOR_MODEL_ID = "Hemgg/Deepfake-audio-detection"
DETECTOR_REVISION = "0d75271368ef2c7efd14831dc503c431f6aab0eb"
TARGET_SAMPLE_RATE = 16_000
CHUNK_SECONDS = 10
MAX_ANALYZED_SECONDS = 60
AI_INDICATOR_THRESHOLD = 0.5
DEFAULT_MODEL = "gemma3:4b"
DEFAULT_OLLAMA_URL = "http://localhost:11434/api/chat"


@lru_cache(maxsize=1)
def _load_detector() -> tuple[Any, Any]:
	feature_extractor = AutoFeatureExtractor.from_pretrained(
		DETECTOR_MODEL_ID,
		revision=DETECTOR_REVISION,
	)
	model = AutoModelForAudioClassification.from_pretrained(
		DETECTOR_MODEL_ID,
		revision=DETECTOR_REVISION,
		use_safetensors=True,
	)
	model.eval()
	return feature_extractor, model


def _resample_audio(audio: np.ndarray, sample_rate: int) -> np.ndarray:
	if sample_rate <= 0:
		raise ValueError("Audio sample rate must be positive.")
	if audio.ndim != 1 or audio.size == 0:
		raise ValueError("Audio contains no usable samples.")
	if sample_rate == TARGET_SAMPLE_RATE:
		return audio.astype(np.float32, copy=False)

	duration = audio.size / sample_rate
	source_times = np.arange(audio.size, dtype=np.float64) / sample_rate
	target_count = round(duration * TARGET_SAMPLE_RATE)
	target_times = np.arange(target_count, dtype=np.float64) / TARGET_SAMPLE_RATE
	return np.interp(target_times, source_times, audio).astype(np.float32)


def _ai_label_index(model: Any) -> int:
	id2label = model.config.id2label
	labels = {
		int(index): str(label).strip().lower().replace("_", "").replace("-", "")
		for index, label in id2label.items()
	}
	matches = [
		index
		for index, label in labels.items()
		if label in {"aivoice", "aigenerated", "synthetic", "fake", "spoof"}
		or ("ai" in label and "voice" in label)
	]
	if len(matches) != 1:
		raise ValueError("The audio detector does not expose one unambiguous AI-voice class.")
	return matches[0]


def _detect_ai_speech(audio: np.ndarray) -> Dict[str, Any]:
	try:
		feature_extractor, model = _load_detector()
		ai_index = _ai_label_index(model)
		human_indices = [
			int(index)
			for index, label in model.config.id2label.items()
			if int(index) != ai_index
			and any(term in str(label).lower() for term in ("human", "real", "bonafide"))
		]
		if len(human_indices) != 1:
			raise ValueError("The audio detector does not expose one human-voice class.")

		chunk_samples = CHUNK_SECONDS * TARGET_SAMPLE_RATE
		predictions = []
		for chunk_index, start in enumerate(range(0, audio.size, chunk_samples)):
			chunk = audio[start : start + chunk_samples]
			inputs = feature_extractor(
				chunk,
				sampling_rate=TARGET_SAMPLE_RATE,
				return_tensors="pt",
			)
			with torch.inference_mode():
				logits = model(**inputs).logits
			probabilities = torch.softmax(logits, dim=-1)[0]
			ai_probability = float(probabilities[ai_index].item())
			human_probability = float(probabilities[human_indices[0]].item())
			if not 0.0 <= ai_probability <= 1.0:
				raise ValueError("The audio detector returned a score outside [0, 1].")
			predictions.append(
				{
					"chunk_index": chunk_index,
					"start_seconds": round(start / TARGET_SAMPLE_RATE, 3),
					"duration_seconds": round(chunk.size / TARGET_SAMPLE_RATE, 3),
					"ai_speech_score": ai_probability,
					"human_speech_score": human_probability,
				}
			)

		if not predictions:
			raise ValueError("No audio chunks were available for detector inference.")
		mean_score = sum(item["ai_speech_score"] for item in predictions) / len(predictions)
		return {
			"status": "completed",
			"score": mean_score,
			"indicator": (
				"ai_speech_indicator"
				if mean_score >= AI_INDICATOR_THRESHOLD
				else "no_ai_speech_indicator_detected"
			),
			"threshold": AI_INDICATOR_THRESHOLD,
			"predictions": predictions,
			"limitations": [],
		}
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
		return {
			"status": "unavailable",
			"score": None,
			"indicator": None,
			"threshold": AI_INDICATOR_THRESHOLD,
			"predictions": [],
			"limitations": [
				f"AI-speech detector unavailable: {type(exception).__name__}: {exception}"
			],
		}


def analyze_audio(
	file_path: str,
	evidence_id: str,
) -> Evidence:
	"""Analyze audio metadata and emit a scoped AI-speech detector signal."""
	path = Path(file_path)
	evidence: Dict[str, Any] = {
		"evidence_id": evidence_id,
		"type": "audio",
		"metadata": {"filename": path.name},
		"signals": [],
		"semantic_context": {
			"objects": [],
			"entities": [],
			"scene": None,
			"location_hint": None,
			"timestamp_hint": None,
			"claims": [],
		},
		"limitations": [],
	}
	if not path.is_file():
		evidence["limitations"].append(
			"The audio file does not exist or is not a regular file."
		)
		return Evidence.model_validate(evidence)

	try:
		audio, sample_rate = sf.read(path, dtype="float32", always_2d=True)
	except (OSError, RuntimeError, sf.LibsndfileError) as exception:
		evidence["limitations"].append(
			f"The audio file could not be decoded: {type(exception).__name__}: {exception}"
		)
		return Evidence.model_validate(evidence)

	if audio.shape[0] == 0 or sample_rate <= 0:
		evidence["limitations"].append("The audio file contains no readable samples.")
		return Evidence.model_validate(evidence)

	original_duration = audio.shape[0] / sample_rate
	evidence["metadata"].update(
		{
			"format": path.suffix.lstrip(".").upper() or None,
			"file_size": path.stat().st_size,
			"duration_seconds": round(original_duration, 3),
			"sample_rate": int(sample_rate),
			"channels": int(audio.shape[1]),
		}
	)
	mono = np.mean(audio, axis=1, dtype=np.float32)
	try:
		mono = _resample_audio(mono, int(sample_rate))
	except ValueError as exception:
		evidence["limitations"].append(f"Audio preprocessing failed: {exception}")
		return Evidence.model_validate(evidence)

	max_samples = MAX_ANALYZED_SECONDS * TARGET_SAMPLE_RATE
	truncated = mono.size > max_samples
	analysis_audio = mono[:max_samples]
	acoustic_chunks = analyze_acoustic_chunks(
		analysis_audio,
		chunk_seconds=CHUNK_SECONDS,
	)
	evidence["metadata"]["acoustic_features"] = {
		"method": "frame-based signal measurements; descriptive only, not AI-origin indicators",
		"chunks": acoustic_chunks,
	}
	detector = _detect_ai_speech(analysis_audio)
	evidence["metadata"]["ai_speech_detector"] = {
		"model": DETECTOR_MODEL_ID,
		"revision": DETECTOR_REVISION,
		**detector,
	}
	evidence["limitations"].extend(detector["limitations"])
	if truncated:
		evidence["limitations"].append(
			f"Only the first {MAX_ANALYZED_SECONDS} seconds were analyzed."
		)
	evidence["limitations"].append(
		"The detector targets speech and was reported trained on a multi-ethnic English voice dataset; it is not validated for music, non-speech audio, or all languages."
	)
	evidence["limitations"].append(
		"Model scores are not calibrated probabilities; failure to detect an AI-speech indicator does not prove the audio is human-generated."
	)
	evidence["limitations"].append(
		"Acoustic measurements describe signal properties and are not evidence of AI or human origin by themselves."
	)
	if detector["status"] == "completed" and detector["score"] >= AI_INDICATOR_THRESHOLD:
		evidence["signals"].append(
			EvidenceSignal(
				name="AI-generated speech indicator",
				category="ai_generated_speech",
				severity=(
					"high" if detector["score"] >= 0.75 else "medium"
				),
				confidence=detector["score"],
				value={
					"mean_ai_speech_score": detector["score"],
					"threshold": detector["threshold"],
					"chunks_above_threshold": sum(
						item["ai_speech_score"] >= AI_INDICATOR_THRESHOLD
						for item in detector["predictions"]
					),
					"chunks_analyzed": len(detector["predictions"]),
				},
				description=(
					"The local speech detector produced an AI-voice score at or "
					"above its indicator threshold."
				),
				source=DETECTOR_MODEL_ID,
			)
		)
	return Evidence.model_validate(evidence)


def main() -> int:
	import argparse

	parser = argparse.ArgumentParser(description="Analyze audio as TrustLayer evidence.")
	parser.add_argument("file_path", type=Path)
	parser.add_argument("--evidence-id", default="ev_audio_test_001")
	args = parser.parse_args()
	result = analyze_audio(str(args.file_path), args.evidence_id)
	print(result.model_dump_json(indent=2))
	return 0


if __name__ == "__main__":
	sys.exit(main())
