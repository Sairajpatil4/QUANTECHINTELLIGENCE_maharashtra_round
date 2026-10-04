"""Image evidence analysis entry point."""

import base64
import json
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.request import Request, urlopen

from PIL import Image

from ai.fusion.schemas import Evidence
from ai.image.forensics import analyze_forensics
from ai.image.metadata import extract_image_metadata


DEFAULT_MODEL = "gemma3:4b"
DEFAULT_OLLAMA_URL = "http://localhost:11434/api/chat"
CONTEXT_FORMAT = {
	"type": "object",
	"properties": {
		"objects": {"type": "array", "items": {"type": "string"}},
		"scene": {"type": "string"},
		"location_hint": {"type": ["string", "null"]},
		"timestamp_hint": {"type": ["string", "null"]},
		"entities": {"type": "array", "items": {"type": "string"}},
	},
	"required": ["objects", "scene", "location_hint", "timestamp_hint", "entities"],
	"additionalProperties": False,
}


def _image_for_model(image_path: Path) -> str:
	with Image.open(image_path) as image:
		image.thumbnail((1280, 1280))
		if image.mode not in ("RGB", "L"):
			image = image.convert("RGB")
		buffer = BytesIO()
		image.save(buffer, format="JPEG", quality=85)
	return base64.b64encode(buffer.getvalue()).decode("ascii")


def _optional_hint(value: Any) -> Optional[str]:
	if value is None:
		return None
	if not isinstance(value, str):
		return value
	if value.strip().lower() in {"", "null", "none", "unknown", "n/a"}:
		return None
	return value.strip()


def _analyze_visual_context(
	image_path: Path,
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
					"Describe only visible image content. Do not infer authenticity, "
					"provenance, or facts that cannot be seen. Use null for unknown "
					"location or time hints."
				),
			},
			{
				"role": "user",
				"content": "Return concise visual context for this image.",
				"images": [_image_for_model(image_path)],
			},
		],
	}
	request = Request(
		ollama_url,
		data=json.dumps(request_body).encode("utf-8"),
		headers={"Content-Type": "application/json"},
		method="POST",
	)
	with urlopen(request, timeout=90) as response:
		ollama_response = json.loads(response.read().decode("utf-8"))
	context = json.loads(ollama_response["message"]["content"])
	if not isinstance(context, dict):
		raise ValueError("The model response was not a JSON object.")

	objects = context.get("objects")
	scene = context.get("scene")
	entities = context.get("entities")
	location_hint = _optional_hint(context.get("location_hint"))
	timestamp_hint = _optional_hint(context.get("timestamp_hint"))
	if not isinstance(objects, list) or not all(isinstance(item, str) for item in objects):
		raise ValueError("The model returned invalid objects.")
	if not isinstance(scene, str) or not isinstance(entities, list):
		raise ValueError("The model returned invalid scene context.")
	if not all(isinstance(item, str) for item in entities):
		raise ValueError("The model returned invalid entities.")
	if location_hint is not None and not isinstance(location_hint, str):
		raise ValueError("The model returned an invalid location hint.")
	if timestamp_hint is not None and not isinstance(timestamp_hint, str):
		raise ValueError("The model returned an invalid timestamp hint.")

	return {
		"objects": objects,
		"scene": scene,
		"location_hint": location_hint,
		"timestamp_hint": timestamp_hint,
		"entities": entities,
	}


def analyze_image(
	image_path: str,
	evidence_id: str,
	model: str = DEFAULT_MODEL,
	ollama_url: str = DEFAULT_OLLAMA_URL,
) -> Evidence:
	"""Analyze image metadata and visual context as common TrustLayer evidence."""
	path = Path(image_path)
	evidence: Dict[str, Any] = {
		"evidence_id": evidence_id,
		"type": "image",
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

	try:
		evidence["metadata"].update(extract_image_metadata(str(path)))
	except (OSError, ValueError):
		evidence["limitations"].append("The file is not a supported, readable image.")
		return Evidence.model_validate(evidence)

	_, forensic_limitations = analyze_forensics()
	evidence["limitations"].extend(forensic_limitations)

	try:
		evidence["semantic_context"] = _analyze_visual_context(
			path,
			model,
			ollama_url,
		)
		evidence["limitations"].append(
			"Gemma visual descriptions may be inaccurate and are not authenticity findings."
		)
	except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError):
		evidence["limitations"].append(
			"Ollama visual-context analysis was unavailable or returned an invalid response."
		)

	metadata = evidence["metadata"]
	context = evidence["semantic_context"]
	latitude = metadata.get("gps_latitude")
	longitude = metadata.get("gps_longitude")
	if latitude is not None and longitude is not None:
		context["location_hint"] = f"{latitude:.6f}, {longitude:.6f} (EXIF GPS)"
		evidence["limitations"].append(
			"EXIF GPS coordinates may be missing or altered and were not independently verified."
		)
	if metadata.get("created_at"):
		context["timestamp_hint"] = metadata["created_at"]
		evidence["limitations"].append(
			"EXIF capture time may be missing or altered and may not include a time zone."
		)

	return Evidence.model_validate(evidence)

