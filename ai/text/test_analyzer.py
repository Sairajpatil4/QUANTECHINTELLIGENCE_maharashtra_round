import json
import unittest
from unittest.mock import patch
from urllib.error import URLError

from ai.text.analyzer import analyze_text


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def read(self):
        return json.dumps(self.body).encode("utf-8")


class AnalyzeTextTests(unittest.TestCase):
    @patch("ai.text.analyzer.urlopen")
    def test_returns_contract_signals(self, mocked_urlopen):
        mocked_urlopen.return_value = FakeResponse(
            {
                "message": {
                    "content": json.dumps(
                        {
                            "signals": [
                                {
                                    "name": "location_claim",
                                    "category": "claim",
                                    "severity": "low",
                                    "confidence": 0.93,
                                    "value": "Mumbai",
                                    "description": "Text claims the event occurred in Mumbai.",
                                }
                            ],
                            "semantic_context": {
                                "objects": [],
                                "entities": ["Mumbai"],
                                "scene": None,
                                "location_hint": "Mumbai",
                                "timestamp_hint": "2026-09-14",
                                "claims": ["The event happened in Mumbai."],
                            },
                        }
                    )
                }
            }
        )

        evidence = analyze_text(
            "The event happened in Mumbai.",
            "ev_txt_001",
            filename="claim.txt",
        )

        self.assertEqual(evidence.type, "text")
        self.assertEqual(evidence.metadata["filename"], "claim.txt")
        self.assertEqual(evidence.signals[0].source, "gemma_text")
        self.assertEqual(evidence.signals[0].value, "Mumbai")
        self.assertEqual(evidence.semantic_context.entities, ["Mumbai"])
        self.assertEqual(evidence.semantic_context.claims, ["The event happened in Mumbai."])
        self.assertIn("does not indicate claim truth", evidence.limitations[0])

    @patch("ai.text.analyzer.urlopen", side_effect=URLError("offline"))
    def test_ollama_failure_returns_evidence_with_limitation(self, mocked_urlopen):
        evidence = analyze_text("The event happened in Mumbai.", "ev_txt_002")

        self.assertEqual(evidence.signals, [])
        self.assertTrue(evidence.limitations)

    def test_empty_text_does_not_call_ollama(self):
        with patch("ai.text.analyzer.urlopen") as mocked_urlopen:
            evidence = analyze_text("  ", "ev_txt_003")

        mocked_urlopen.assert_not_called()
        self.assertEqual(evidence.signals, [])
        self.assertTrue(evidence.limitations)


if __name__ == "__main__":
    unittest.main()