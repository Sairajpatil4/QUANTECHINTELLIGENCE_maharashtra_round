"""Video evidence analysis entry point."""

import base64
import json
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.request import Request, urlopen

import cv2
from PIL import Image

from ai.fusion.schemas import Evidence, EvidenceSignal
from ai.video.forensics import (
	DETECTOR_MODEL_ID,
	FAKE_INDICATOR_THRESHOLD,
	analyze_face_deepfakes,
)


DEFAULT_MODEL = "gemma3:4b"
DEFAULT_OLLAMA_URL = "http://localhost:11434/api/chat"
MAX_SAMPLED_FRAMES = 3
CONTEXT_FORMAT = {
	"type": "object",
	"properties": {
		"objects": {"type": "array", "items": {"type": "string"}},
		"entities": {"type": "array", "items": {"type": "string"}},
		"scene": {"type": ["string", "null"]},
		"location_hint": {"type": ["string", "null"]},
		"timestamp_hint": {"type": ["string", "null"]},
		"claims": {"type": "array", "items": {"type": "string"}},
	},
	"required": [
		"objects",
		"entities",
		"scene",
		"location_hint",
		"timestamp_hint",
		"claims",
	],
	"additionalProperties": False,
}


def _sample_indices(frame_count: int) -> List[int]:
	if frame_count <= 0:
		return []
	if frame_count <= MAX_SAMPLED_FRAMES:
		return list(range(frame_count))
	return sorted(
		{
			round(index * (frame_count - 1) / (MAX_SAMPLED_FRAMES - 1))
			for index in range(MAX_SAMPLED_FRAMES)
		}
	)


def _frame_to_base64(frame_bgr: Any) -> str:
	frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
	image = Image.fromarray(frame_rgb)
	image.thumbnail((960, 960))
	buffer = BytesIO()
	image.save(buffer, format="JPEG", quality=82)
	return base64.b64encode(buffer.getvalue()).decode("ascii")


def _analyze_sampled_frames(
	frames: List[Any],
	model: str,
	ollama_url: str,
) -> Dict[str, Any]:
	request_body = {
		"model": model,
		"stream": False,
		"format": CONTEXT_FORMAT,
		"options": {"temperature": 0},
		"messages": [
			{
				"role": "system",
				"content": (
					"Describe the visible content across these representative video frames. "
					"Do not judge authenticity or infer facts that are not visible. Use "
					"null for unknown location and timestamp, and leave claims empty."
				),
			},
			{
				"role": "user",
				"content": "Return visual context for these sampled frames in order.",
				"images": [_frame_to_base64(frame) for frame in frames],
			},
		],
	}
	request = Request(
		ollama_url,
		data=json.dumps(request_body).encode("utf-8"),
		headers={"Content-Type": "application/json"},
		method="POST",
	)
	with urlopen(request, timeout=120) as response:
		ollama_response = json.loads(response.read().decode("utf-8"))
	context = json.loads(ollama_response["message"]["content"])
	if not isinstance(context, dict):
		raise ValueError("The model response was not a JSON object.")

	objects = context.get("objects")
	entities = context.get("entities")
	claims = context.get("claims")
	scene = context.get("scene")
	location_hint = context.get("location_hint")
	timestamp_hint = context.get("timestamp_hint")
	if not isinstance(objects, list) or not all(isinstance(item, str) for item in objects):
		raise ValueError("The model returned invalid objects.")
	if not isinstance(entities, list) or not all(isinstance(item, str) for item in entities):
		raise ValueError("The model returned invalid entities.")
	if not isinstance(claims, list) or not all(isinstance(item, str) for item in claims):
		raise ValueError("The model returned invalid claims.")
	if scene is not None and not isinstance(scene, str):
		raise ValueError("The model returned an invalid scene.")
	if location_hint is not None and not isinstance(location_hint, str):
		raise ValueError("The model returned an invalid location hint.")
	if timestamp_hint is not None and not isinstance(timestamp_hint, str):
		raise ValueError("The model returned an invalid timestamp hint.")

	return {
		"objects": objects,
		"entities": entities,
		"scene": scene,
		"location_hint": _normalize_hint(location_hint),
		"timestamp_hint": _normalize_hint(timestamp_hint),
		"claims": claims,
	}


def _normalize_hint(value: Optional[str]) -> Optional[str]:
	if value is None or value.strip().lower() in {"", "null", "none", "unknown", "n/a"}:
		return None
	return value.strip()


def analyze_video(
	*,
	evidence_id: str,
	file_path: str,
	model: str = DEFAULT_MODEL,
	ollama_url: str = DEFAULT_OLLAMA_URL,
) -> Evidence:
	"""Analyze video metadata and sampled-frame visual context as Evidence."""
	path = Path(file_path)
	evidence: Dict[str, Any] = {
		"evidence_id": evidence_id,
		"type": "video",
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
		evidence["limitations"].append("The video file does not exist or is not a regular file.")
		return Evidence.model_validate(evidence)

	capture = cv2.VideoCapture(str(path))
	if not capture.isOpened():
		capture.release()
		evidence["limitations"].append("The file is not a supported, readable video.")
		return Evidence.model_validate(evidence)

	try:
		frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
		fps = float(capture.get(cv2.CAP_PROP_FPS))
		width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
		height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
		sample_indices = _sample_indices(frame_count)
		frames = []
		for frame_index in sample_indices:
			capture.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
			read_ok, frame = capture.read()
			if read_ok and frame is not None:
				frames.append(frame)
	finally:
		capture.release()

	file_size = path.stat().st_size
	evidence["metadata"].update(
		{
			"format": path.suffix.lstrip(".").upper() or None,
			"file_size": file_size,
			"duration_seconds": round(frame_count / fps, 3) if fps > 0 else None,
			"width": width or None,
			"height": height or None,
			"fps": fps if fps > 0 else None,
			"frame_count": frame_count if frame_count > 0 else None,
			"sampled_frame_indices": [
				index for index, frame in zip(sample_indices, frames)
			],
		}
	)
	if not frames:
		evidence["limitations"].append("No readable frames could be sampled from the video.")
		return Evidence.model_validate(evidence)

	evidence["limitations"].append(
		f"Visual context was analyzed from {len(frames)} representative frames, not every frame."
	)
	detector_result = analyze_face_deepfakes(frames, evidence["metadata"]["sampled_frame_indices"])
	predictions = detector_result["predictions"]
	evidence["metadata"]["face_deepfake_detector"] = {
		"model": DETECTOR_MODEL_ID,
		"status": detector_result["status"],
		"predictions": predictions,
		"indicator_threshold": FAKE_INDICATOR_THRESHOLD,
	}
	evidence["limitations"].extend(detector_result["limitations"])
	evidence["limitations"].append(
		"The detector only assesses face manipulation; it does not detect fully AI-generated text-to-video."
	)
	evidence["limitations"].append(
		"Detector scores are not calibrated authenticity probabilities; low scores do not establish that a video is authentic."
	)
	evidence["signals"].extend(
		EvidenceSignal(
			name="Face manipulation indicator",
			category="face_manipulation",
			severity=(
				"high"
				if prediction["face_manipulation_probability"] >= 0.75
				else "medium"
			),
			confidence=prediction["face_manipulation_probability"],
			value=prediction,
			description="The local detector score met its face-manipulation indicator threshold for a sampled face.",
			source=DETECTOR_MODEL_ID,
		)
		for prediction in predictions
		if prediction["face_manipulation_probability"] >= FAKE_INDICATOR_THRESHOLD
	)
	try:
		evidence["semantic_context"] = _analyze_sampled_frames(
			frames,
			model,
			ollama_url,
		)
		evidence["limitations"].append(
			"Gemma frame descriptions may be inaccurate and are not authenticity findings."
		)
	except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError):
		evidence["limitations"].append(
			"Ollama frame-context analysis was unavailable or returned an invalid response."
		)

	return Evidence.model_validate(evidence)