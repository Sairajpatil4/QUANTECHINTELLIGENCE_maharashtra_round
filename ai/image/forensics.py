"""Image forensic and manipulation-indicator analysis helpers."""

from typing import List, Tuple


def analyze_forensics() -> Tuple[List[dict], List[str]]:
	"""Report unavailable forensic checks without inventing detector signals."""
	return [], [
		"No dedicated image manipulation or AI-generation detector is configured."
	]