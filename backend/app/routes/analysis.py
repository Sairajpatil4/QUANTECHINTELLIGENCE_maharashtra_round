import json
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter

from app.database import get_connection
from app.errors import APIError
from app.schemas.evidence import AnalysisResult, StructuredEvidence
from app.services.integrations import IntegrationUnavailable, get_analyzer, get_fusion


router = APIRouter(prefix="/investigations", tags=["Analysis"])

_LEGACY_IMAGE_DETECTOR_LIMITATION = (
	"No dedicated image manipulation or AI-generation detector is configured."
)


def _now() -> str:
	return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _empty_result(
	investigation_id: str,
	status: str,
	limitations: list[str],
) -> AnalysisResult:
	return AnalysisResult(
		investigation_id=investigation_id,
		status=status,
		assessment={},
		evidence=[],
		findings=[],
		limitations=limitations,
		evidence_graph={"nodes": [], "edges": []},
	)


def _save_result(result: AnalysisResult) -> None:
	serialized = json.dumps(result.model_dump(mode="json", by_alias=True))
	updated_at = _now()
	with closing(get_connection()) as connection:
		connection.execute(
			"""
			INSERT INTO analysis_results (
				investigation_id, status, result_json, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(investigation_id) DO UPDATE SET
				status = excluded.status,
				result_json = excluded.result_json,
				updated_at = excluded.updated_at
			""",
			(
				result.investigation_id,
				result.status,
				serialized,
				updated_at,
				updated_at,
			),
		)
		connection.execute(
			"UPDATE investigations SET status = ? WHERE investigation_id = ?",
			(result.status, result.investigation_id),
		)
		connection.commit()


@router.post("/{investigation_id}/analyze", response_model=AnalysisResult)
def analyze_investigation(investigation_id: str) -> AnalysisResult:
	with closing(get_connection()) as connection:
		investigation = connection.execute(
			"SELECT 1 FROM investigations WHERE investigation_id = ?",
			(investigation_id,),
		).fetchone()
		evidence_rows = connection.execute(
			"""
			SELECT evidence_id, investigation_id, type, filename, file_path, status
			FROM evidence WHERE investigation_id = ? ORDER BY created_at, evidence_id
			""",
			(investigation_id,),
		).fetchall()

	if investigation is None:
		raise APIError(404, "invalid_investigation", "Investigation not found.")

	with closing(get_connection()) as connection:
		connection.execute(
			"UPDATE investigations SET status = 'processing' WHERE investigation_id = ?",
			(investigation_id,),
		)
		connection.execute(
			"UPDATE evidence SET status = 'processing' WHERE investigation_id = ?",
			(investigation_id,),
		)
		connection.commit()

	limitations: list[str] = []
	analyzed_evidence: list[StructuredEvidence] = []
	failed_evidence_ids: set[str] = set()
	missing_file = False
	fatal_integration_error = False

	if not evidence_rows:
		limitations.append("No evidence has been uploaded for this investigation.")

	for row in evidence_rows:
		file_path = Path(row["file_path"])
		if not file_path.is_file():
			missing_file = True
			failed_evidence_ids.add(row["evidence_id"])
			limitations.append(
				f"The uploaded file for evidence {row['evidence_id']} is missing from storage."
			)
			continue

		try:
			structured = get_analyzer().analyze(
				evidence_id=row["evidence_id"],
				file_path=row["file_path"],
				evidence_type=row["type"],
			)
			if not isinstance(structured, StructuredEvidence):
				structured = StructuredEvidence.model_validate(structured)
			if (
				structured.evidence_id != row["evidence_id"]
				or structured.evidence_type != row["type"]
			):
				raise ValueError("Analyzer output did not match the supplied evidence.")
			structured.filename = row["filename"]
			analyzed_evidence.append(structured)
		except IntegrationUnavailable as exception:
			failed_evidence_ids.add(row["evidence_id"])
			limitations.append(str(exception))
		except Exception:
			failed_evidence_ids.add(row["evidence_id"])
			fatal_integration_error = True
			limitations.append(
				f"The analyzer failed for evidence {row['evidence_id']}; no analysis output was accepted."
			)

	if evidence_rows and len(evidence_rows) == 1:
		limitations.append(
			"Cross-modal verification was unavailable because only one evidence source was provided. Add an independent source, such as a related transcript, video, or second image, to enable comparisons."
		)
	if failed_evidence_ids and analyzed_evidence:
		limitations.append("Analysis is incomplete because one or more evidence items could not be analyzed.")

	if analyzed_evidence:
		try:
			result = get_fusion().fuse(
				investigation_id=investigation_id,
				evidence=analyzed_evidence,
			)
			if not isinstance(result, AnalysisResult):
				result = AnalysisResult.model_validate(result)
			if result.investigation_id != investigation_id:
				raise ValueError("Fusion output did not match the investigation.")
			result.evidence = analyzed_evidence
			result.limitations.extend(
				limitation for limitation in limitations if limitation not in result.limitations
			)
			if failed_evidence_ids:
				result.status = "failed"
		except IntegrationUnavailable as exception:
			limitations.append(str(exception))
			result = _empty_result(investigation_id, "failed", limitations)
			result.evidence = analyzed_evidence
		except Exception:
			fatal_integration_error = True
			limitations.append("Evidence fusion failed; no final assessment was produced.")
			result = _empty_result(investigation_id, "failed", limitations)
			result.evidence = analyzed_evidence
	else:
		if evidence_rows:
			limitations.append("Fusion was not run because no analyzer produced structured evidence.")
		result = _empty_result(investigation_id, "failed", limitations)

	with closing(get_connection()) as connection:
		for row in evidence_rows:
			status = "failed" if row["evidence_id"] in failed_evidence_ids else "completed"
			connection.execute(
				"UPDATE evidence SET status = ? WHERE evidence_id = ?",
				(status, row["evidence_id"]),
			)
		connection.commit()
	_save_result(result)

	if missing_file:
		raise APIError(404, "missing_file", "One or more uploaded evidence files are missing.")
	if fatal_integration_error:
		raise APIError(
			503,
			"analysis_failed",
			"An analysis integration failed. Retrieve results for the recorded limitation.",
		)
	return result


@router.get("/{investigation_id}/results", response_model=AnalysisResult)
def get_analysis_results(investigation_id: str) -> AnalysisResult:
	with closing(get_connection()) as connection:
		investigation = connection.execute(
			"SELECT status FROM investigations WHERE investigation_id = ?",
			(investigation_id,),
		).fetchone()
		stored = connection.execute(
			"SELECT result_json FROM analysis_results WHERE investigation_id = ?",
			(investigation_id,),
		).fetchone()

	if investigation is None:
		raise APIError(404, "invalid_investigation", "Investigation not found.")
	if stored is not None:
		result = AnalysisResult.model_validate_json(stored["result_json"])
		for item in result.evidence:
			if _LEGACY_IMAGE_DETECTOR_LIMITATION in item.limitations:
				item.limitations = [
					limitation
					for limitation in item.limitations
					if limitation != _LEGACY_IMAGE_DETECTOR_LIMITATION
				]
				item.limitations.append(
					"This saved result predates the configured AI-generation classifier. Run the investigation again to analyze this image with the current backend."
				)
		return result

	return _empty_result(
		investigation_id,
		investigation["status"],
		["Analysis has not been run for this investigation."],
	)
