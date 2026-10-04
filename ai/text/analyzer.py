"""Text evidence analysis entry point."""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen

from ai.fusion.schemas import Evidence, SemanticContext


DEFAULT_MODEL = "gemma3:4b"
DEFAULT_OLLAMA_URL = "http://localhost:11434/api/chat"
SOURCE = "gemma_text"
ALLOWED_SEVERITIES = {"low", "medium", "high"}
SIGNAL_NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,79}$")
OUTPUT_FORMAT = {
    "type": "object",
    "properties": {
        "signals": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "pattern": "^[a-z][a-z0-9_]{0,79}$",
                    },
                    "category": {"type": "string"},
                    "severity": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                    },
                    "confidence": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                    },
                    "value": {"type": "string"},
                    "description": {"type": "string"},
                },
                "required": [
                    "name",
                    "category",
                    "severity",
                    "confidence",
                    "value",
                    "description",
                ],
                "additionalProperties": False,
            },
        },
        "semantic_context": {
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
        },
    },
    "required": ["signals", "semantic_context"],
    "additionalProperties": False,
}


def _base_evidence(evidence_id: str, filename: Optional[str]) -> Dict[str, Any]:
    return {
        "evidence_id": evidence_id,
        "type": "text",
        "metadata": {"filename": filename} if filename else {},
        "signals": [],
        "semantic_context": SemanticContext().model_dump(mode="python"),
        "limitations": [],
    }


def _normalize_signal(candidate: Any) -> Optional[Dict[str, Any]]:
    if not isinstance(candidate, dict):
        return None

    name = candidate.get("name")
    category = candidate.get("category")
    severity = candidate.get("severity")
    confidence = candidate.get("confidence")
    value = candidate.get("value")
    description = candidate.get("description")

    if not isinstance(name, str) or not SIGNAL_NAME_PATTERN.fullmatch(name):
        return None
    if not isinstance(category, str) or not category.strip():
        return None
    if severity not in ALLOWED_SEVERITIES:
        return None
    if isinstance(confidence, bool) or not isinstance(confidence, (int, float)):
        return None
    if not 0.0 <= confidence <= 1.0:
        return None
    if not isinstance(value, str) or not value.strip():
        return None
    if not isinstance(description, str) or not description.strip():
        return None

    return {
        "name": name,
        "category": category.strip(),
        "severity": severity,
        "confidence": float(confidence),
        "value": value.strip(),
        "description": description.strip(),
        "source": SOURCE,
    }


def analyze_text(
    text: str,
    evidence_id: str,
    *,
    filename: Optional[str] = None,
    model: str = DEFAULT_MODEL,
    ollama_url: str = DEFAULT_OLLAMA_URL,
) -> Evidence:
    """Extract claims and semantic context without deciding whether claims are true."""
    evidence = _base_evidence(evidence_id, filename)
    if not text.strip():
        evidence["limitations"].append(
            "Text content is empty; no analysis was performed."
        )
        return Evidence.model_validate(evidence)

    request_body = {
        "model": model,
        "stream": False,
        "format": OUTPUT_FORMAT,
        "options": {"temperature": 0},
        "messages": [
            {
                "role": "system",
                "content": (
                    "Extract explicit claims and semantic context from the supplied "
                    "text. Do not decide whether any claim is true. Only use "
                    "information present in the text. Use empty lists and null for "
                    "unknown fields. Signal confidence describes extraction confidence, "
                    "not claim truth."
                ),
            },
            {
                "role": "user",
                "content": text,
            },
        ],
    }
    request = Request(
        ollama_url,
        data=json.dumps(request_body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=90) as response:
            ollama_response = json.loads(response.read().decode("utf-8"))
        content = json.loads(ollama_response["message"]["content"])
        if not isinstance(content, dict):
            raise ValueError("The model response was not a JSON object.")

        candidates = content.get("signals")
        if not isinstance(candidates, list):
            raise ValueError("The model returned invalid signals.")
        semantic_context = SemanticContext.model_validate(
            content.get("semantic_context")
        )
    except (
        OSError,
        URLError,
        ValueError,
        KeyError,
        TypeError,
        json.JSONDecodeError,
    ):
        evidence["limitations"].append(
            "Ollama text analysis was unavailable or returned an invalid response."
        )
        return Evidence.model_validate(evidence)

    evidence["semantic_context"] = semantic_context.model_dump(mode="python")
    evidence["signals"] = [
        signal
        for candidate in candidates
        if (signal := _normalize_signal(candidate)) is not None
    ]
    if len(evidence["signals"]) != len(candidates):
        evidence["limitations"].append(
            "Some model outputs were omitted because they did not match the Evidence signal schema."
        )
    if evidence["signals"]:
        evidence["limitations"].append(
            "Gemma extraction confidence is uncalibrated and does not indicate claim truth."
        )
    return Evidence.model_validate(evidence)


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze text as TrustLayer evidence.")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--text", help="Text content to analyze.")
    source.add_argument("--file", type=Path, help="UTF-8 text file to analyze.")
    parser.add_argument("--evidence-id", default="ev_txt_test_001")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    args = parser.parse_args()

    filename = None
    if args.file is not None:
        try:
            text = args.file.read_text(encoding="utf-8-sig")
        except OSError as error:
            parser.error(f"cannot read {args.file}: {error}")
        filename = args.file.name
    else:
        text = args.text

    evidence = analyze_text(
        text,
        args.evidence_id,
        filename=filename,
        model=args.model,
    )
    print(evidence.model_dump_json(indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
